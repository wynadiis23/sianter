import { t, type UnwrapSchema } from 'elysia'

export const KiosModel = {
  layananResponse: t.Object({
    id: t.String(),
    nama: t.String(),
    prefix: t.String(),
    deskripsi: t.Nullable(t.String()),
    gambar: t.Nullable(t.String()),
    warna: t.Nullable(t.String({ maxLength: 7 })),
  }),

  antreanBody: t.Object({
    layananId: t.String(),
    nama: t.String({ minLength: 1 }),
    noHp: t.String({ minLength: 10, maxLength: 15 }),
  }),

  antreanResponse: t.Object({
    kode: t.String(),
    nomorUrut: t.Number(),
    namaLayanan: t.String(),
    trackingToken: t.String(),
    kuesionerLink: t.Nullable(t.String()),
    kuesionerCaption: t.Nullable(t.String()),
  }),

  checkInBody: t.Object({
    token: t.String(),
  }),

  notFound: t.Object({ message: t.String() }),
  badRequest: t.Object({ message: t.String() }),
  conflict: t.Object({ message: t.String() }),
} as const

export type KiosModel = {
  [K in keyof typeof KiosModel]: UnwrapSchema<typeof KiosModel[K]>
}