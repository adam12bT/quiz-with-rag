# Project (GitHub Pages) — Deployment Guide

This repo is a Vite-based web app. Use this document to build and publish the site to GitHub Pages.

## Important files
- Project root: [project/package.json](project/package.json) (scripts & deps)
- Vite config: [project/vite.config.ts](project/vite.config.ts) (set `base` for GitHub Pages)
- App entry: [project/src/App.jsx](project/src/App.jsx)
- HTML: [project/index.html](project/index.html)

## Quick setup (gh-pages package)
1. Install:
```bash
npm install --save-dev gh-pages
```
2. Set the Vite `base` in [project/vite.config.ts](project/vite.config.ts):
```ts
// ...existing code...
export default defineConfig({
  base: '/REPO_NAME/', // <-- replace REPO_NAME with your GitHub repo name
  // ...existing code...
})
```
3. Add scripts to [project/package.json](project/package.json):
```json
// filepath: project/package.json
// ...existing code...
{
  "scripts": {
    "build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
// ...existing code...
```
4. Deploy:
```bash
npm run deploy
```

## CI deployment (GitHub Actions)
Create a workflow file to deploy on push to main:
```yaml
// filepath: project/.github/workflows/gh-pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ "main" ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Notes
- Replace `/REPO_NAME/` in [project/vite.config.ts](project/vite.config.ts) with your repo name (or use `/` for user/org pages).
- If deploying a subpath, ensure `base` matches the URL path.
- For local testing, run `npm run dev` (see [project/package.json](project/package.json)).

If you want, I can also add the GH Actions file and update package.json for you.
