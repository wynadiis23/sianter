import { t, type UnwrapSchema } from 'elysia'

const antreanData = t.Object({
  id: t.String(),
  kode: t.String(),
  nomorUrut: t.Integer(),
  layananId: t.String(),
  layananNama: t.String(),
  loketId: t.Nullable(t.String()),
  loketNomor: t.Nullable(t.Integer()),
  loketNama: t.Nullable(t.String()),
  status: t.String(),
})

const pengaturanData = t.Object({
  modeAntrean: t.Union([t.Literal('FIFO_GLOBAL'), t.Literal('SELECTIVE')]),
  runningText: t.Nullable(t.String()),
  mediaUrl: t.Nullable(t.String()),
  youtubeVideoUrl: t.Nullable(t.String()),
  youtubePlaylistUrl: t.Nullable(t.String()),
  slideshowImages: t.Nullable(t.String()),
  slideshowInterval: t.Integer(),
  kegiatanInterval: t.Integer(),
})

const layananChangedData = t.Object({
  action: t.Union([t.Literal('created'), t.Literal('updated'), t.Literal('deleted')]),
  id: t.String(),
  nama: t.String(),
  prefix: t.String(),
  warna: t.Nullable(t.String()),
  aktif: t.Boolean(),
})

const kegiatanChangedData = t.Object({
  action: t.Union([t.Literal('created'), t.Literal('updated'), t.Literal('deleted'), t.Literal('replaced')]),
  id: t.String(),
  tanggalWaktu: t.String(),
  namaKegiatan: t.String(),
  metodeRapat: t.String(),
  penyelenggara: t.String(),
  nomorSurat: t.String(),
  keterangan: t.String(),
})

export const WsModel = {
  event: t.Union([
    t.Object({ type: t.Literal('antrean:called'), data: antreanData }),
    t.Object({ type: t.Literal('antrean:recalled'), data: antreanData }),
    t.Object({ type: t.Literal('antrean:skipped'), data: antreanData }),
    t.Object({ type: t.Literal('antrean:finished'), data: antreanData }),
    t.Object({ type: t.Literal('antrean:created'), data: antreanData }),
    t.Object({ type: t.Literal('pengaturan:updated'), data: pengaturanData }),
    t.Object({ type: t.Literal('layanan:changed'), data: layananChangedData }),
    t.Object({ type: t.Literal('kegiatan:changed'), data: kegiatanChangedData }),
  ]),
} as const

export type WsModel = {
  [K in keyof typeof WsModel]: UnwrapSchema<(typeof WsModel)[K]>
}

export type WsEvent = WsModel['event']
export type AntreanEventData = UnwrapSchema<typeof antreanData>
export type PengaturanEventData = UnwrapSchema<typeof pengaturanData>
export type LayananChangedData = UnwrapSchema<typeof layananChangedData>
export type KegiatanChangedData = UnwrapSchema<typeof kegiatanChangedData>