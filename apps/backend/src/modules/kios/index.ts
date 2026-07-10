import { Elysia, t } from 'elysia'
import { KiosService } from './service'
import { KiosModel } from './model'

export const kiosModule = new Elysia({ prefix: '/api/kios' })
  .get('/layanan', () => KiosService.listLayanan(), {
    response: t.Array(KiosModel.layananResponse),
  })
  .get('/pemohon/lookup', ({ query }) => KiosService.lookupPemohon(query.nik), {
    query: t.Object({ nik: t.String() }),
    response: {
      200: KiosModel.pemohonLookupResponse,
      400: KiosModel.badRequest,
    },
  })
  .post(
    '/antrean',
    ({ body }) =>
      KiosService.createAntrean(body.layananId, body.nik, body.nama, body.noHp),
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
