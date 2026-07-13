import { t, type UnwrapSchema } from 'elysia'

export const AntreanOnlineModel = {
  sesiResponse: t.Object({
    id: t.String(),
    nama: t.String(),
    jamMulai: t.String(),
    jamSelesai: t.String(),
    kuota: t.Number(),
  }),

  onlineBody: t.Object({
    layananId: t.String(),
    nama: t.String({ minLength: 1 }),
    noHp: t.String({ minLength: 10, maxLength: 15 }),
    sesiId: t.String(),
    tanggalKunjungan: t.String(),
  }),

  onlineResponse: t.Object({
    trackingToken: t.String(),
    namaLayanan: t.String(),
    namaSesi: t.String(),
    jamMulai: t.String(),
    jamSelesai: t.String(),
    tanggalKunjungan: t.String(),
  }),

  notFound: t.Object({ message: t.String() }),
  badRequest: t.Object({ message: t.String() }),
  conflict: t.Object({ message: t.String() }),
} as const

export type AntreanOnlineModel = {
  [K in keyof typeof AntreanOnlineModel]: UnwrapSchema<typeof AntreanOnlineModel[K]>
}