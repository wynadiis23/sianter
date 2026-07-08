import { treaty } from '@elysiajs/eden'
import type { App } from '@sianter/backend'

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) throw new Error("Missing VITE_API_URL in frontend/.env");

export const server = treaty<App>(apiUrl, {
  fetch: { credentials: "include" },
});

