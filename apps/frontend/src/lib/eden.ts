import { treaty } from '@elysiajs/eden'
import type { App } from '@sianter/backend'

export const server = treaty<App>(import.meta.env.VITE_API_URL)
