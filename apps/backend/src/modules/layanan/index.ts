import { Elysia, t } from 'elysia'
import { LayananService } from './service'
import { LayananModel } from './model'

export const layananModule = new Elysia({ prefix: '/api/admin/layanan' })
  .get('/', () => LayananService.list(), {
    admin: true,
    response: t.Array(LayananModel.response),
  })
  .post('/', ({ body }) => LayananService.create(body), {
    admin: true,
    body: LayananModel.body,
    response: {
      200: LayananModel.response,
      409: LayananModel.conflict,
    },
  })
  .put('/:id', ({ params: { id }, body }) => LayananService.update(id, body), {
    admin: true,
    body: LayananModel.body,
    response: {
      200: LayananModel.response,
      404: LayananModel.notFound,
      409: LayananModel.conflict,
    },
  })
  .delete('/:id', ({ params: { id } }) => LayananService.remove(id), {
    admin: true,
    response: {
      200: LayananModel.deleted,
      404: LayananModel.notFound,
    },
  })
