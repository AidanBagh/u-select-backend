# Backend Structure – u-select

> Node.js (TypeScript) + Express + MongoDB + Gemini API

---

## Folder Tree

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts               # MongoDB connection (Mongoose)
│   │   └── gemini.ts           # Gemini API client initialisation
│   │
│   ├── models/
│   │   ├── Job.ts              # Job schema (title, description, requirements, weights)
│   │   ├── Applicant.ts        # Applicant schema (profile fields, source: platform | upload)
│   │   └── Screening.ts        # Screening result schema (scores, reasoning, shortlist flag)
│   │
│   ├── routes/
│   │   ├── jobs.ts             # /api/jobs
│   │   ├── applicants.ts       # /api/applicants
│   │   ├── screening.ts        # /api/screening
│   │   └── chat.ts             # /api/chat
│   │
│   ├── controllers/
│   │   ├── jobController.ts        # CRUD for jobs
│   │   ├── applicantController.ts  # Ingest applicants (structured or file upload)
│   │   ├── screeningController.ts  # Trigger screening, return ranked shortlists
│   │   ├── chatController.ts       # Handle AI agent chat requests
│   │   └── statsController.ts      # Dashboard stats aggregation
│   │
│   ├── services/
│   │   ├── geminiService.ts        # Build prompts, call Gemini API, parse responses
│   │   └── fileParserService.ts    # Parse CSV / Excel / PDF into normalised applicant objects
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts         # Global error handler (keeps controllers clean)
│   │   ├── validate.ts             # Request validation
│   │   └── upload.ts               # Multer config for file uploads (CSV, Excel, PDF)
│   │
│   ├── chat/
│   │   ├── agent.ts                # AI agent orchestration (Gemini function calling)
│   │   └── tools/
│   │       ├── index.ts            # Tool registry
│   │       ├── createJob.ts
│   │       ├── deleteJob.ts
│   │       ├── getJobDetail.ts
│   │       ├── listJobs.ts
│   │       ├── createApplicant.ts
│   │       ├── deleteApplicant.ts
│   │       ├── getApplicantDetail.ts
│   │       ├── listApplicants.ts
│   │       ├── runScreeningTool.ts
│   │       └── getScreeningResults.ts
│   │
│   ├── app.ts                  # Express app setup (routes, middleware registration)
│   └── server.ts               # Entry point – starts HTTP server
│
├── .env                        # Secrets (MONGO_URI, GEMINI_API_KEY, PORT) – in .gitignore
├── .gitignore                  # node_modules/, .env, uploads/
├── tsconfig.json               # TypeScript compiler config
└── package.json
```

---

## Layer Responsibilities

| Layer | Role |
|---|---|
| `config/` | One-time setup (DB connection, external API clients) |
| `models/` | MongoDB schemas – single source of truth for data shape |
| `routes/` | URL definitions only – no logic |
| `controllers/` | Handle request/response – thin, delegates to services |
| `services/` | All business logic – reusable, testable, framework-agnostic |
| `middleware/` | Cross-cutting concerns (errors, validation, file uploads) |
| `chat/` | AI agent + tool definitions for Gemini function calling |

---

## API Endpoints

### Jobs
| Method | Path | Description |
|---|---|---|
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs` | Create a job |
| GET | `/api/jobs/:id` | Get a single job |
| PUT | `/api/jobs/:id` | Update a job |
| DELETE | `/api/jobs/:id` | Delete a job |

### Applicants
| Method | Path | Description |
|---|---|---|
| GET | `/api/applicants?jobId=` | List applicants for a job |
| POST | `/api/applicants/structured` | Ingest structured profiles |
| POST | `/api/applicants/upload` | Upload CSV / Excel / PDF |

### Screening
| Method | Path | Description |
|---|---|---|
| POST | `/api/screening/run` | Trigger AI screening for a job |
| GET | `/api/screening/:jobId` | Get ranked shortlist + reasoning |

### Chat
| Method | Path | Description |
|---|---|---|
| POST | `/api/chat` | Send a message to the AI agent |

---

## Data Flow

```
Frontend (React)
    │
    ▼
routes/  ──►  controllers/  ──►  services/geminiService.ts  ──►  Gemini API
                   │                     │
                   ▼                     ▼
              models/ (MongoDB)   chat/agent.ts + tools/
                                  services/fileParserService.ts
```
```

---

## Environment Variables (`.env.example`)

```
PORT=5000
MONGO_URI=your_production_mongo_uri
GEMINI_API_KEY=your_gemini_api_key
```

---

## Adding Features Safely

- **New entity** (e.g. Recruiter accounts): add `models/Recruiter.js` → `routes/auth.js` → `controllers/authController.js` — nothing else breaks.
- **New AI capability** (e.g. interview question generator): add a function inside `services/geminiService.js` and a new controller method — existing screening logic is untouched.
- **New file format** (e.g. DOCX): extend `services/fileParserService.js` only.
- **New validation rule**: update `middleware/validate.js` for that route only.
