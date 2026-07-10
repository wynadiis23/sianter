import { Elysia } from 'elysia'
import { auth } from '../../auth/auth'
import { AntreanService } from './service'
import { AntreanModel } from './model'

async function requireAuth(headers: Headers) {
  const session = await auth.api.getSession({ headers })
  if (!session) throw new Error('Unauthorized')
  return session
}

export const antreanModule = new Elysia({ prefix: '/api/loket' })
  .get('/', async ({ request }) => {
    await requireAuth(request.headers)
    return await AntreanService.listAvailableLoket()
  })
  .get('/:id/layanan', async ({ params: { id }, request }) => {
    await requireAuth(request.headers)
    return await AntreanService.getLayananByLoket(id)
  })
  .get(
    '/antrean',
    async ({ query, request }) => {
      await requireAuth(request.headers)
      return await AntreanService.getDashboard(query.loketId)
    },
    {
      query: AntreanModel.dashboardQuery,
    },
  )
  .post(
    '/antrean/call',
    async ({ body, request }) => {
      const session = await requireAuth(request.headers)
      return await AntreanService.call(
        body.loketId,
        session.user.id,
        body.layananId,
      )
    },
    {
      body: AntreanModel.callBody,
    },
  )
  .post(
    '/antrean/:id/recall',
    async ({ params: { id }, request }) => {
      await requireAuth(request.headers)
      return await AntreanService.recall(id)
    },
  )
  .post(
    '/antrean/:id/skip',
    async ({ params: { id }, request }) => {
      await requireAuth(request.headers)
      return await AntreanService.skip(id)
    },
  )
  .post(
    '/antrean/:id/finish',
    async ({ params: { id }, request }) => {
      await requireAuth(request.headers)
      return await AntreanService.finish(id)
    },
  )
