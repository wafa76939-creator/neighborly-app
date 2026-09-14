# Neighborly

**See the issue. Find the pattern. Improve the neighborhood.**

Neighborly is a civic-tech MVP that turns individual neighborhood reports into collective evidence. Residents log issues, neighbors confirm them with Same here, and the backend groups activity by normalized address. When a location reaches **5 or more reports in 30 days**, it is flagged as a **HOTSPOT** — computed live with MongoDB aggregation, never stored as a hardcoded status.

## Features

- JWT authentication (register, login, session)
- Multi-step issue reporting with Leaflet location picker and optional Cloudinary photo
- Community confirmation (Same here) and Reddit-style comments
- Explore map/list with category, date, status, and hotspot filters
- Dashboard with neighborhood activity map and trending locations
- Hotspot analytics: 30-day counts, category doughnut, frequency chart with threshold line, timeline
- My Reports and contribution profile
- Responsive desktop sidebar + mobile bottom navigation

## Tech stack

- HTML, CSS, vanilla JavaScript (ES modules)
- Leaflet.js + OpenStreetMap + marker clustering
- Chart.js
- Node.js, Express, Mongoose
- MongoDB Atlas
- JWT + bcrypt
- Cloudinary

## Architecture

```
frontend/          static SPA (hash router)
backend/           Express REST API
  controllers/
  models/          User, Report
  routes/
  utils/           addressNormalizer, hotspotQuery
  scripts/seed.js
```

Reports are grouped by `normalizedAddress`. Hotspot detection is derived:

```
if reportsLast30Days >= 5
  hotspot = true
```

## Setup

1. Create a MongoDB Atlas cluster and a Cloudinary account.
2. Copy `backend/.env.example` to `backend/.env` and fill in values.
3. Install and seed:

```bash
cd backend
npm install
npm run seed
npm run dev
```

Open [http://localhost:5002](http://localhost:5002).

## Demo credentials

- **demo@neighborly.com** / **Demo123!**
- Also: alex@neighborly.com, jordan@neighborly.com (same password)

## Portfolio demo flow (under 2 minutes)

1. Log in as `demo@neighborly.com`.
2. Dashboard shows Springfield map, stats, and trending hotspots.
3. Report Issue → Noise → **124 Main Street, Springfield** → submit.
4. Open the report → Same here.
5. Hotspots → **124 Main Street**.
6. Show HOTSPOT badge, 12+ reports in 30 days, category chart, frequency chart, pattern insight.
7. Explore → filter Noise.

## API

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/register` | no |
| POST | `/api/auth/login` | no |
| GET | `/api/auth/me` | yes |
| GET | `/api/reports` | optional |
| GET | `/api/reports/me` | yes |
| GET | `/api/reports/:id` | optional |
| POST | `/api/reports` | yes |
| POST | `/api/reports/:id/same-here` | yes |
| POST | `/api/reports/:id/comments` | yes |
| PATCH | `/api/reports/:id/status` | yes |
| GET | `/api/hotspots` | optional |
| GET | `/api/hotspots/:address` | optional |
| GET | `/api/dashboard/stats` | optional |
| GET | `/api/dashboard/activity` | optional |

## Future

Public read-only neighborhood view, heatmap overlay, email digest, and address-owner status workflow.
