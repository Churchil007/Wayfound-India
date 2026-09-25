# Wayfound India

An interactive map of museums, churches, galleries and historic sites across India, built for foreign tourists. Stylized India-outline map, category filters, search, and a detail panel with entry fees, hours, and a "Get directions" link to real coordinates.

## Project structure

```
wayfound-india/
├── backend/
│   ├── data/sites.json      # site data (30 places)
│   ├── routes/sites.js      # /api/sites routes
│   ├── server.js            # Express app entry point
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js            # fetches from the API and renders the map/list
├── Dockerfile
├── docker-compose.yml
├── render.yaml               # Render.com cloud deploy config
└── README.md
```

## Run it locally

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:4000** — the backend serves both the API and the frontend from one server.

For auto-reload while editing the backend:

```bash
npm run dev
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/sites` | All sites. Supports `?category=museum` and `?search=agra` |
| GET | `/api/sites/:id` | A single site by id |
| GET | `/api/sites/categories` | Distinct category list |
| GET | `/api/health` | Health check, used by cloud platforms |

Example:

```bash
curl "http://localhost:4000/api/sites?category=church&search=goa"
```

## Run with Docker

```bash
docker compose up --build
```

Open **http://localhost:4000**.

## Deploy to the cloud

**Option A — Render (easiest, free tier available)**
1. Push this folder to a GitHub repo.
2. On [render.com](https://render.com), choose **New → Blueprint**, and point it at the repo. It will read `render.yaml` automatically.
3. Render builds and deploys; you'll get a public URL.

**Option B — Any Docker host (Fly.io, Railway, AWS App Runner, Azure Container Apps, etc.)**
1. Build the image: `docker build -t wayfound-india .`
2. Push it to your registry of choice and deploy it, exposing port `4000`.
3. Set the `PORT` environment variable if your platform requires a different port.

**Option C — Separate frontend/backend hosting**
If you'd rather host the frontend on something like Netlify or Vercel and the backend separately (e.g. Render, Railway):
1. Deploy the `backend/` folder as its own Node service.
2. In `frontend/js/app.js`, change `API_BASE` from `"/api"` to your backend's full URL, e.g. `"https://your-api.onrender.com/api"`.
3. Deploy the `frontend/` folder as a static site.
4. Make sure CORS stays enabled on the backend (already set up via the `cors` package).

## Data

Site data lives in `backend/data/sites.json` — a plain JSON file, easy to hand-edit or later swap for a real database (Postgres, MongoDB, etc.) without changing the API's response shape. All hours, fees, and coordinates are prototype-accuracy — verify before publishing live.

## Next steps you may want

- Swap the stylized outline map for a real, zoomable Leaflet.js + OpenStreetMap map (free, no API key).
- Move `sites.json` into a real database once you need editing without redeploying.
- Add images per site (currently a colored placeholder + emoji glyph).
- Add multi-language support for international visitors.
