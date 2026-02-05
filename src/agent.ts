import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import fs from "fs";

export async function applyToJob(url: string, candidate: any, resumePath: string) {
  console.log(`🤖 Launching Agent for: ${url}`);
  
  const stagehand = new Stagehand({
    env: "LOCAL", 
    verbose: 1,
    headless: false,
  });

  await stagehand.init();
  const page = stagehand.page;

  try {
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const instruction = `
      You are filling out a job application.
      
      Candidate Data:
      - First Name: ${candidate.basics.firstName}
      - Last Name: ${candidate.basics.lastName}
      - Email: ${candidate.basics.email}
      - Phone: ${candidate.basics.phone}
      - LinkedIn Profile: ${candidate.basics.linkedin}
      - Portfolio/Website: ${candidate.basics.portfolio}
      - Current Company: ${candidate.experience[0]?.company || 'Self-Employed'}
      - Location: ${candidate.basics.location}
      
      Instructions:
      1. Look at the form fields visible on the page.
      2. Fill in the fields that match the candidate data above.
      3. If you see a file upload for "Resume" or "CV", upload the file at path: "${resumePath}"
      4. If there is a "Hear about us" dropdown, select "LinkedIn" or "Other".
      5. Do NOT click the final "Submit Application" button. Just scroll to it.
    `;

    console.log(`... AI is analyzing the page for ${url}...`);
    await page.act({ action: instruction });

    console.log("... Validating form completeness...");
    const validation = await page.extract({
      instruction: "Check if the 'Email' field is filled and if the 'Resume' file appears to be uploaded/attached.",
      schema: z.object({
        emailIsFilled: z.boolean(),
        resumeIsAttached: z.boolean(),
        notes: z.string().describe("Any observations about missing fields or errors")
      })
    });

    console.log(`📝 Status for ${url}:`, validation);

    if (validation.resumeIsAttached) {
        console.log(`✅ Success: Resume attached for ${url}`);
    } else {
        console.warn(`⚠️ Warning: Agent could not confirm resume upload for ${url}. You may need to do it manually.`);
    }

    console.log("⏳ Browser remaining open for 60s for manual review/submission...");
    await new Promise(r => setTimeout(r, 60000));

  } catch (error) {
    console.error(`❌ Error applying to ${url}:`, error);
  } finally {
    await stagehand.close();
  }
}