// index.js (Express Serverless Function with JSON Output)

import 'dotenv/config'; 
import { GoogleGenAI, Type } from '@google/genai'; // <-- Import 'Type'
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
      description: "A one-sentence summary of the core value provided by Autoleadsa1."
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

// ... existing app.get('/api/generate', async (req, res) => { ...

    // Construct the prompt (UPDATED INSTRUCTION)
    const prompt = `Generate a cold email, including the subject line, body, and a detailed lead profile, for a lead generation tool named Autoleadsa1, targeting a lead in the industry: "${topic}". Ensure the tone is professional, the email focuses on solving the primary challenge, and the lead profile is fully accurate based on the industry.`;

// ... rest of the app.get function remains the same ...

export default app;