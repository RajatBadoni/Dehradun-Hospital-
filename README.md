# Doon Hospital — Full Project (Frontend + Backend)

This bundle contains:

- **`frontend/`** — the original [Doon-hospital](https://github.com/RajatBadoni/Doon-hospital) static site,
  now wired up to a real backend (login, register, appointment booking, contact form, and a live
  patient dashboard).
- **`backend/`** — the Express + JWT REST API that powers all of the above.

## Quick start

**1. Start the backend**
```bash
cd backend
npm install
cp .env.example .env
npm run seed        # creates 12 doctors + a default admin account
npm start            # runs on http://localhost:5000
```

**2. Serve the frontend** (any static file server works — the pages use `fetch`, so they
need to be served over HTTP, not opened directly as `file://`)
```bash
cd frontend
python3 -m http.server 8080
# or: npx serve -l 8080
```
Then open **http://localhost:8080**.

**3. Match the CORS origin**
In `backend/.env`, set `CORS_ORIGIN` to whatever URL you're serving the frontend from
(e.g. `http://localhost:8080`, or `http://127.0.0.1:5500` for VS Code Live Server).

## What's wired up

| Page                | Behavior                                                                 |
|---------------------|---------------------------------------------------------------------------|
| `register.html`     | Creates a real account, logs you in, redirects to the dashboard          |
| `login.html`        | Authenticates against the backend, redirects to the dashboard            |
| `appointment.html`  | Doctor dropdown loads live from the backend; booking hits the real API   |
| `contact.html`      | Submits to the backend and is stored for admin follow-up                 |
| `dashboard.html`    | Shows your real profile + real appointments (upcoming/history/stats), with working Cancel and Logout |
| Every page's nav    | Automatically shows "Dashboard / Logout" instead of "Login / Register" once you're signed in |

Booking an appointment and submitting the contact form both still work for guests
who aren't logged in — the backend accepts them either way.

## Talking to a different backend URL

`frontend/JS/api.js` defaults to `http://localhost:5000/api`. To point it elsewhere
(e.g. a deployed backend), set this before `api.js` loads on any page:
```html
<script>window.API_BASE_URL = 'https://your-backend.example.com/api';</script>
<script src="JS/api.js"></script>
```

## Admin access

There's no admin UI screen yet (the original site only had a patient dashboard),
but the backend fully supports admin actions — list all appointments, update
appointment status, manage doctors, view contact messages — via the API using the
seeded admin login (`admin@doonhospital.com` / `Admin@12345` by default). See
`backend/README.md` for the full endpoint reference if you want to build an admin
screen on top of it.
