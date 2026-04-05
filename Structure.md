# Backend Structure – u-select

> Node.js (JavaScript) + Express + MongoDB + Gemini API

---

## Folder Tree

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection (Mongoose)
│   │   └── gemini.js           # Gemini API client initialisation
│   │
│   ├── models/
│   │   ├── Job.js              # Job schema (title, description, requirements, weights)
│   │   ├── Applicant.js        # Applicant schema (profile fields, source: platform | upload)
│   │   └── Screening.js        # Screening result schema (scores, reasoning, shortlist flag)
│   │
│   ├── routes/
│   │   ├── jobs.js             # /api/jobs
│   │   ├── applicants.js       # /api/applicants
│   │   └── screening.js        # /api/screening
│   │
│   ├── controllers/
│   │   ├── jobController.js        # CRUD for jobs
│   │   ├── applicantController.js  # Ingest applicants (structured or file upload)
│   │   └── screeningController.js  # Trigger screening, return ranked shortlists
│   │
│   ├── services/
│   │   ├── geminiService.js        # Build prompts, call Gemini API, parse responses
│   │   ├── scoringService.js       # Weighted scoring logic (skills, experience, education, relevance)
│   │   └── fileParserService.js    # Parse CSV / Excel / PDF into normalised applicant objects
│   │
│   └── middleware/
│       ├── errorHandler.js         # Global error handler (keeps controllers clean)
│       ├── rateLimiter.js          # express-rate-limit – protects Gemini cost-per-call routes
│       ├── validate.js             # Request validation (express-validator or joi)
│       └── upload.js               # Multer config for file uploads (CSV, Excel, PDF)
│
├── app.js                      # Express app setup (routes, middleware registration)
├── server.js                   # Entry point – starts HTTP server
├── .env                        # Secrets (MONGO_URI, GEMINI_API_KEY, PORT) – in .gitignore
├── .gitignore                  # node_modules/, .env, uploads/
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

---

## API Endpoints (planned)

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
| POST | `/api/applicants/structured` | Ingest structured profiles (Scenario 1 – Umurava) |
| POST | `/api/applicants/upload` | Upload CSV / Excel / PDF (Scenario 2 – External) |

### Screening
| Method | Path | Description |
|---|---|---|
| POST | `/api/screening/run` | Trigger AI screening for a job |
| GET | `/api/screening/:jobId` | Get ranked shortlist + reasoning for a job |

---

## Data Flow

```
Frontend (React)
    │
    ▼
routes/  ──►  controllers/  ──►  services/geminiService.js  ──►  Gemini API
                   │                     │
                   ▼                     ▼
              models/ (MongoDB)   services/scoringService.js
                                  services/fileParserService.js
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
