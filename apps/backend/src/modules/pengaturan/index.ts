import { Elysia } from 'elysia'
import { PengaturanService } from './service'
import { PengaturanModel } from './model'

export const pengaturanModule = new Elysia({ prefix: '/api/admin/pengaturan' })
  .get('/', () => PengaturanService.get(), {
    admin: true,
    response: PengaturanModel.response,
  })
  .put('/', ({ body }) => PengaturanService.upsert(body), {
    admin: true,
    body: PengaturanModel.body,
    response: PengaturanModel.response,
  })
