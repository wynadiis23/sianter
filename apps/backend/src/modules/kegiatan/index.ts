import { Elysia, t } from 'elysia'
import { KegiatanService } from './service'
import { KegiatanModel } from './model'

export const kegiatanModule = new Elysia({ prefix: '/api/admin/kegiatan' })
  .get('/', () => KegiatanService.list(), {
    kegiatan: true,
    response: t.Array(KegiatanModel.response),
  })
  .post('/', ({ body }) => KegiatanService.create(body), {
    kegiatan: true,
    body: KegiatanModel.body,
    response: {
      200: KegiatanModel.response,
    },
  })
  .put('/:id', ({ params: { id }, body }) => KegiatanService.update(id, body), {
    kegiatan: true,
    body: KegiatanModel.body,
    response: {
      200: KegiatanModel.response,
      404: KegiatanModel.notFound,
    },
  })
  .delete('/:id', ({ params: { id } }) => KegiatanService.remove(id), {
    kegiatan: true,
    response: {
      200: KegiatanModel.deleted,
      404: KegiatanModel.notFound,
    },
  })
  .post('/import', async ({ body }) => {
    const file = (body as { file: File }).file
    const buffer = await file.arrayBuffer()
    return KegiatanService.importExcel(buffer)
  }, {
    kegiatan: true,
    body: t.Object({
      file: t.File({ type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] }),
    }),
    response: {
      200: KegiatanModel.importResponse,
      400: KegiatanModel.notFound,
    },
  })
  .get('/template', async ({ set }) => {
    set.headers['Content-Disposition'] = 'attachment; filename="template_kegiatan.xlsx"'
    const buffer = await KegiatanService.getTemplate()
    return new Uint8Array(buffer)
  }, {
    kegiatan: true,
    response: {
      200: t.Uint8Array(),
      404: KegiatanModel.notFound,
    },
  })
  .post('/template', async ({ body }) => {
    const file = (body as { file: File }).file
    const buffer = await file.arrayBuffer()
    return KegiatanService.updateTemplate(buffer)
  }, {
    admin: true,
    body: t.Object({
      file: t.File({ type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] }),
    }),
  })