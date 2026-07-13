import { t, type UnwrapSchema } from 'elysia'

export const AntreanModel = {
  availableLoketResponse: t.Object({
    id: t.String(),
    nomor: t.Integer(),
    nama: t.Nullable(t.String()),
  }),

  layananListResponse: t.Array(
    t.Object({
      id: t.String(),
      nama: t.String(),
      prefix: t.String(),
    }),
  ),

  dashboardQuery: t.Object({
    loketId: t.String(),
  }),

  dashboardResponse: t.Object({
    mode: t.String(),
    aktif: t.Nullable(
      t.Object({
        id: t.String(),
        kode: t.String(),
        nomorUrut: t.Integer(),
        status: t.String(),
        namaLayanan: t.String(),
        namaPemohon: t.Nullable(t.String()),
        noHpPemohon: t.Nullable(t.String()),
      }),
    ),
    daftarWaiting: t.Array(
      t.Object({
        id: t.String(),
        kode: t.String(),
        nomorUrut: t.Integer(),
        layananId: t.String(),
        namaLayanan: t.String(),
        createdAt: t.String(),
        namaPemohon: t.Nullable(t.String()),
        noHpPemohon: t.Nullable(t.String()),
      }),
    ),
    daftarSkipped: t.Array(
      t.Object({
        id: t.String(),
        kode: t.String(),
        nomorUrut: t.Integer(),
        status: t.String(),
        namaLayanan: t.String(),
        skippedAt: t.Nullable(t.String()),
        namaPemohon: t.Nullable(t.String()),
        noHpPemohon: t.Nullable(t.String()),
      }),
    ),
    countPerLayanan: t.Record(t.String(), t.Integer()),
  }),

  callBody: t.Object({
    loketId: t.String(),
    layananId: t.Optional(t.String()),
  }),

  antreanResponse: t.Object({
    id: t.String(),
    kode: t.String(),
    nomorUrut: t.Integer(),
    layananId: t.String(),
    loketId: t.Nullable(t.String()),
    petugasId: t.Nullable(t.String()),
    status: t.String(),
    createdAt: t.String(),
    calledAt: t.Nullable(t.String()),
    finishedAt: t.Nullable(t.String()),
    skippedAt: t.Nullable(t.String()),
  }),

  notFound: t.Object({ message: t.String() }),
  conflict: t.Object({ message: t.String() }),
} as const

export type AntreanModel = {
  [K in keyof typeof AntreanModel]: UnwrapSchema<typeof AntreanModel[K]>
}
