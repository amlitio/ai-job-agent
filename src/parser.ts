import fs from 'fs';
import pdf from 'pdf-parse';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RESUME_SCHEMA = {
  basics: {
    firstName: "String",
    lastName: "String",
    email: "String",
    phone: "String",
    linkedin: "String",
    portfolio: "String",
    location: "String"
  },
  education: [{ school: "String", degree: "String", year: "String" }],
  experience: [{ company: "String", title: "String", description: "String", dates: "String" }],
  skills: ["String"]
};

export async function parseResume(filePath: string) {
  console.log(`📄 Parsing resume from: ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Resume file not found at ${filePath}. Please place 'resume.pdf' in the root directory.`);
  }

  const dataBuffer = fs.readFileSync(filePath);
  
  try {
    const data = await pdf(dataBuffer);
    const rawText = data.text;

    console.log("... PDF text extracted. Sending to GPT-4o for structuring...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a precise data extraction AI. Extract the resume information into the following JSON structure: ${JSON.stringify(RESUME_SCHEMA)}.`
        },
        {
          role: "user",
          content: rawText
        }
      ],
      response_format: { type: "json_object" }
    });

    const structuredData = JSON.parse(response.choices[0].message.content || "{}");
    fs.writeFileSync('candidate_profile.json', JSON.stringify(structuredData, null, 2));
    
    console.log("✅ Resume parsed successfully.");
    return structuredData;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
}