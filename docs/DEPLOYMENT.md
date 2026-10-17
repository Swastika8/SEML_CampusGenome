# Deploy CampusGenome

Use Vercel for the React frontend and Render for the Express API and PostgreSQL. Connect repository `Swastika8/SEML_CampusGenome`, branch `main`. No cloud resources have been created yet.

## 1. Create PostgreSQL on Render

Choose **New > Postgres**, name it `campusgenome-db`, and choose a region. Use the same region for the API. Once available, copy the **Internal Database URL** into the API's private `DATABASE_URL` variable.

Render's free PostgreSQL databases expire after 30 days. Use a paid database for longer-term data retention. Free web services can also sleep after inactivity.

## 2. Deploy the API on Render

Choose **New > Web Service**, connect the repository, and use:

| Setting           | Value                                 |
| ----------------- | ------------------------------------- |
| Branch            | `main`                                |
| Root Directory    | `backend`                             |
| Runtime           | Node                                  |
| Node version      | 24, pinned by `backend/.node-version` |
| Build Command     | `npm ci`                              |
| Start Command     | `npm start`                           |
| Health Check Path | `/api/health`                         |
| Region            | Same as the database                  |

Add these environment variables:

| Variable           | Value                                                                                |
| ------------------ | ------------------------------------------------------------------------------------ |
| `NODE_ENV`         | `production`                                                                         |
| `DB_MODE`          | `postgres`                                                                           |
| `DATABASE_URL`     | The Render database's private internal URL                                           |
| `JWT_SECRET`       | A newly generated random secret, using the command below                             |
| `CORS_ORIGINS`     | The final frontend origin, such as `https://campusgenome.vercel.app`                 |
| `TRUST_PROXY_HOPS` | `1` for this direct Render setup; verify client-IP behavior for your actual topology |

Render supplies `PORT`. The API listens on `0.0.0.0` in PostgreSQL mode, so keep `HOST` unset. If a `NODE_VERSION` variable already exists, set it to `24` because it overrides the version file.

Generate a secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Paste the result only into Render's secret settings and keep it stable across deployments. The API rejects missing or placeholder production secrets.

The frontend URL does not need to exist when the API first starts. After Vercel assigns the production URL, update `CORS_ORIGINS` to that exact origin, without a trailing slash or path, and redeploy the API. Multiple approved origins can be comma-separated; individual preview deployments need their own exact origins.

The API applies the additive schema at startup and installs the supplied campus plan's 17 reference places. Existing field notes are preserved. **Do not run `db:init` on Render**: the managed database already exists. Production starts with empty post, account and poll-vote tables. Register your own account through the hosted frontend. Local demo accounts and PGlite data are not automatically copied.

Open `https://YOUR-API.onrender.com/api/health` after deployment. Confirm `status` is `healthy` and `mode` is `postgres`.

## 3. Deploy the frontend on Vercel

Choose **Add New > Project**, import the same repository, and use:

| Setting          | Value           |
| ---------------- | --------------- |
| Root Directory   | `frontend`      |
| Framework        | Vite            |
| Node.js Version  | `24.x`          |
| Install Command  | `npm ci`        |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |

Before deploying, add this environment variable for **Production**:

```text
VITE_API_URL=https://YOUR-API.onrender.com/api
```

Replace the hostname with the actual Render web-service hostname. This is public frontend configuration; database URLs and JWT secrets belong only on Render.

`frontend/vercel.json` includes the SPA rewrite for direct visits and refreshes on paths such as `/map`, `/saved` and `/nodes/1`. API calls go directly to the Render origin. The Vite development proxy is not used in production.

Deploy, copy the final frontend origin into Render's `CORS_ORIGINS`, and let the API redeploy. If `VITE_API_URL` changes later, redeploy the frontend because Vite embeds it during the build.

## 4. Verify the live site

1. Check the API health endpoint.
2. Register, sign out, and sign in again.
3. Publish a contribution, comment, and pocket it. Reload to verify persistence.
4. Open `/map` directly, refresh, and pin a building field note.
5. Restart the API and confirm saved database content remains.
6. Check Render logs for proxy/rate-limit errors. Re-evaluate the trusted hop count if you add another proxy or CDN.

Future pushes to `main` can trigger automatic redeploys on both connected projects.

## Sample data

The local demo uses sample accounts with a public sample password. Create real accounts and contributions for the public production site. A deliberate demo-data import or migration of existing campus data should be planned separately.

## Official references

- [Render monorepo directories](https://render.com/docs/monorepo-support)
- [Render PostgreSQL connections](https://render.com/docs/postgresql-creating-connecting)
- [Render Node.js versions](https://render.com/docs/node-version)
- [Render free service limits](https://render.com/docs/free)
- [Vite on Vercel and SPA rewrites](https://vercel.com/docs/frameworks/frontend/vite)
- [Express rate-limit proxy configuration](https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues)
