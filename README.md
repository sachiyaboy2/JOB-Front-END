# Job Portal — Front end

React 19 + Vite 8 + Tailwind CSS 4 single-page app for the Smart Job Portal &
Recruitment Management System (Sri Lanka).

## Run it

```bash
npm install
npm run dev        # http://localhost:5180
```

The dev server proxies `/api` to the API. Point it somewhere else with
`VITE_PROXY_TARGET` (default `http://localhost:5001`) in `.env`.

For a production build:

```bash
npm run build      # dist/
npm run preview    # http://localhost:5180, same /api proxy
```

When the API lives on another origin, build with an absolute base URL instead of
the proxy:

```bash
VITE_API_URL=https://api.example.com/api npm run build
```

## Back end

The API lives in the sibling `Back-END` folder: `npm install && npm run seed && npm run dev`
(listens on `http://localhost:5001`, database `mongodb://127.0.0.1:27017/job-portal`).

Seeded accounts (password `Password123` for all):

| Role     | Email                      |
| -------- | -------------------------- |
| Admin    | admin@jobportal.local      |
| Employer | hr@ceylonsolutions.lk      |
| Seeker   | nimal.perera@example.lk    |

## What is inside

- 27 routes: public (home, jobs, job detail, companies, about, contact, FAQ),
  auth (login, register), seeker (dashboard, profile, CV, applications, saved
  jobs), employer (dashboard, jobs, job form, applicants, company) and admin
  (dashboard, approvals, jobs, employers, users, categories & districts).
- Light and dark theme on every page, remembered in `localStorage`.
- Three.js aurora hero on the home page (lazy loaded, pauses when the tab is
  hidden, disabled under `prefers-reduced-motion`).
- Shared design system in `src/styles/tokens.css` and `src/styles/motion.css`.
