import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { interests, skills, availability, location } = await req.json();

    // Fetch all active campaigns
    const { data: campaigns, error: campaignsError } = await supabaseClient
      .from("campaigns")
      .select(`
        *,
        profiles:ngo_id (
          ngo_name,
          full_name,
          username
        )
      `)
      .order("created_at", { ascending: false });

    if (campaignsError) throw campaignsError;

    if (!campaigns || campaigns.length === 0) {
      return new Response(
        JSON.stringify({ matches: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare campaign data for AI
    const campaignsText = campaigns
      .map(
        (c, idx) =>
          `Campaign ${idx + 1}:
- ID: ${c.id}
- Title: ${c.title}
- Category: ${c.category || "General"}
- Location: ${c.location || "Not specified"}
- Description: ${c.description || "No description"}
- NGO: ${c.profiles?.ngo_name || c.profiles?.full_name || "Unknown"}
`
      )
      .join("\n");

    const userProfile = `
User Profile:
- Interests: ${interests || "Not specified"}
- Skills: ${skills || "Not specified"}
- Availability: ${availability || "Flexible"}
- Location: ${location || "Anywhere"}
`;

    // Call AI to match and rank campaigns
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert volunteer matching system. Analyze the user's profile and match them with the most suitable volunteer opportunities. 
              
For each campaign, provide:
1. A match score (0-100) based on how well it fits the user's interests, skills, availability, and location
2. A brief reason (max 50 words) explaining why this is a good match
3. Key highlights (2-3 specific aspects that align with user's profile)

Return ONLY a valid JSON array with the top 5 best matches in this exact format:
[
  {
    "campaignId": "uuid-here",
    "matchScore": 95,
    "reason": "Brief compelling reason",
    "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
  }
]`,
            },
            {
              role: "user",
              content: `${userProfile}\n\nAvailable Campaigns:\n${campaignsText}\n\nFind the top 5 best matching campaigns and return as JSON array.`,
            },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    let matches;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      matches = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);
    } catch (e) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Invalid AI response format");
    }

    // Enrich matches with full campaign data
    const enrichedMatches = matches
      .map((match: any) => {
        const campaign = campaigns.find((c) => c.id === match.campaignId);
        if (!campaign) return null;

        return {
          ...match,
          campaign: {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            category: campaign.category,
            location: campaign.location,
            date: campaign.date,
            image_url: campaign.image_url,
            ngo_id: campaign.ngo_id,
            ngoName:
              campaign.profiles?.ngo_name ||
              campaign.profiles?.full_name ||
              "Unknown NGO",
          },
        };
      })
      .filter(Boolean)
      .slice(0, 5);

    return new Response(JSON.stringify({ matches: enrichedMatches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-match-volunteer:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
