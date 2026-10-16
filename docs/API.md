# CampusGenome API

Base URL: `/api`. The frontend uses the Vite proxy in development; set `VITE_API_URL` for a separate deployed API origin. JSON responses include `success`; errors include a message, optional field `errors`, and a request ID for unexpected failures. The `X-Request-ID` response header identifies every request.

## Accounts

| Method | Route            | Purpose                                                           |
| ------ | ---------------- | ----------------------------------------------------------------- |
| POST   | `/auth/register` | Register and receive a token and public account data              |
| POST   | `/auth/login`    | Sign in by email or handle                                        |
| POST   | `/auth/demo`     | Student session in explicit local demo mode only                  |
| GET    | `/auth/me`       | Signed-in profile, contribution count, saved count and RSVP count |

Authenticated requests send `Authorization: Bearer <token>`. Tokens use HS256, issuer `campus-genome`, and audience `campus-genome-web`. The default lifetime is one day. The frontend uses session storage unless the student selects the persistent sign-in option.

```json
{ "loginIdentifier": "@StudentJohn", "password": "password123" }
```

Registration accepts `name`, `handle`, `email`, `password`, optional `department`, and optional numeric `graduationYear`. Passwords require at least eight characters and are limited to 72 UTF-8 bytes to match bcrypt's input bound. Email and handle uniqueness is case-insensitive.

## Discovery

`GET /nodes` supports:

| Query                | Allowed values / default                                    |
| -------------------- | ----------------------------------------------------------- |
| `category`           | `Academics`, `Career`, `Communities`, `Events`, `Lifestyle` |
| `search`             | Up to 150 characters; literal substring matching            |
| `sort`               | `recent` (default), `trending`, `top_verified`, `oldest`    |
| `page`               | Positive integer, default 1                                 |
| `limit`              | Integer 1-100, default 20                                   |
| `department`, `year` | Optional academic filters                                   |
| `saved`              | `true` to return the authenticated student's collection     |

The result includes `data` and `pagination: {total, page, limit, totalPages}`. Each contribution includes author information, category details, actual engagement counts, and personalized `is_saved`, `is_verified_by_me` and `is_attending` fields when authenticated. Removed contributions are excluded.

`GET /nodes/:id` returns a single visible contribution. `GET /stats` returns actual campus totals. `GET /health` returns the database mode and readiness; database failures return 503.

## Contributions and discussion

| Method | Route                     | Behavior                                                                                 |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------- |
| POST   | `/nodes`                  | Publish a validated contribution; authenticated; +10 author reputation                   |
| DELETE | `/nodes/:id`              | Soft-remove; author or moderator/admin; reverse contribution and verification reputation |
| POST   | `/nodes/:id/verify`       | Toggle verification; authenticated; self-verification rejected; +/-5 author reputation   |
| GET    | `/nodes/:nodeId/comments` | Read the oldest 200 discussion entries                                                   |
| POST   | `/nodes/:nodeId/comments` | Post 1-2000 characters; server chooses author; +2 commenter reputation                   |

Minimum contribution:

```json
{
  "category": "Academics",
  "title": "A practical guide to database joins",
  "description": "Start with a small dataset and explain why each join returns those rows.",
  "department": "CS",
  "year": "TY",
  "subject": "Databases"
}
```

Titles are limited to 255 characters; descriptions require 15-10,000 characters. Events additionally require an ISO `eventDate` (`YYYY-MM-DD`); optional fields include `eventTime`, `eventLocation`, and `imageUrl`. Career opportunities may include `company`, `companyRole`, `applyLink`, `domain`, `opportunityType`, and `statsOrPackage`. Lifestyle contributions may include `location`, `spotName`, `secret`, `tags`, and `imageUrl`. Communities may include `clubName`, `communityCategory`, and `nextMeeting`. URLs must use HTTP or HTTPS. Images are URL references, not file uploads.

## Private saves and event attendance

| Method | Route                 | Behavior                                                             |
| ------ | --------------------- | -------------------------------------------------------------------- |
| PUT    | `/nodes/:id/bookmark` | Save for this student; idempotent                                    |
| DELETE | `/nodes/:id/bookmark` | Remove this student's save; idempotent                               |
| PUT    | `/nodes/:id/rsvp`     | RSVP to a visible event; duplicates prevented; ended events rejected |
| DELETE | `/nodes/:id/rsvp`     | Cancel this student's RSVP                                           |

## Existing resource routes

Read-only category endpoints remain available at `/academics`, `/career`, `/communities`, `/events`, and `/lifestyle`. `/buildings` and `/courses` expose their campus resource collections. Building history writes and course reviews now require authentication and validated text. Public user profiles omit email addresses; `/auth/me` is the student's private account endpoint.

## Operational configuration

The default API rate limit is 300 requests per IP per minute (`API_RATE_LIMIT`), with a separate limit of 50 authentication writes per 15 minutes. The browser suite sets a higher API limit only for its isolated test server to accommodate repeated full-page reloads. Limits use a process-local store. Origins are explicitly configured through `CORS_ORIGINS`. Do not enable arbitrary proxy trust; configure it for your actual deployment topology if a reverse proxy is introduced.

Native PostgreSQL migrations are additive at startup. Demo data is loaded only in explicit demo mode when its database is empty, or by the deliberately invoked seed command. Database files, `.env` files and credentials are excluded from version control.
