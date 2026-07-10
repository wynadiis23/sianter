import { t, type UnwrapSchema } from 'elysia'

const loketShape = {
  nomor: t.Integer({ minimum: 1 }),
  nama: t.Nullable(t.String({ maxLength: 100 })),
  aktif: t.Optional(t.Boolean()),
}

export const LoketModel = {
  body: t.Object(loketShape),
  response: t.Object(loketShape),
  notFound: t.Object({ message: t.String() }),
  conflict: t.Object({ message: t.String() }),
  deleted: t.Object({ success: t.Literal(true) }),

  layananItem: t.Object({
    id: t.String(),
    nama: t.String(),
    prefix: t.String(),
    assigned: t.Boolean(),
  }),

  setLayananBody: t.Object({
    layananIds: t.Array(t.String()),
  }),
} as const

export type LoketModel = {
  [K in keyof typeof LoketModel]: UnwrapSchema<typeof LoketModel[K]>
}
