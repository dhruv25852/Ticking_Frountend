# Backend configuration

The Vite development server proxies `/api` and `/uploads` requests to the backend.
Copy `.env.example` to `.env` and set `VITE_BACKEND_URL` to your backend's base URL.
Restart the development server after changing the value.

For Vercel, add `VITE_BACKEND_URL` in the project's Environment Variables settings
for each deployment environment, then redeploy. The Vercel rewrite configuration
serves the React app for client-side routes.
