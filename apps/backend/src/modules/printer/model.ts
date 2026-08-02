import { t, type UnwrapSchema } from 'elysia'

export const PrinterModel = {
  receiptBody: t.Object({
    kode: t.String(),
    namaLayanan: t.String(),
    timestamp: t.String({ format: 'date-time' }),
    trackingUrl: t.String(),
    kuesionerUrl: t.Optional(t.Nullable(t.String())),
    kuesionerCaption: t.Optional(t.Nullable(t.String())),
  }),
  response: t.Object({
    buffer: t.String({ description: 'Base64-encoded ESC/POS buffer' }),
  }),
} as const

export type PrinterModel = {
  [K in keyof typeof PrinterModel]: UnwrapSchema<typeof PrinterModel[K]>
}