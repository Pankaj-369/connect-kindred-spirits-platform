import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      console.error("Missing email or OTP");
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    console.log("OTP lookup result:", { otpData, otpError });

    if (otpError) {
      console.error("Database error:", otpError);
      return new Response(
        JSON.stringify({ error: "Database error", details: otpError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpData) {
      console.error("Invalid or expired OTP");
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpData.id);

    if (updateError) {
      console.error("Error updating OTP:", updateError);
    }

    console.log("OTP verified successfully, creating user session...");

    // Check if user exists first
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    let magicLinkData;
    if (existingUser.user) {
      // User exists, generate magic link for login
      const { data, error: magicLinkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });
      
      if (magicLinkError) {
        console.error("Error generating magic link:", magicLinkError);
      } else {
        magicLinkData = data;
      }
    } else {
      // User doesn't exist, create account
      const { data, error: signUpError } = await supabase.auth.admin.createUser({
        email: email,
        password: email + Date.now().toString(), // Random password
        email_confirm: true, // Auto-confirm email
      });
      
      if (signUpError) {
        console.error("Error creating user:", signUpError);
      } else {
        console.log("User created successfully");
        
        // Generate magic link for the new user
        const { data: linkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });
        
        if (!magicLinkError) {
          magicLinkData = linkData;
        }
      }
    }

    // Clean up expired OTPs
    await supabase
      .from("otp_codes")
      .delete()
      .lt("expires_at", new Date().toISOString());

    return new Response(
      JSON.stringify({ 
        message: "OTP verified successfully",
        magicLink: magicLinkData?.properties?.action_link,
        success: true
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);