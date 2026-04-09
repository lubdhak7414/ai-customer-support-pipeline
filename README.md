# AI Customer Support Pipeline

A full-stack support desk MVP where users can create tickets, and an async AI pipeline classifies each ticket, sets priority, and drafts a response.

This repository is split into:

- `backend`: Express + MongoDB API with JWT auth and background AI enrichment
- `frontend`: React + Vite dashboard for authentication, ticket creation, filtering, and AI reply review

## What it does

- User registration and login with JWT authentication
- Role-based access (`user` and `admin`)
- Ticket creation with server-side validation
- Automatic AI triage in the background:
  - Category (`Billing`, `Technical Support`, `General Inquiry`)
  - Sentiment (`Angry`, `Neutral`, `Happy`)
  - Priority (`High`, `Medium`, `Low`)
  - Suggested customer reply
- Ticket filtering by category, sentiment, and priority
- Admin-only AI regeneration endpoint for reprocessing a ticket

## Tech stack

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + `bcryptjs`
- `express-validator` for request validation
- Ollama HTTP API for local LLM inference

### Frontend

- React 18 + Vite
- Axios
- Tailwind CSS
- React Router DOM

## Project structure

```text
backend/
  src/
    config/        # env + database config
    controllers/   # auth + ticket handlers
    jobs/          # background AI pipeline
    middleware/    # auth + error handlers
    models/        # mongoose models
    routes/        # API route definitions
    services/      # AI service (Ollama integration)

frontend/
  src/
    api/           # axios client + API calls
    components/    # dashboard + ticket form UI
    context/       # auth context/session state
    hooks/         # auth hook
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or hosted)
- Ollama running locally (default `http://127.0.0.1:11434`)

## Environment variables

### Backend (`backend/.env`)

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/support_desk
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5173

# Ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

Required:

- `MONGODB_URI`
- `JWT_SECRET`

### Frontend (`frontend/.env`)

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Local development

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Run backend (Terminal 1):

```bash
cd backend
npm run dev
```

Run frontend (Terminal 2):

```bash
cd frontend
npm run dev
```

Open the app at:

- `http://localhost:5173`

Health check:

- `GET http://localhost:5000/api/health`

## API overview

Base URL: `http://localhost:5000/api`

### Auth

- `POST /auth/register`
  - body: `{ name, email, password, role? }`
- `POST /auth/login`
  - body: `{ email, password }`

Both endpoints return:

```json
{
  "success": true,
  "data": {
    "token": "jwt",
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "user"
    }
  }
}
```

### Tickets (Bearer token required)

- `POST /tickets`
  - body: `{ title, description }`
  - creates ticket with `aiStatus: pending`
  - triggers async AI pipeline

- `GET /tickets`
  - optional query params:
    - `category`: `Billing | Technical Support | General Inquiry`
    - `sentiment`: `Angry | Neutral | Happy`
    - `priority`: `High | Medium | Low`
  - `admin` sees all tickets
  - `user` sees only their own tickets

- `POST /tickets/:id/regenerate-ai`
  - admin only
  - resets AI status and re-runs enrichment pipeline

## Ticket processing flow

1. A user creates a ticket.
2. API stores it as `pending` and returns immediately.
3. Background job moves it to `processing`.
4. AI service calls Ollama and validates/normalizes output.
5. Ticket is updated with category, sentiment, priority, and suggested reply.
6. Status becomes `completed` (or `failed` with error metadata).

## Scripts

### Backend

- `npm run dev` - start with watch mode
- `npm start` - start normally

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build

## Common issues

- Backend fails at startup with missing env variable:
  - verify `backend/.env` contains `MONGODB_URI` and `JWT_SECRET`

- AI status stays `failed`:
  - confirm Ollama is running
  - check `OLLAMA_BASE_URL`
  - ensure configured model is available (`OLLAMA_MODEL`)

- CORS errors in browser:
  - set `CLIENT_ORIGIN` in backend env to your frontend URL

- Frontend can’t reach API:
  - verify `VITE_API_BASE_URL` in `frontend/.env`
  - verify backend is running on expected port

## Security notes

- Passwords are hashed with bcrypt before storage.
- JWT is required for protected ticket routes.
- Admin-only actions are guarded by role middleware.
- For production, use HTTPS, secure secret management, and short-lived tokens.

## License

This project is licensed under the MIT License. See `LICENSE`.
