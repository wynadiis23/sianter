import { Elysia, t } from 'elysia'

export const healthRoutes = new Elysia({ name: 'health' }).get(
  '/health',
  () => ({
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
  }),
  {
    response: t.Object({
      status: t.Literal('ok'),
      timestamp: t.String(),
    }),
  },
)
