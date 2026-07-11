import { t, type UnwrapSchema } from 'elysia'

export const TrackingModel = {
  trackResponse: t.Object({
    kode: t.String(),
    status: t.String(),
    nama: t.String(),
    namaLayanan: t.String(),
    position: t.Nullable(t.Number()),
    totalWaiting: t.Number(),
    loketNama: t.Nullable(t.String()),
    createdAt: t.String(),
    calledAt: t.Nullable(t.String()),
    finishedAt: t.Nullable(t.String()),
  }),

  notFound: t.Object({ message: t.String() }),
} as const

export type TrackingModel = {
  [K in keyof typeof TrackingModel]: UnwrapSchema<typeof TrackingModel[K]>
}
