import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { email, otp }: VerifyOTPRequest = body;

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if OTP is valid
    const nowIso = new Date().toISOString();
    const { data: otpRow, error: otpFetchErr } = await supabase
      .from("otp_codes")
      .select("id, email, otp_code, expires_at, used")
      .eq("email", email)
      .eq("otp_code", otp)
      .eq("used", false)
      .gt("expires_at", nowIso)
      .maybeSingle();

    if (otpFetchErr) {
      console.error("OTP fetch error:", otpFetchErr);
      return new Response(
        JSON.stringify({ error: "Database error while checking OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRow) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as used
    const { error: consumeErr } = await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRow.id);

    if (consumeErr) {
      console.error("OTP consume error:", consumeErr);
      return new Response(
        JSON.stringify({ error: "Failed to consume OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user exists
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found. Please register first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate magic link for login
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error("Generate magic link error:", linkErr);
      return new Response(
        JSON.stringify({ error: "Failed to generate login link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up expired OTPs
    await supabase.from("otp_codes").delete().lt("expires_at", nowIso);

    console.log(`OTP verified successfully for ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP verified successfully",
        action_link: linkData.properties.action_link,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unhandled verify-otp error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);