import {
  pgTable,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import type { QueueStatus } from '../../enums'
import { user } from './auth'
import { layanan, loket } from './layanan'

export const antrean = pgTable('antrean', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  kode: varchar('kode', { length: 10 }).notNull(),
  nomorUrut: integer('nomor_urut').notNull(),
  layananId: varchar('layanan_id')
    .notNull()
    .references(() => layanan.id, { onDelete: 'restrict' }),
  loketId: varchar('loket_id').references(() => loket.id, {
    onDelete: 'set null',
  }),
  petugasId: varchar('petugas_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  status: varchar('status', { length: 20 })
    .$type<QueueStatus>()
    .notNull()
    .default('WAITING'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  calledAt: timestamp('called_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  skippedAt: timestamp('skipped_at', { withTimezone: true }),
})

export const antreanLog = pgTable('antrean_log', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  kode: varchar('kode', { length: 10 }).notNull(),
  nomorUrut: integer('nomor_urut').notNull(),
  layananId: varchar('layanan_id').notNull(),
  loketId: varchar('loket_id'),
  petugasId: varchar('petugas_id'),
  status: varchar('status', { length: 20 })
    .$type<QueueStatus>()
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  calledAt: timestamp('called_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  skippedAt: timestamp('skipped_at', { withTimezone: true }),
  archivedAt: timestamp('archived_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
