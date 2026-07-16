import { Elysia, t } from 'elysia'
import { RekapService } from './service'
import { RekapModel } from './model'

export const rekapModule = new Elysia({ prefix: '/api/admin/rekap' }).get(
  '/',
  ({ query }) => RekapService.getRekap(query),
  {
    admin: true,
    query: t.Optional(
      t.Object({
        mode: t.Optional(t.String()),
        tanggal: t.Optional(t.String()),
        bulan: t.Optional(t.String()),
        tahun: t.Optional(t.String()),
        layananId: t.Optional(t.String()),
        loketId: t.Optional(t.String()),
        status: t.Optional(t.String()),
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
      }),
    ),
    response: RekapModel.response,
  },
)
