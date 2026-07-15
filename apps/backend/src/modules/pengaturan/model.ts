import { t, type UnwrapSchema } from 'elysia'

const pengaturanShape = {
  modeAntrean: t.Union([
    t.Literal('FIFO_GLOBAL'),
    t.Literal('SELECTIVE'),
  ]),
  runningText: t.Nullable(t.String()),
  mediaUrl: t.Nullable(t.String()),
  youtubeVideoUrl: t.Nullable(t.String()),
  youtubePlaylistUrl: t.Nullable(t.String()),
  slideshowImages: t.Nullable(t.String()),
  slideshowInterval: t.Integer(),
  kegiatanInterval: t.Integer(),
}

export const PengaturanModel = {
  body: t.Object(pengaturanShape),
  response: t.Object(pengaturanShape),
} as const

export type PengaturanModel = {
  [K in keyof typeof PengaturanModel]: UnwrapSchema<typeof PengaturanModel[K]>
}
