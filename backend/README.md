# Doon Hospital — Backend API

A REST API built to power the [Doon-hospital](https://github.com/RajatBadoni/Doon-hospital) static frontend
(login, register, appointment booking, contact form, doctor listing, dashboard).

The original repo is a static HTML/CSS/JS site with no server — this backend adds real
accounts, authentication, appointment booking, and data persistence behind it.

## Stack

- **Node.js + Express** — REST API
- **JWT + bcrypt** — authentication & password hashing
- **lowdb** — simple JSON-file database (`data/db.json`) — no external DB server to install.
  Swap this out for MongoDB/Postgres later without changing the routes, since all data
  access goes through the `models/` layer.
- **helmet, cors, express-rate-limit, morgan** — security & logging basics
- **express-validator** — request validation

## Getting started

```bash
cd backend
npm install
cp .env.example .env      # then edit JWT_SECRET, CORS_ORIGIN, etc.
npm run seed               # creates the 12 doctors + a default admin user
npm start                  # or: npm run dev (auto-restart on save)
```

The API runs at `http://localhost:5000` by default. Default admin login (from seeding):

```
email:    admin@doonhospital.com
password: Admin@12345
```

**Change `ADMIN_PASSWORD` and `JWT_SECRET` in `.env` before deploying anywhere real.**

## Connecting the existing frontend

The frontend currently has no `fetch` calls at all — the forms in `login.html`,
`register.html`, `appointment.html`, and `contact.html` just have `id`s for JS to read.
To wire it up, in `JS/script.js` replace the form-submit handlers with calls like:

```js
const res = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
if (res.ok) {
  localStorage.setItem("token", data.token); // used for authenticated requests later
} else {
  // show data.error to the user
}
```

For authenticated requests (e.g. `GET /api/appointments/me`), send the saved token:

```js
fetch("http://localhost:5000/api/appointments/me", {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
```

Update `CORS_ORIGIN` in `.env` to match wherever you serve the HTML files from
(e.g. `http://localhost:5500` for VS Code Live Server).

## API Reference

All request/response bodies are JSON. Protected routes require
`Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Route         | Auth   | Body                                          | Notes                          |
|--------|---------------|--------|------------------------------------------------|--------------------------------|
| POST   | `/register`   | Public | `name, email, phone, password`                 | Password min 8 chars           |
| POST   | `/login`      | Public | `email, password`                              | Returns `{ token, user }`      |
| GET    | `/me`         | User   | —                                              | Current logged-in user         |

### Doctors — `/api/doctors`

| Method | Route      | Auth   | Notes                                             |
|--------|------------|--------|----------------------------------------------------|
| GET    | `/`        | Public | Optional `?department=cardiology` filter           |
| GET    | `/:id`     | Public | Single doctor                                       |
| POST   | `/`        | Admin  | Create doctor                                       |
| PUT    | `/:id`     | Admin  | Update doctor                                       |
| DELETE | `/:id`     | Admin  | Remove doctor                                       |

Departments match the `<select>` in `appointment.html`: `cardiology`, `neurology`,
`orthopedics`, `ent`, `dental`, `general`.

### Appointments — `/api/appointments`

| Method | Route            | Auth          | Notes                                              |
|--------|------------------|---------------|------------------------------------------------------|
| POST   | `/`              | Optional      | Book an appointment (guest or logged-in)             |
| GET    | `/me`            | User          | Your own appointments                                |
| GET    | `/`              | Admin         | All appointments                                      |
| PATCH  | `/:id/status`    | Admin         | Body: `{ status }` — pending/confirmed/cancelled/completed |
| DELETE | `/:id`           | Owner/Admin   | Cancel an appointment                                 |

### Contact — `/api/contact`

| Method | Route            | Auth   | Notes                              |
|--------|------------------|--------|--------------------------------------|
| POST   | `/`              | Public | Submit the contact form              |
| GET    | `/`              | Admin  | List all messages                    |
| PATCH  | `/:id/resolve`   | Admin  | Mark a message resolved              |

### Health

`GET /api/health` → `{ status: "ok", timestamp }`

## Project structure

```
backend/
├── server.js            # app entry point, middleware, route mounting
├── config/db.js         # lowdb JSON database setup
├── data/
│   ├── db.json          # generated at runtime — data lives here
│   └── seed.js           # seeds doctors + default admin (npm run seed)
├── models/               # data access layer (User, Doctor, Appointment, Contact)
├── middleware/auth.js    # requireAuth, requireRole, optionalAuth
└── routes/                # auth.js, doctors.js, appointments.js, contact.js
```

## Notes on the JSON "database"

`lowdb` just reads/writes `data/db.json` on disk — fine for local dev, demos, and small
deployments, but it's not built for concurrent writes at scale. When you're ready for
production, swap `config/db.js` and the `models/*.js` files for a real database
(e.g. Mongoose + MongoDB, or Prisma + Postgres); the route files won't need to change
since they only call the model functions (`User.create`, `Appointment.findAll`, etc.).
