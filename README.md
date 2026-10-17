# CampusGenome

The student-powered campus collective: academic guides, opportunities, events, communities, campus places, and the useful knowledge students pass on.

CampusGenome now feels like an unofficial student common room: readable posts, topic channels, helpful votes, student handles and a pinned community board. Gold accents, serif headlines, sticky notes, doodles and the midnight theme retain its creative personality. Real API interactions and a self-contained local demo support the experience. The implementation report is at [output/pdf/CampusGenome-Upgrade-Report.pdf](output/pdf/CampusGenome-Upgrade-Report.pdf).

## Start the local demo

Requires Node.js 22.12 or newer. Node 24 was used for verification.

```sh
npm install
npm run setup
npm run dev
```

Open **http://127.0.0.1:5173**. The API runs at **http://127.0.0.1:5000/api**. The launcher waits for API readiness before starting the frontend. Dependencies are already installed in this workspace.

The root `dev` command explicitly selects the local demo. No PostgreSQL service or `.env` file is needed for that mode. PGlite executes real PostgreSQL SQL and persists changes under `backend/.data/campus`; this directory is ignored by Git. First startup creates the schema and sample content. Sample event dates are set relative to that first startup, then remain unchanged.

You can browse without an account. To try writes, open **Sign in** and select **Try the student demo**, or register a new account. Seeded accounts include `@StudentJohn`, `@TechGuru`, `@CampusExplorer`, and moderator `@SwastikaSinha`; their sample password is `password123`. Demo mode is rejected in production and the demo API binds to the loopback interface by default.

## What changed

- A daily campus dilemma with one changeable vote per account, real aggregate totals, undo and midnight IST rollover.
- A private, clearable browser reading trail, separated by account and held until sign-in initialization finishes.
- Optional library mode that hides feed photos and remembers the reading preference.
- The supplied campus plan traced into 17 selectable places, including all four gates, searchable by name and filterable by type. Reference data loads on hosted and demo databases while preserving field notes.

- A common-room homepage with post voting rails, author handles, flairs, replies, pocket saves, share links, a composer and contributor karma.
- Server-filtered channels: Exam survival, After class, Future you, What's happening and Find your people. Buzzing, Fresh and Most helpful sorts use the actual API with pagination.
- A compact search header, readable paper surfaces, playful pinboard notes and a calmer campus backdrop, with a collapsible icon rail and guided tour.
- A clean illustrated field guide with numbered places, URL-backed selection, a directory and one readable details panel that stacks on mobile.
- Authenticated building field notes with server-selected authors, persistence and real history, plus useful Wi-Fi and quiet-spot accordions.
- The original academic drilldown, editorial career page, news mosaic and organic lifestyle layouts.
- A daily DNA capsule: crack it open to reveal a real campus find, shuffle to another strand, follow it, or tuck it in your pocket with a little confetti.
- Optional campus side quests whose progress reflects actual saved finds, event RSVPs and contributions. No invented points or streaks.
- A playful campus mood forecast and a shuffleable event feed.
- A paginated discovery view alongside the original category pages, with filters, sorting, URL-backed searches, empty states and retries.
- Keyboard command search with Ctrl/Cmd+K and actual API results.
- Private saved collections, persistent event RSVPs, contribution detail pages, real discussions, and peer verification.
- Category-aware contribution forms with validation, pending states, field errors, publication feedback, and reputation updates.
- The account page shows real contribution, pocket and RSVP totals.
- Responsive layouts, saved dark/light mode, focus-managed dialogs, labeled mobile navigation, a skip link, reduced-motion support, and a render error boundary.
- Authenticated and validated writes, safer transactions, row-locked verification, protected removal, case-insensitive account uniqueness, bounded pagination, request IDs, controlled error responses, health checks, security headers, origin restrictions, and rate limits.
- A working local demo, standard PostgreSQL support, isolated integration/browser tests, consistent formatting, updated dependencies, and a PDF handover.

The original page compositions are connected to API data. Existing UML models and category routes remain available. The `/events/:id` detail URL remains an alias for the contribution detail view.

## Technology choices

| Layer               | Stack                                                         | Reason                                                                                                     |
| ------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Frontend            | React 19, React Router 7                                      | Keeps the established component architecture and supports consistent client navigation                     |
| Design              | Tailwind CSS 4, Lucide icons, React Joyride, matching CSS     | Preserves the original glass, gold, serif and midnight identity, including its guided tour                 |
| Build               | Vite 8                                                        | Fast iteration, optimized output, and a same-origin API proxy                                              |
| Backend             | Node.js, Express 4                                            | Maintains the existing JavaScript API and route structure                                                  |
| Database            | PostgreSQL via pg; PGlite for the local demo                  | Relational integrity and real transactions, with a database-service-free demo                              |
| Validation/security | Zod, bcryptjs, jsonwebtoken, Helmet, cors, express-rate-limit | Explicit validation, authenticated identity, password hashing, signed sessions, headers and request limits |
| Verification        | Node test runner, Playwright, Oxlint, Prettier                | Repeatable HTTP/SQL checks, browser workflows, linting and readable source                                 |
| Report              | Python, ReportLab, Poppler                                    | A reproducible, visually verified PDF                                                                      |

