# Blockify deployment fix

This bundle is meant to be dropped into the root of your GitHub repository before redeploying to Vercel.

## What changed

- Switched installs from pnpm to npm because Vercel was failing during package metadata fetches.
- Pinned Node to 22 so Vercel uses a stable runtime.
- Changed Next.js to build into `out/` by using `distDir: "out"`, which matches Vercel's expectation from your project settings.
- Added a generated `package-lock.json` so installs are deterministic.

## Files in this bundle

- `package.json`
- `package-lock.json`
- `vercel.json`
- `.nvmrc`
- `next.config.mjs`

## How to use it

1. Unzip this bundle.
2. Copy every file into the root of your repo and replace the old ones.
3. Commit and push the changes to GitHub.
4. In Vercel, keep the framework preset as Next.js.
5. In Vercel project settings, make sure the Output Directory is set to `out`.
6. Redeploy.

## If it still fails

The most likely reason is that Vercel project settings are still overriding the repository files. In that case, open the Vercel project settings and confirm:

- Node.js version: `22.x`
- Install command: `npm install`
- Build command: `npm run build`
- Output Directory: `out`

If those match these files, the deployment should succeed.
