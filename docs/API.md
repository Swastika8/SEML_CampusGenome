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

| Query                 | Allowed values / default                                                  |
| --------------------- | ------------------------------------------------------------------------- |
| `category`            | `Discussion`, `Academics`, `Career`, `Communities`, `Events`, `Lifestyle` |
| `search`              | Up to 150 characters; literal substring matching                          |
| `sort`                | `recent` (default), `hot`, `top`, `trending`, `top_verified`, `oldest`    |
| `page`                | Positive integer, default 1                                               |
| `limit`               | Integer 1-100, default 20                                                 |
| `department`, `year`  | Optional academic filters                                                 |
| `saved`               | `true` to return the authenticated student's collection                   |
| `community`, `campus` | Optional community slug and exact university name (case-insensitive)      |
| `scope`, `window`     | `all` or `following` (requires sign-in); `all`, `week`, or `month`        |

The result includes `data` and `pagination: {total, page, limit, totalPages}`. Posts include community details, `forum_post_kind`, net `score`, the viewer's `my_vote` and `has_reported`, and existing save, verify, and RSVP fields. Existing posts without explicit communities appear in their category's starter community. Removed contributions are excluded.

`GET /nodes/:id` returns a single visible contribution. `GET /stats` returns actual campus totals. `GET /health` returns the database mode and readiness; database failures return 503.

## Contributions and discussion

| Method | Route                     | Behavior                                                                                                                |
| ------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| POST   | `/nodes`                  | Publish a validated contribution; authenticated; +10 author reputation                                                  |
| DELETE | `/nodes/:id`              | Soft-remove by the author, community owner, or site moderator. Reverses contribution and verification reputation.       |
| POST   | `/nodes/:id/verify`       | Toggle verification; authenticated; self-verification rejected; +/-5 author reputation                                  |
| PUT    | `/nodes/:id/vote`         | Set `value` to `1`, `-1`, or `0`. Only the latest vote counts.                                                          |
| GET    | `/nodes/:nodeId/comments` | Read up to 200 entries. Pass `after=<nextCursor>` for the next page.                                                    |
| POST   | `/nodes/:nodeId/comments` | Post `text` (1–2,000 characters), optionally with `parentId` in the same discussion. Replies are limited to six levels. |

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

Forum posts accept `communitySlug` and `postKind` (`Discussion`, `Question`, `Guide`, or `Link`). A link post requires `linkUrl`. Posts with an explicit community can include an optional `imageUrl`.

## Communities and moderation

| Method       | Route                                 | Behavior                                                                                                                                |
| ------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| GET          | `/forum/communities`                  | Public directory with `search`, `campus`, `page`, and `limit`. `joined=true` requires sign-in.                                          |
| POST         | `/forum/communities`                  | Create a public community with `name`, unique `slug`, `campus`, and `description`. The authenticated creator joins automatically.       |
| GET          | `/forum/communities/:slug`            | Public details, member and post counts, and the viewer's membership.                                                                    |
| PUT / DELETE | `/forum/communities/:slug/membership` | Join or leave as the signed-in student. Both operations are idempotent.                                                                 |
| PUT          | `/nodes/:id/report`                   | Report a post with a predefined `reason`. One report per account per post.                                                              |
| GET          | `/forum/reports`                      | Pending reports grouped by post. Community owners see their own communities. Site moderators see all. Reporter identities stay private. |
| POST         | `/forum/reports/:id`                  | Review the reports for post `:id` with `action` set to `dismiss` or `remove`.                                                           |

## Labs exports

`GET /labs/pocket` returns the signed-in account's visible saved posts. `GET /labs/calendar` downloads its visible RSVPs as all-day iCalendar entries and returns the number of skipped dates in `X-Campus-Skipped-Events`. Exports are private and limited to 1,000 entries per request.

## Private saves and event attendance

| Method | Route                 | Behavior                                                             |
| ------ | --------------------- | -------------------------------------------------------------------- |
| PUT    | `/nodes/:id/bookmark` | Save for this student; idempotent                                    |
| DELETE | `/nodes/:id/bookmark` | Remove this student's save; idempotent                               |
| PUT    | `/nodes/:id/rsvp`     | RSVP to a visible event; duplicates prevented; ended events rejected |
| DELETE | `/nodes/:id/rsvp`     | Cancel this student's RSVP                                           |

## Daily campus dilemma

`GET /pulse` returns today's question, four options with aggregate vote counts, the total, campus date and the signed-in student's `myVote` (or `null`). The campus day uses `Asia/Kolkata`.

`PUT /pulse/vote` requires authentication and JSON `{ "pollDate": "YYYY-MM-DD", "optionId": 0 }`. Options are integers 0-3. Repeated requests are idempotent; choosing another option updates the same daily vote. The unique key is `(poll_date, user_id)`. A stale campus date returns 409.

`DELETE /pulse/vote` requires authentication and JSON `{ "pollDate": "YYYY-MM-DD" }` and removes that student's daily vote. Vote identities are never included in the public response.

## Campus-plan reference data

Building responses include `map_data` for places in the supplied campus plan. It contains the schematic SVG footprint, label placement, order and source marker. Startup installs 17 reference places on both supported database adapters; conflict updates change only geometry and preserve existing names, field notes and other campus data. Legacy demo places stay available through the API with no mapped geometry.

## Existing resource routes

Read-only category endpoints remain available at `/academics`, `/career`, `/communities`, `/events`, and `/lifestyle`. `/buildings` and `/courses` expose their campus resource collections. Building history writes and course reviews now require authentication and validated text. Public user profiles omit email addresses; `/auth/me` is the student's private account endpoint.

## Operational configuration

The default API rate limit is 300 requests per IP per minute (`API_RATE_LIMIT`), with a separate limit of 50 authentication writes per 15 minutes. The browser suite sets a higher API limit only for its isolated test server to accommodate repeated full-page reloads. Limits use a process-local store. Origins are explicitly configured through `CORS_ORIGINS`. `TRUST_PROXY_HOPS` accepts an integer from 0 to 5 and defaults to 0. Set it to the verified proxy hop count for your deployment topology; do not enable arbitrary proxy trust.

Native PostgreSQL migrations are additive at startup. Demo data is loaded only in explicit demo mode when its database is empty, or by the deliberately invoked seed command. Database files, `.env` files and credentials are excluded from version control.
