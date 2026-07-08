import { t, type UnwrapSchema } from 'elysia'

const layananShape = {
  nama: t.String({ minLength: 1, maxLength: 100 }),
  prefix: t.String({ minLength: 1, maxLength: 3 }),
  aktif: t.Optional(t.Boolean()),
}

export const LayananModel = {
  body: t.Object(layananShape),
  response: t.Object(layananShape),
  notFound: t.Object({ message: t.String() }),
  conflict: t.Object({ message: t.String() }),
  deleted: t.Object({ success: t.Literal(true) }),
} as const

export type LayananModel = {
  [K in keyof typeof LayananModel]: UnwrapSchema<typeof LayananModel[K]>
}