Tailwind uses its updated Vite integration with the original theme configuration. Scoped common-room CSS handles forum hierarchy and responsive field-guide columns while retaining gold, serif and midnight elements. Existing APIs support votes and field notes, so these additions require no new dependency or external service. The API helper also propagates cancelled response parsing correctly to prevent a feed render failure. Lockfiles preserve the tested versions.

## Use standard PostgreSQL

For hosted deployment, follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). It includes the Vercel frontend and Render API/database settings, environment variables and verification steps.

1. Configure `backend/.env` from `backend/.env.example`. Supply PostgreSQL credentials (or `DATABASE_URL`), `DB_MODE=postgres`, and a unique JWT secret.
2. Initialize the database and additive schema:

   ```sh
   npm run db:init
   ```

3. Start the API in one terminal and the frontend in another:

   ```sh
   npm run start:backend
   ```

   ```sh
   npm run dev:frontend
   ```

The init command does **not** insert sample data. Run `npm run db:seed` only if you intentionally want the example dataset. Existing seeded records are not overwritten by the seed inserts; displayed sample counters are reconciled with their actual rows. API startup also applies the additive schema, including the bookmarks and event attendance tables.

For production, set `NODE_ENV=production`, a random `JWT_SECRET` of at least 32 characters, `CORS_ORIGINS`, and a durable PostgreSQL connection. The Vite development proxy is for local development; use an appropriate same-origin reverse proxy or `VITE_API_URL` for a separate frontend deployment. Secrets belong in backend configuration, never in `VITE_` variables. No external deployment was performed.

## Verification commands

| Command                       | What it checks                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm test`                    | 18 API integration checks against an isolated in-memory PGlite database                                            |
| `npm run test:postgres`       | The same 18 checks in a temporary schema on your configured PostgreSQL server; the schema is removed after the run |
| `npm run test:e2e`            | Eighteen browser scenarios using separate in-memory API and frontend servers                                       |
| `npm run lint`                | Frontend lint rules, including React hooks                                                                         |
| `npm run build`               | Frontend production build                                                                                          |
| `npm run format:check`        | Source formatting                                                                                                  |
| `npm run format`              | Format the application source                                                                                      |
| `npm --prefix frontend audit` | Frontend dependency advisories                                                                                     |
| `npm --prefix backend audit`  | Backend dependency advisories                                                                                      |

Browser tests use Microsoft Edge on Windows. On other platforms, install the Playwright browser with `npx playwright install chromium`. The browser suite covers restored public routes, academic drilldown, demo login/logout, registration, remembered login, publishing, discussion persistence, removal permissions, pocket saves, RSVPs, verification, keyboard search, theme persistence, the icon rail, capsule discovery and real quest progress. Overflow checks cover 320, 390, 768, 1024 and 1440 pixel widths.

At delivery: **18 embedded API checks, 18 native PostgreSQL checks, and 18 browser scenarios passed**. Lint and build passed, and both application dependency audits reported zero known advisories. Native PostgreSQL tests create a unique `cg_test_...` schema and never write to existing campus tables.

## API and project layout

See [docs/API.md](docs/API.md) for requests, response behavior, validation limits and security configuration.

```text
backend/src/app.js            Testable Express application
backend/src/server.js         Bootstrap, listener and graceful shutdown
backend/src/config/           Database adapters and signing configuration
backend/src/controllers/      Domain behavior and transactional writes
backend/src/middleware/       Authentication, validation and controlled errors
backend/src/db/               Additive schema, explicit seed and demo bootstrap
backend/test/                 HTTP/SQL integration suite
frontend/src/components/     Application shell and shared UI
frontend/src/context/        Account, data, theme, toast and contribution state
frontend/src/pages/          Overview, discovery, details, map, profile, sign-in
frontend/src/lib/            Shared API client and content helpers
frontend/src/*.css           Design system, detail layouts and responsive rules
tests/browser/              Playwright workflow and layout checks
scripts/                    Startup, native tests, screenshots and PDF generation
output/pdf/                 Completed handover report
postman/                    Existing API collection
*.mdj                       Preserved UML models
```

## Report and screenshot regeneration

With the local app running, `npm run capture` saves screenshots to `tmp/qa`. The checked-in report is already generated. To rebuild it, use Python with ReportLab installed and run `python scripts/create_report.py`; the script reads the dashboard screenshot. Poppler can render the result for visual review. The report uses Windows fonts on this Windows workspace.

## Current boundaries

The map is schematic and the mood forecast is decorative. Image attachments use HTTP/HTTPS image URLs; an upload bucket and Google SSO are not configured. Demo content is explicitly labeled. The daily capsule draws from up to 100 fetched contributions; the common-room and discovery feeds are paginated. Remote images require network access, with a local campus-photo fallback. Rate limits currently use an in-process store; a multi-instance deployment needs shared rate-limit storage. Session storage is the default; persistent sign-in uses local storage.

Academic project for the Software Engineering & Modeling Laboratory.
