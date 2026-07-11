import { t, type UnwrapSchema } from 'elysia'

export const SesiModel = {
  body: t.Object({
    nama: t.String({ minLength: 1, maxLength: 100 }),
    jamMulai: t.String(),
    jamSelesai: t.String(),
    kuota: t.Optional(t.Number()),
    layananId: t.String(),
    aktif: t.Optional(t.Boolean()),
  }),

  response: t.Object({
    id: t.String(),
    nama: t.String(),
    jamMulai: t.String(),
    jamSelesai: t.String(),
    kuota: t.Number(),
    layananId: t.String(),
    namaLayanan: t.String(),
    aktif: t.Boolean(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  }),

  notFound: t.Object({ message: t.String() }),
  conflict: t.Object({ message: t.String() }),
  deleted: t.Object({ success: t.Literal(true) }),
} as const

export type SesiModel = {
  [K in keyof typeof SesiModel]: UnwrapSchema<typeof SesiModel[K]>
}
