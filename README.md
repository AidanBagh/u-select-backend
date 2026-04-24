# U-Select Backend

REST API for the **Umurava Select** AI recruiting platform. Built with Node.js (TypeScript), Express, MongoDB, and the Google Gemini API.

---

## Tech Stack

| | |
|---|---|
| Runtime | Node.js with TypeScript (`tsx`) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| AI | Google Gemini API (`@google/generative-ai`) |
| File uploads | Multer (CSV, Excel, PDF) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.example .env   # then fill in your values

# Start in development mode (watch)
npm run dev

# Start in production mode
npm start
```

### Required environment variables (`.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

---

## API Overview

| Resource | Base path |
|---|---|
| Jobs | `/api/jobs` |
| Applicants | `/api/applicants` |
| Screening | `/api/screening` |
| AI Chat Agent | `/api/chat` |
| Stats | `/api/stats` |

See [Structure.md](./Structure.md) for the full endpoint list and folder layout.

---

## Project Structure

```
src/
├── config/        # DB + Gemini client setup
├── models/        # Mongoose schemas
├── routes/        # URL definitions
├── controllers/   # Request/response handlers
├── services/      # Business logic (Gemini, file parsing)
├── middleware/    # Error handling, validation, file uploads
├── chat/          # AI agent + Gemini function-calling tools
├── app.ts         # Express app setup
└── server.ts      # Entry point
```
