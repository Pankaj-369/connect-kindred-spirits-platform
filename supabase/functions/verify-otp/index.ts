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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find valid OTP
    const { data: otpData, error: otpError } = await supabase
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
    await supabase.from("otp_codes").update({ used: true }).eq("id", otpData.id);

    console.log("OTP verified successfully, logging in user...");

    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(
      email,
    );

    let sessionData;

    if (existingUser.user) {
      // Sign in the existing user with a generated session
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      });

      if (error) {
        console.error("Error generating magic link:", error);
      }
      sessionData = data;
    } else {
      // Create a new user and session
      const { data, error: signUpError } = await supabase.auth.admin.createUser({
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

      console.log("User created successfully");

      const { data: linkData, error: magicLinkError } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: email,
        });

      if (!magicLinkError) {
        sessionData = linkData;
      }
    }

    // Cleanup expired OTPs
    await supabase.from("otp_codes").delete().lt(
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
