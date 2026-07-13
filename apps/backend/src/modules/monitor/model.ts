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
            kode: t.Nullable(t.String()),
            nomorUrut: t.Nullable(t.Integer()),
            status: t.String(),
            loketNama: t.Nullable(t.String()),
          }),
        ),
        menunggu: t.Array(
          t.Object({
            kode: t.Nullable(t.String()),
            nomorUrut: t.Nullable(t.Integer()),
          }),
        ),
        dilewati: t.Array(
          t.Object({
            kode: t.Nullable(t.String()),
            nomorUrut: t.Nullable(t.Integer()),
          }),
        ),
      }),
    ),
    runningText: t.Nullable(t.String()),
    mediaUrl: t.Nullable(t.String()),
    youtubeVideoUrl: t.Nullable(t.String()),
    youtubePlaylistUrl: t.Nullable(t.String()),
    slideshowImages: t.Nullable(t.String()),
    slideshowInterval: t.Integer(),
  }),
} as const

export { MonitorModel }
export type MonitorModel = {
  [K in keyof typeof MonitorModel]: UnwrapSchema<(typeof MonitorModel)[K]>
}