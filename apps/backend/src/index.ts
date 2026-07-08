import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authPlugin } from './auth/plugin'
import { healthRoutes } from './routes/health'

const app = new Elysia()
  .use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  )
  .use(authPlugin)
  .use(healthRoutes)
  .get('/me', ({ user }) => user, {
    auth: true,
    response: t.Object({
      id: t.String(),
      email: t.String(),
      name: t.String(),
      role: t.Union([t.Literal('SUPER_ADMIN'), t.Literal('PETUGAS_LOKET')]),
    }),
  })
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)

export type App = typeof app
