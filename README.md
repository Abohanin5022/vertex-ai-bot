# packora-dashboard

A Next.js dashboard application.

## Development

Use Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Checks

Run the full local verification suite before pushing changes:

```bash
npm run check
```

The check script runs merge-conflict marker detection, `npm audit`,
ESLint, and the production build.

## Automation

GitHub Actions runs the same verification suite on pull requests, pushes to
`main`, and manual workflow dispatches. Dependabot checks npm packages and
GitHub Actions weekly using the Asia/Riyadh timezone.
