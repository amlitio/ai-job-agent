import path from 'path';
import { parseResume } from './parser';
import { applyToJob } from './agent';

// Add the URLs of the jobs you want to apply to here.
const JOB_URLS = [
  "https://boards.greenhouse.io/canonical/jobs/6248283002", 
];

async function main() {
  const resumePath = path.resolve(process.cwd(), 'resume.pdf');
  
  console.log("🚀 Starting AI Job Application Agent");
  console.log(`📂 Resume Path: ${resumePath}`);

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Error: OPENAI_API_KEY is missing in .env file.");
    process.exit(1);
  }

  let candidateProfile;
  try {
    candidateProfile = await parseResume(resumePath);
  } catch (e) {
    console.error("❌ Failed to parse resume.");
    process.exit(1);
  }

  for (const url of JOB_URLS) {
    await applyToJob(url, candidateProfile, resumePath);
  }
  
  console.log("🏁 All jobs processed.");
}

main();