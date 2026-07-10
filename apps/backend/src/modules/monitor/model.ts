import { t, type UnwrapSchema } from 'elysia'

const MonitorModel = {
  response: t.Object({
    layanan: t.Array(
      t.Object({
        id: t.String(),
        nama: t.String(),
        prefix: t.String(),
        warna: t.Nullable(t.String()),
        dipanggil: t.Nullable(
          t.Object({
            kode: t.String(),
            nomorUrut: t.Integer(),
            status: t.String(),
            loketNama: t.Nullable(t.String()),
          }),
        ),
        menunggu: t.Array(
          t.Object({
            kode: t.String(),
            nomorUrut: t.Integer(),
          }),
        ),
      }),
    ),
    runningText: t.Nullable(t.String()),
    mediaUrl: t.Nullable(t.String()),
  }),
} as const

export { MonitorModel }
export type MonitorModel = {
  [K in keyof typeof MonitorModel]: UnwrapSchema<(typeof MonitorModel)[K]>
}