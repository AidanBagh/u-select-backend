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
4. Restart the server (`node server.js` or `nodemon server.js`)


---

# TypeScript Migration — New Folder Strategy

## Strategy
**DO NOT touch `backend/`.** All TS work happens exclusively in `backend-ts/`.
`backend/` stays running as-is until `backend-ts/` is fully working and tested.
When ready: `backend-ts/` replaces `backend/` on the VPS. Then `backend/` is deleted.

## Folder being built
```
backend-ts/   ← active work here, currently empty
backend/      ← live JS backend, DO NOT modify
```

## Progress tracker
Legend: `[ ]` not started · `[~]` in progress · `[x]` done

### Phase 1 — Tooling setup
- [x] 1.1 Init `package.json` inside `backend-ts/` with all deps from `backend/package.json` + `typescript`, `tsx` as devDeps
- [x] 1.2 Create `backend-ts/tsconfig.json` with: `strict: true`, `esModuleInterop: true`, `module: NodeNext`, `moduleResolution: NodeNext`, `target: ES2022`, `outDir: dist`, `rootDir: src`, `resolveJsonModule: true`, `skipLibCheck: true`
- [x] 1.3 Set scripts: `dev`: `tsx watch src/server.ts`, `start`: `tsx src/server.ts`
- [x] 1.4 Add `node_modules/`, `.env`, `uploads/`, `dist/` to `backend-ts/.gitignore`

### Phase 2 — Models
- [x] 2.1 `src/models/Applicant.ts` (define `IApplicant` interface + `Model<IApplicant>`)
- [x] 2.2 `src/models/Job.ts`
- [x] 2.3 `src/models/Screening.ts`

### Phase 3 — Config + Services
- [x] 3.1 `src/config/db.ts`
- [x] 3.2 `src/config/gemini.ts`
- [x] 3.3 `src/services/geminiService.ts`
- [x] 3.4 `src/services/fileParserService.ts`

### Phase 4 — Middleware
- [x] 4.1 `src/middleware/errorHandler.ts`
- [x] 4.2 `src/middleware/upload.ts`
- [x] 4.3 `src/middleware/validate.ts`

### Phase 5 — Controllers
- [x] 5.1 `src/controllers/applicantController.ts`
- [x] 5.2 `src/controllers/jobController.ts`
- [x] 5.3 `src/controllers/screeningController.ts`
- [x] 5.4 `src/controllers/statsController.ts`
- [x] 5.5 `src/controllers/chatController.ts`

### Phase 6 — Chat agent + tools
- [x] 6.1 `src/chat/tools/listApplicants.ts`
- [x] 6.2 `src/chat/tools/listJobs.ts`
- [x] 6.3 `src/chat/tools/index.ts`
- [x] 6.4 `src/chat/agent.ts`

### Phase 7 — Routes
- [x] 7.1 `src/routes/applicants.ts`
- [x] 7.2 `src/routes/jobs.ts`
- [x] 7.3 `src/routes/screening.ts`
- [x] 7.4 `src/routes/chat.ts`

### Phase 8 — Entrypoints
- [x] 8.1 `src/app.ts`
- [x] 8.2 `src/server.ts`
- [ ] 8.3 Run `npm run dev` inside `backend-ts/` → server boots green

### Phase 9 — VPS cutover (when fully tested)
- [ ] 9.1 Set up git in `backend-ts/` with same VPS remote
- [ ] 9.2 Push to VPS
- [ ] 9.3 SSH → `rm -rf node_modules && npm install` in the deployed folder
- [ ] 9.4 Restart server (`node` or `nodemon src/server.js` via tsx output, or `tsx src/server.ts` directly)
- [ ] 9.5 Delete `backend/` locally once confirmed working

## Rules for any agent working on this
- All new files go in `backend-ts/` only
- Mirror the same folder structure as `backend/src/`
- Copy logic from `backend/`, convert `require` → `import`, add types
- Never import from `backend/` into `backend-ts/`
- Source of truth for current JS logic is `backend/`

## Current step
→ Phase 8.3 (boot test — run `npm run dev` in backend-ts/)
