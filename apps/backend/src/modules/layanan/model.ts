import { t, type UnwrapSchema } from 'elysia'

const layananBody = {
  nama: t.String({ minLength: 1, maxLength: 100 }),
  prefix: t.String({ minLength: 1, maxLength: 3 }),
  deskripsi: t.Optional(t.String({ maxLength: 200 })),
  gambar: t.Optional(t.String()),
  warna: t.Optional(t.String({ maxLength: 7 })),
  aktif: t.Optional(t.Boolean()),
}

const layananResponse = {
  id: t.String(),
  nama: t.String(),
  prefix: t.String(),
  deskripsi: t.Nullable(t.String({ maxLength: 200 })),
  gambar: t.Nullable(t.String()),
  warna: t.Nullable(t.String({ maxLength: 7 })),
  aktif: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
}

export const LayananModel = {
  body: t.Object(layananBody),
  response: t.Object(layananResponse),
  notFound: t.Object({ message: t.String() }),
  conflict: t.Object({ message: t.String() }),
  deleted: t.Object({ success: t.Literal(true) }),
} as const

export type LayananModel = {
  [K in keyof typeof LayananModel]: UnwrapSchema<typeof LayananModel[K]>
}
