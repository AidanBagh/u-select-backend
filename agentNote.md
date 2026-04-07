# Agent Note — Backend VPS Sync Required

## Problem
The frontend is getting `404 Not Found` on `POST /api/chat` because the VPS is running an outdated version of the backend that does not have the chat route registered.

## What was added locally (not yet on VPS)

### New files (must be created on VPS):
1. `src/controllers/chatController.js` — handles POST /api/chat, calls Gemini, returns `{ reply }`
2. `src/routes/chat.js` — registers `POST /` → chatController

### Modified files (must be updated on VPS):
3. `app.js` — added `const chatRoutes = require('./src/routes/chat')` and `app.use('/api/chat', chatRoutes)`
4. `src/config/gemini.js` — new file that initialises GoogleGenerativeAI with `process.env.GEMINI_API_KEY`
5. `src/middleware/upload.js` — file types extended to `.pdf`, `.doc`, `.docx`; size limit changed to 7MB
6. `src/services/fileParserService.js` — fully replaced, now uses Gemini inline data instead of xlsx
7. `src/models/Applicant.js` — added `resumeData: Buffer` and `resumeMimeType: String` fields
8. `src/controllers/applicantController.js` — uploadFile now calls Gemini and stores binary in MongoDB

## Dependencies to install on VPS
```
npm install @google/generative-ai
npm uninstall xlsx
```

## Environment variable required in .env on VPS
```
GEMINI_API_KEY=your_key_here
```

## Action required
1. Pull / copy the updated files listed above to the VPS
2. Run `npm install @google/generative-ai` and `npm uninstall xlsx` in the backend directory
3. Confirm `GEMINI_API_KEY` is set in `.env`
4. Restart the server (e.g. `pm2 restart all` or `pm2 restart server`)
