import { t, type UnwrapSchema } from 'elysia'

export const KegiatanModel = {
  body: t.Object({
    tanggalWaktu: t.String({ minLength: 1 }),
    namaKegiatan: t.String({ minLength: 1 }),
    metodeRapat: t.String({ minLength: 1 }),
    penyelenggara: t.String({ minLength: 1 }),
    nomorSurat: t.String({ minLength: 1 }),
    keterangan: t.String({ minLength: 1 }),
  }),

  response: t.Object({
    id: t.String(),
    tanggalWaktu: t.String(),
    namaKegiatan: t.String(),
    metodeRapat: t.String(),
    penyelenggara: t.String(),
    nomorSurat: t.String(),
    keterangan: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  }),

  importResponse: t.Object({
    imported: t.Number(),
    replaced: t.Number(),
  }),

  notFound: t.Object({ message: t.String() }),
  validationError: t.Object({
    message: t.String(),
    errors: t.Array(
      t.Object({
        row: t.Number(),
        column: t.String(),
      }),
    ),
  }),
  structureError: t.Object({
    message: t.String(),
    expected: t.Array(t.String()),
    found: t.Array(t.String()),
  }),
  deleted: t.Object({ success: t.Literal(true) }),
} as const

export type KegiatanModel = {
  [K in keyof typeof KegiatanModel]: UnwrapSchema<(typeof KegiatanModel)[K]>
}