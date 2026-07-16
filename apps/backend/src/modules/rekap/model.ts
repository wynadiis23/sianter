import { t, type UnwrapSchema } from 'elysia'

export const RekapModel = {
  query: t.Object({
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

  summaryItem: t.Object({
    label: t.String(),
    count: t.Integer(),
  }),

  perLayananItem: t.Object({
    layananId: t.String(),
    nama: t.String(),
    prefix: t.String(),
    total: t.Integer(),
    waiting: t.Integer(),
    called: t.Integer(),
    recalled: t.Integer(),
    finished: t.Integer(),
    skipped: t.Integer(),
    expired: t.Integer(),
    reserved: t.Integer(),
  }),

  detailItem: t.Object({
    id: t.String(),
    kode: t.Nullable(t.String()),
    nomorUrut: t.Nullable(t.Integer()),
    status: t.String(),
    namaLayanan: t.String(),
    prefixLayanan: t.String(),
    nomorLoket: t.Nullable(t.Integer()),
    namaLoket: t.Nullable(t.String()),
    namaPemohon: t.Nullable(t.String()),
    noHpPemohon: t.Nullable(t.String()),
    tanggalKunjungan: t.Nullable(t.String()),
    createdAt: t.String(),
    calledAt: t.Nullable(t.String()),
    finishedAt: t.Nullable(t.String()),
    skippedAt: t.Nullable(t.String()),
    checkedInAt: t.Nullable(t.String()),
    expiredAt: t.Nullable(t.String()),
  }),

  response: t.Object({
    summary: t.Record(t.String(), t.Integer()),
    perLayanan: t.Array(t.Object({
      layananId: t.String(),
      nama: t.String(),
      prefix: t.String(),
      total: t.Integer(),
      waiting: t.Integer(),
      called: t.Integer(),
      recalled: t.Integer(),
      finished: t.Integer(),
      skipped: t.Integer(),
      expired: t.Integer(),
      reserved: t.Integer(),
    })),
    items: t.Array(t.Object({
      id: t.String(),
      kode: t.Nullable(t.String()),
      nomorUrut: t.Nullable(t.Integer()),
      status: t.String(),
      namaLayanan: t.String(),
      prefixLayanan: t.String(),
      nomorLoket: t.Nullable(t.Integer()),
      namaLoket: t.Nullable(t.String()),
      namaPemohon: t.Nullable(t.String()),
      noHpPemohon: t.Nullable(t.String()),
      tanggalKunjungan: t.Nullable(t.String()),
      createdAt: t.String(),
      calledAt: t.Nullable(t.String()),
      finishedAt: t.Nullable(t.String()),
      skippedAt: t.Nullable(t.String()),
      checkedInAt: t.Nullable(t.String()),
      expiredAt: t.Nullable(t.String()),
    })),
    pagination: t.Object({
      page: t.Integer(),
      limit: t.Integer(),
      total: t.Integer(),
      totalPages: t.Integer(),
    }),
  }),
} as const

export type RekapModel = {
  [K in keyof typeof RekapModel]: UnwrapSchema<typeof RekapModel[K]>
}
