import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendNotificationRequest {
  type: 'application_accepted' | 'application_rejected' | 'new_volunteer_application' | 'new_campaign_application';
  recipientEmail: string;
  data: {
    volunteerName?: string;
    ngoName?: string;
    campaignName?: string;
    applicationId?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, data }: SendNotificationRequest = await req.json();

    if (!type || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Type and recipient email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let html = "";

    switch (type) {
      case 'application_accepted':
        subject = "Application Accepted!";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">Congratulations! Your Application Has Been Accepted</h2>
            <p>We're excited to inform you that your volunteer application has been accepted by <strong>${data.ngoName}</strong>.</p>
            <p>You can now start contributing to their mission and making a positive impact in the community.</p>
            <p>Login to your dashboard to see more details and get started with your volunteer activities.</p>
            <p>Best regards,<br>Connect4Good Team</p>
          </div>
        `;
        break;

      case 'application_rejected':
        subject = "Application Update";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Status Update</h2>
            <p>Thank you for your interest in volunteering with <strong>${data.ngoName}</strong>.</p>
            <p>Unfortunately, your application was not selected at this time. This doesn't mean your efforts aren't valued - there are many other opportunities available.</p>
            <p>We encourage you to continue exploring volunteer opportunities on our platform.</p>
            <p>Best regards,<br>Connect4Good Team</p>
          </div>
        `;
        break;

      case 'new_volunteer_application':
        subject = "New Volunteer Application Received";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">New Volunteer Application</h2>
            <p>Great news! You have received a new volunteer application.</p>
            <p><strong>Volunteer:</strong> ${data.volunteerName}</p>
            <p>Login to your NGO dashboard to review the application and take action.</p>
            <p>Best regards,<br>Connect4Good Team</p>
          </div>
        `;
        break;

      case 'new_campaign_application':
        subject = "New Campaign Application Received";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">New Campaign Application</h2>
            <p>Great news! You have received a new application for your campaign.</p>
            <p><strong>Campaign:</strong> ${data.campaignName}</p>
            <p><strong>Volunteer:</strong> ${data.volunteerName}</p>
            <p>Login to your NGO dashboard to review the application and take action.</p>
            <p>Best regards,<br>Connect4Good Team</p>
          </div>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Send email notification
    const { error: emailError } = await resend.emails.send({
      from: "Connect4Good <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);