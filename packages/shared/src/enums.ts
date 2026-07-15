export const ROLES = ['SUPER_ADMIN', 'PETUGAS_LOKET', 'PETUGAS_KEGIATAN'] as const
export type Role = (typeof ROLES)[number]

export const QUEUE_STATUS = [
  'RESERVED',
  'WAITING',
  'CALLED',
  'RECALLED',
  'SKIPPED',
  'FINISHED',
  'EXPIRED',
] as const
export type QueueStatus = (typeof QUEUE_STATUS)[number]

export const QUEUE_MODE = ['FIFO_GLOBAL', 'SELECTIVE'] as const
export type QueueMode = (typeof QUEUE_MODE)[number]
