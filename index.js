// index.js (Full code with robust error handling)

import 'dotenv/config'; 
import { GoogleGenAI, Type } from '@google/genai'; 
import express from 'express'; 

const app = express();
const ai = new GoogleGenAI({}); 

app.use(express.json());

// ----------------------------------------------------
// 1. Define the Required JSON Schema (EXPANDED)
// ----------------------------------------------------

const EMAIL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "A compelling, personalized cold email subject line (10 words max)."
    },
    body_html: {
      type: Type.STRING,
      description: "The full, professional cold email body formatted in HTML with paragraph breaks, ready to send. End with a placeholder for the sender's name."
    },
    value_proposition: {
      type: Type.STRING,
      description: "A one-sentence summary of the core value provided by Autoleadsa."
    },
    // --- NEW LEAD PROFILE OBJECT ---
    lead_profile: {
      type: Type.OBJECT,
      description: "A hypothesized profile for the target lead based on the industry.",
      properties: {
        role: {
          type: Type.STRING,
          description: "The most likely job title of the target lead (e.g., VP of Sales, Marketing Director)."
        },
        primary_challenge: {
          type: Type.STRING,
          description: "The biggest operational challenge this specific lead role faces in this industry (e.g., High client churn, Manual data entry)."
        },
        predicted_annual_revenue_usd: {
          type: Type.STRING,
          description: "The estimated minimum annual revenue for the lead's company in USD (e.g., $5M, $10M+)."
        }
      },
      required: ["role", "primary_challenge", "predicted_annual_revenue_usd"]
    }
  },
  // --- UPDATE REQUIRED LIST ---
  required: ["subject", "body_html", "value_proposition", "lead_profile"]
};

// ----------------------------------------------------
// Define the API Endpoint (WITH STABILITY FIX)
// ----------------------------------------------------

app.get('/api/generate', async (req, res) => {
    
    const model = "gemini-2.5-flash"; 
    
    // Get the dynamic topic from the URL query parameters
    const topic = req.query.topic;

    if (!topic) {
        return res.status(400).json({
            success: false,
            message: "Missing 'topic' query parameter. Example usage: /api/generate?topic=new marketing agency"
        });
    }

    // Construct the prompt (UPDATED INSTRUCTION)
    const prompt = `Generate a cold email, including the subject line, body, and a detailed lead profile, for a lead generation tool named Autoleadsa, targeting a lead in the industry: "${topic}". Ensure the tone is professional, the email focuses on solving the primary challenge, and the lead profile is fully accurate based on the industry.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json", 
                responseSchema: EMAIL_SCHEMA, 
            }
        });

        // --- START ROBUST JSON PARSING ---
        let parsedJson;
        try {
            // Attempt to parse the text response
            parsedJson = JSON.parse(response.text);
        } catch (jsonError) {
            console.error("JSON PARSE FAILED. Raw Gemini Text:", response.text);
            console.error("Parsing Error:", jsonError);

            // Respond gracefully instead of crashing the function
            return res.status(502).json({
                success: false,
                message: "Gemini API returned malformed JSON. Try refining the prompt or regenerating.",
                raw_response: response.text
            });
        }
        // --- END ROBUST JSON PARSING ---


        res.status(200).json({
            success: true,
            topic: topic,
            generated_data: parsedJson // Send the structured data
        });

    } catch (error) {
        // This catches API connection/key errors
        console.error("Gemini API Connection Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to connect to Gemini API. Check API key/permissions.",
            error: error.message
        });
    }
});

// Root path handler
app.get('/', (req, res) => {
    res.send("Autoleadsa API is running. Use the /api/generate?topic=YOUR_TOPIC endpoint to get started.");
});


export default app;