# Study Assistant

Study Assistant is an AI-powered React + Vite app that turns free-form notes into structured study material using a backend-to-Gemini workflow. The frontend renders interactive cards for summaries, key points, flashcards, quiz questions, and study progress.

## Demo Video

[Watch the demo video](https://drive.google.com/file/d/1oeCJEneOxQDiptPtR25hT5Z30kwv21p2/view?usp=sharings)

## Stack

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- React Icons
- Axios
- Node.js
- Express
- Gemini API
- dotenv
- cors
- Zod

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your environment variables:

```bash
cp .env.example .env
```

Open the project-root `.env` file and paste your Gemini key here:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.6-flash
PORT=3001
USE_MOCK_AI=false
```

The backend defaults to `gemini-3.6-flash` and falls back to `gemini-3.5-flash` if needed.

3. Start the app:

```bash
npm start
```

The frontend runs on Vite and proxies API requests to the Express backend.

## Run and Test

- Start the full app with `npm start`.
- Open the frontend at the Vite URL shown in the terminal, usually `http://localhost:5173`.
- Verify the backend with `npm run test:api`.
- If you want to run the API alone, use `npm run dev:server`.

## Usage

- Paste notes or a topic into the textarea.
- Click **Generate Study Kit**.
- Review the generated summary, key points, flashcards, and 8 quiz questions.
- Flip cards, shuffle the deck, mark items as favourite or difficult, and check quiz answers.
- If you pick a wrong quiz answer, click **Try again** to reset just that question.

## AI Usage Note

I used AI tools to help accelerate scaffolding, implementation planning, and UI polish ideas. I still built and reasoned through the code, validation, and interaction flow myself.

## Known Limitations

- Gemini can still return malformed or incomplete JSON in edge cases, so the backend validates the structure and surfaces an error instead of crashing.
- The mock fallback is only for local development when `GEMINI_API_KEY` is missing.
- Quiz scoring is session-based and currently resets when new content is generated.

## Time Spent

Estimated implementation time: about 8 hours.

## Notes for Reviewers

- The API key is never sent to the browser.
- The frontend only talks to the backend.
- The app handles empty input, loading states, invalid model output, retry flow, and stale request protection.
- Put your Gemini key in the project root `.env` file before starting the app.
