import { Elysia, t } from 'elysia'
import { SesiService } from './service'
import { SesiModel } from './model'

export const sesiModule = new Elysia({ prefix: '/api/admin/sesi' })
  .get('/', () => SesiService.list(), {
    admin: true,
    response: t.Array(SesiModel.response),
  })
  .post('/', ({ body }) => SesiService.create(body), {
    admin: true,
    body: SesiModel.body,
    response: {
      200: SesiModel.response,
      404: SesiModel.notFound,
      409: SesiModel.conflict,
    },
  })
  .put('/:id', ({ params: { id }, body }) => SesiService.update(id, body), {
    admin: true,
    body: SesiModel.body,
    response: {
      200: SesiModel.response,
      404: SesiModel.notFound,
      409: SesiModel.conflict,
    },
  })
  .delete('/:id', ({ params: { id } }) => SesiService.remove(id), {
    admin: true,
    response: {
      200: SesiModel.deleted,
      404: SesiModel.notFound,
      409: SesiModel.conflict,
    },
  })
