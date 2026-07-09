import { Elysia, t } from 'elysia'
import { KiosService } from './service'
import { KiosModel } from './model'

export const kiosModule = new Elysia({ prefix: '/api/kios' })
  .get('/layanan', () => KiosService.listLayanan(), {
    response: t.Array(KiosModel.layananResponse),
  })
  .post(
    '/antrean',
    ({ body }) => KiosService.createAntrean(body.layananId),
    {
      body: KiosModel.antreanBody,
      response: {
        200: KiosModel.antreanResponse,
        404: KiosModel.notFound,
      },
    },
  )
