import { Elysia, t } from 'elysia'
import { KuesionerService } from './service'
import { KuesionerModel } from './model'

export const kuesionerModule = new Elysia({ prefix: '/api/admin/kuesioner' })
  .get('/', () => KuesionerService.list(), {
    admin: true,
    response: t.Array(KuesionerModel.response),
  })
  .post('/', ({ body }) => KuesionerService.create(body), {
    admin: true,
    body: KuesionerModel.body,
    response: {
      200: KuesionerModel.response,
      409: KuesionerModel.notFound,
    },
  })
  .put('/:id', ({ params: { id }, body }) => KuesionerService.update(id, body), {
    admin: true,
    body: KuesionerModel.body,
    response: {
      200: KuesionerModel.response,
      404: KuesionerModel.notFound,
      409: KuesionerModel.notFound,
    },
  })
  .delete('/:id', ({ params: { id } }) => KuesionerService.remove(id), {
    admin: true,
    response: {
      200: KuesionerModel.deleted,
      404: KuesionerModel.notFound,
    },
  })
