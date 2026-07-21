import { t, type UnwrapSchema } from 'elysia'

const body = {
  layananId: t.String(),
  link: t.String({ minLength: 1 }),
  caption: t.String({ minLength: 1, maxLength: 200 }),
  aktif: t.Optional(t.Boolean()),
}

const response = {
  id: t.String(),
  layananId: t.String(),
  link: t.String(),
  caption: t.String(),
  aktif: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
}

export const KuesionerModel = {
  body: t.Object(body),
  response: t.Object(response),
  notFound: t.Object({ message: t.String() }),
  deleted: t.Object({ success: t.Literal(true) }),
} as const

export type KuesionerModel = {
  [K in keyof typeof KuesionerModel]: UnwrapSchema<typeof KuesionerModel[K]>
}
