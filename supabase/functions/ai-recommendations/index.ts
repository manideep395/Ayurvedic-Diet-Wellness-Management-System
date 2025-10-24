import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = "AIzaSyAwfopo6RAzA_vQ7SCP-UaB3FTgPMhcHXA";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patient, recommendationType } = await req.json();

    console.log("Generating recommendations for patient:", patient);

    // Build context-rich prompt based on patient data
    const systemPrompt = `You are an expert Ayurvedic nutritionist with deep knowledge of both traditional Ayurveda and modern nutrition science. 

Patient Profile:
- Name: ${patient.name}
- Age: ${patient.age}
- Prakriti (Body Type): ${patient.prakriti}
- Health Conditions: ${patient.health_conditions?.join(", ") || "None"}
- Dietary Habits: ${patient.dietary_habits || "Not specified"}
- Digestion Quality: ${patient.digestion_quality || "Not specified"}
- Bowel Pattern: ${patient.bowel_pattern || "Not specified"}
- Water Intake: ${patient.water_intake_liters || "Not specified"} liters/day
- Meal Preferences: ${patient.meal_preferences?.join(", ") || "None"}
- Allergies: ${patient.allergies?.join(", ") || "None"}
- Lifestyle: ${patient.lifestyle_notes || "Not specified"}

Your task is to provide ${recommendationType === 'meal_plan' ? 'a detailed meal plan' : 'dietary recommendations'} that:
1. Balances the patient's Dosha (focusing on their Prakriti type)
2. Addresses their specific health conditions
3. Respects their preferences and allergies
4. Follows Ayurvedic principles (Rasa, Guna, Virya, Vipaka)
5. Provides modern nutritional balance

${recommendationType === 'meal_plan' 
  ? 'Create a full day meal plan with breakfast, mid-morning snack, lunch, evening snack, and dinner. For each meal, specify: food items, portion sizes, timing, Ayurvedic properties, and nutritional breakdown.'
  : 'Provide 5-7 specific dietary recommendations focusing on foods to include, foods to avoid, meal timing, and lifestyle practices that support their Dosha balance and health goals.'}

Format your response as structured JSON with clear sections.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 503) {
        throw new Error('AI service is temporarily overloaded. Please try again in a moment.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data));

    let recommendation = data.candidates[0]?.content?.parts[0]?.text;

    if (!recommendation) {
      throw new Error('No recommendation generated');
    }

    // Extract JSON from markdown code blocks if present
    const jsonMatch = recommendation.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      recommendation = jsonMatch[1].trim();
    }

    return new Response(
      JSON.stringify({ 
        recommendation,
        patient_info: {
          name: patient.name,
          prakriti: patient.prakriti,
          conditions: patient.health_conditions
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate recommendations' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});