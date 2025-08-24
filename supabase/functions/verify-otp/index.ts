// supabase/functions/verify-otp/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

serve(async (req: Request): Promise<Response> => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  // Parse body safely
  let body: VerifyOTPRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { email, otp } = body ?? {};
  if (!email || !otp) {
    return json({ error: "Email and OTP are required" }, 400);
  }

  // Env + clients
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const redirectTo = Deno.env.get("SITE_URL") || Deno.env.get("NEXT_PUBLIC_SITE_URL") || undefined; // optional

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Server configuration error: missing Supabase env" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1) Fetch a valid, unused OTP row
    const nowIso = new Date().toISOString();

    const { data: otpRow, error: otpFetchErr } = await admin
      .from("otp_codes")
      .select("id,email,otp_code,expires_at,used")
      .eq("email", email)
      .eq("otp_code", otp)
      .eq("used", false)
      .gt("expires_at", nowIso)
      .maybeSingle();

    if (otpFetchErr) {
      console.error("OTP fetch error:", otpFetchErr);
      return json({ error: "Database error while checking OTP" }, 500);
    }

    if (!otpRow) {
      return json({ error: "Invalid or expired OTP" }, 400);
    }

    // 2) Atomically consume the OTP (avoid race conditions)
    const { data: consumedRows, error: consumeErr } = await admin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRow.id)
      .eq("used", false) // ensures single-use
      .select("id")
      .maybeSingle();

    if (consumeErr) {
      console.error("OTP consume error:", consumeErr);
      return json({ error: "Failed to consume OTP" }, 500);
    }
    if (!consumedRows) {
      // Someone else consumed it between fetch and update
      return json({ error: "OTP already used" }, 400);
    }

    // 3) Generate a sign-in magic link (login-only; do NOT create user)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (linkErr) {
      // If the user doesn't exist, GoTrue typically responds with an error here.
      // We deliberately do NOT create users in this flow.
      console.error("Generate magic link error:", linkErr);
      const msg = /not found|no user/i.test(linkErr.message || "")
        ? "User does not exist. Please register first."
        : "Failed to generate login link";
      return json({ error: msg }, 400);
    }

    // 4) Best-effort cleanup of expired OTPs (non-critical)
    try {
      await admin.from("otp_codes").delete().lt("expires_at", nowIso);
    } catch (cleanupErr) {
      console.warn("OTP cleanup warning:", cleanupErr);
    }

    // Return the action link so the frontend can redirect the browser to complete sign-in
    const actionLink = linkData?.properties?.action_link ?? null;

    return json(
      {
        success: true,
        message: "OTP verified. Use action_link to complete sign-in.",
        action_link: actionLink,
      },
      200,
    );
  } catch (err: any) {
    console.error("Unhandled verify-otp error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});

// Helper to return JSON with CORS
function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
