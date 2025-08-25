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

    // 2) Mark OTP as used
    const { error: consumeErr } = await admin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRow.id);

    if (consumeErr) {
      console.error("OTP consume error:", consumeErr);
      return json({ error: "Failed to consume OTP" }, 500);
    }

    // 3) Check if user exists and sign them in
    const { data: { user }, error: getUserError } = await admin.auth.admin.getUserByEmail(email);
    
    if (getUserError || !user) {
      return json({ error: "User not found. Please register first." }, 400);
    }

    // 4) Generate a sign-in magic link for existing user
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (linkErr) {
      console.error("Generate magic link error:", linkErr);
      return json({ error: "Failed to generate login link" }, 400);
    }

    // 5) Clean up expired OTPs
    try {
      await admin.from("otp_codes").delete().lt("expires_at", nowIso);
    } catch (cleanupErr) {
      console.warn("OTP cleanup warning:", cleanupErr);
    }

    const actionLink = linkData?.properties?.action_link ?? null;

    return json(
      {
        success: true,
        message: "OTP verified successfully",
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
