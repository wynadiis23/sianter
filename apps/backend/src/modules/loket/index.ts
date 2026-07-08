import { Elysia, t } from 'elysia'
import { LoketService } from './service'
import { LoketModel } from './model'

export const loketModule = new Elysia({ prefix: '/api/admin/loket' })
  .get('/', () => LoketService.list(), {
    admin: true,
    response: t.Array(LoketModel.response),
  })
  .post('/', ({ body }) => LoketService.create(body), {
    admin: true,
    body: LoketModel.body,
    response: {
      200: LoketModel.response,
      409: LoketModel.conflict,
    },
  })
  .put('/:id', ({ params: { id }, body }) => LoketService.update(id, body), {
    admin: true,
    body: LoketModel.body,
    response: {
      200: LoketModel.response,
      404: LoketModel.notFound,
      409: LoketModel.conflict,
    },
  })
  .delete('/:id', ({ params: { id } }) => LoketService.remove(id), {
    admin: true,
    response: {
      200: LoketModel.deleted,
      404: LoketModel.notFound,
    },
  })
