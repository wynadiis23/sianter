import { Elysia, t } from 'elysia'

export const healthModule = new Elysia().get(
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
