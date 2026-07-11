import { Elysia, t } from 'elysia'
import { AntreanOnlineService } from './service'
import { AntreanOnlineModel } from './model'

export const antreanOnlineModule = new Elysia({ prefix: '/api/antrean-online' })
  .get('/sesi', () => AntreanOnlineService.listSesi(), {
    response: t.Array(AntreanOnlineModel.sesiResponse),
  })
  .post(
    '/',
    ({ body }) =>
      AntreanOnlineService.createReservation(
        body.layananId,
        body.nama,
        body.noHp,
        body.sesiId,
        body.tanggalKunjungan,
      ),
    {
      body: AntreanOnlineModel.onlineBody,
      response: {
        200: AntreanOnlineModel.onlineResponse,
        400: AntreanOnlineModel.badRequest,
        404: AntreanOnlineModel.notFound,
        409: AntreanOnlineModel.conflict,
      },
    },
  )