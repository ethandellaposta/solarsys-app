# Solar System Explorer

Interactive 3D solar system visualization built with Next.js and React Three Fiber.

## Local Development

Run from the app directory:

```bash
cd solarsys-app
npm install
npm run dev
```

Dev server runs on `http://localhost:3026`.

## Vercel CI/CD Setup

This repo is configured with:

- Vercel project config: `vercel.json`
- Vercel ignore rules: `.vercelignore`
- CI workflow: `.github/workflows/ci.yml`
- Production deploy workflow: `.github/workflows/vercel-deploy.yml`

### 1) Connect Project to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import the GitHub repo.
3. Keep framework as **Next.js**.
4. Complete first deploy.

### 2) Get Required Vercel IDs/Tokens

From `solarsys-app` directory:

```bash
npx vercel login
npx vercel link
```

Then copy values from `.vercel/project.json`:

- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

Create a Vercel token at: https://vercel.com/account/tokens

- Token value → `VERCEL_TOKEN`

### 3) Add GitHub Repository Secrets

In GitHub → **Settings → Secrets and variables → Actions**, add:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 4) Deployment Behavior

- **CI** (`ci.yml`) runs on pushes + pull requests and performs install/build checks.
- **Production Deploy** (`vercel-deploy.yml`) runs on pushes to `main` (or manual trigger).

## Useful Commands

```bash
npm run build
npm run lint
```
