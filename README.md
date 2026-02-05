# AI Job Agent (Vibe Scraping Edition)

This tool uses **Stagehand** and **GPT-4o** to read your PDF resume and autonomously fill out job application forms in a real browser.

## 🚀 Setup

1.  **Install Dependencies**
    ```bash
    npm install
    npx playwright install
    ```

2.  **Environment Config**
    Create a file named `.env` in the root folder and add your key:
    `OPENAI_API_KEY=sk-...`

3.  **Add Your Resume**
    * Place your PDF resume in the root folder.
    * Rename it to `resume.pdf`.

4.  **Configure Jobs**
    * Open `src/main.ts`.
    * Edit the `JOB_URLS` array to include the links you want to apply to.

## 🏃‍♂️ How to Run

```bash
npm start
```
