import { Elysia, t } from 'elysia'
import { KiosService } from './service'
import { KiosModel } from './model'

export const kiosModule = new Elysia({ prefix: '/api/kios' })
  .get('/layanan', () => KiosService.listLayanan(), {
    response: t.Array(KiosModel.layananResponse),
  })
  .post(
    '/antrean',
    ({ body }) => KiosService.createAntrean(body.layananId, body.nama, body.noHp),
    {
      body: KiosModel.antreanBody,
      response: {
        200: KiosModel.antreanResponse,
        400: KiosModel.badRequest,
        404: KiosModel.notFound,
        409: KiosModel.conflict,
      },
    },
  )
  .post(
    '/check-in',
    ({ body }) => KiosService.checkIn(body.token),
    {
      body: KiosModel.checkInBody,
      response: {
        200: KiosModel.antreanResponse,
        400: KiosModel.badRequest,
        404: KiosModel.notFound,
        409: KiosModel.conflict,
      },
    },
  )