// supabase/functions/verify-otp/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting OTP verification...");

    const body = await req.json();
    console.log("Request body:", body);

    const { email, otp }: VerifyOTPRequest = body;

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // --- Initialize Supabase clients ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Admin client (service role) → for user management
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Normal client (anon) → for OTP verification
    const supabaseAnon = createClient(supabaseUrl, anonKey);

    // --- Step 1: Verify OTP from your otp_codes table ---
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (otpError) {
      console.error("Database error:", otpError);
      return new Response(
        JSON.stringify({ error: "Database error", details: otpError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!otpData) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mark OTP as used
    await supabaseAdmin.from("otp_codes").update({ used: true }).eq("id", otpData.id);

    console.log("OTP verified successfully, checking user...");

    // --- Step 2: Check if user exists ---
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (userError) {
      console.error("Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let sessionData;

    if (userData?.user) {
      // --- Existing user → generate login link/session ---
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      });

      if (error) {
        console.error("Error generating magic link:", error);
      } else {
        sessionData = data;
      }
    } else {
      // --- New user → create & generate login link ---
      const { data: newUser, error: signUpError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: email + Date.now().toString(),
          email_confirm: true,
        });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      console.log("User created successfully:", newUser);

      const { data: linkData, error: magicLinkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: email,
        });

      if (!magicLinkError) {
        sessionData = linkData;
      }
    }

    // --- Step 3: Cleanup expired OTPs ---
    await supabaseAdmin.from("otp_codes").delete().lt(
      "expires_at",
      new Date().toISOString(),
    );

    return new Response(
      JSON.stringify({
        message: "OTP verified successfully",
        session: sessionData,
        success: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
};

serve(handler);
