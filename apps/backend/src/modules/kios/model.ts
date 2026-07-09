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
  }),

  antreanResponse: t.Object({
    kode: t.String(),
    nomorUrut: t.Number(),
    namaLayanan: t.String(),
  }),

  notFound: t.Object({ message: t.String() }),
  error: t.Object({ message: t.String() }),
} as const

export type KiosModel = {
  [K in keyof typeof KiosModel]: UnwrapSchema<typeof KiosModel[K]>
}
