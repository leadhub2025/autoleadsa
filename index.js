// index.js (Express Serverless Function with JSON Output)

import 'dotenv/config'; 
import { GoogleGenAI, Type } from '@google/genai'; // <-- Import 'Type'
import express from 'express'; 

const app = express();
const ai = new GoogleGenAI({}); 

app.use(express.json());

// ----------------------------------------------------
// 1. Define the Required JSON Schema
// This tells the Gemini model EXACTLY what structure to use.
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
      description: "A one-sentence summary of the core value provided by Autoleadsa1."
    }
  },
  required: ["subject", "body_html", "value_proposition"]
};

// ----------------------------------------------------
// Define the API Endpoint
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

    // Construct the prompt using the dynamic input
    const prompt = `Generate a cold email, including the subject line and body, for a lead generation tool named Autoleadsa1, targeting a lead in the industry: "${topic}". Ensure the tone is professional and focuses on solving a pain point specific to that industry.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                // 2. Enforce JSON output for the entire response
                responseMimeType: "application/json", 
                responseSchema: EMAIL_SCHEMA, // 3. Use the schema we defined above
            }
        });

        // 4. The response.text is now a guaranteed JSON string.
        // We parse it before sending it back.
        const parsedJson = JSON.parse(response.text);

        res.status(200).json({
            success: true,
            topic: topic,
            generated_data: parsedJson // Send the structured data
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to call Gemini API",
            error: error.message
        });
    }
});

// Root path handler
app.get('/', (req, res) => {
    res.send("Autoleadsa1 API is running. Use the /api/generate?topic=YOUR_TOPIC endpoint to get started.");
});

export default app;