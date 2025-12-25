Direct URL / refresh errors in SPAs

Problem:
- When you open a nested route directly (e.g., /dashboard) and the server returns a 404 instead of serving index.html, the SPA router can't bootstrap and you'll see a 404 or error page.

Solutions:
- For local development: use `npm run dev` (Vite dev server already does SPA fallback).
- For production static hosts:
  - Configure your hosting to rewrite all requests to `index.html` (Netlify: add `_redirects` with `/* /index.html 200`, Vercel: add `rewrites`, Apache/nginx: use fallback to index.html).
  - Or use `HashRouter` (import { HashRouter as Router } from 'react-router-dom') to avoid server rewrites.

What I changed:
- Added a `NotFoundPage` and a catch-all route `*` to render a friendly 404 inside the app.

If you'd like, I can switch the app to `HashRouter` or add hosting-specific redirect files; tell me which option you prefer and where you will host the site (Netlify, Vercel, GitHub Pages, etc.).
