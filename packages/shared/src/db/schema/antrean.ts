import {
  pgTable,
  varchar,
  timestamp,
  integer,
  date,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import type { QueueStatus, Sumber } from '../../enums'
import { user } from './auth'
import { layanan, loket } from './layanan'
import { pemohon } from './pemohon'
import { sesi } from './sesi'

export const antrean = pgTable('antrean', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  kode: varchar('kode', { length: 10 }),
  nomorUrut: integer('nomor_urut'),
  layananId: varchar('layanan_id')
    .notNull()
    .references(() => layanan.id, { onDelete: 'restrict' }),
  loketId: varchar('loket_id').references(() => loket.id, {
    onDelete: 'set null',
  }),
  petugasId: varchar('petugas_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  pemohonId: varchar('pemohon_id').references(() => pemohon.id, {
    onDelete: 'set null',
  }),
  sesiId: varchar('sesi_id').references(() => sesi.id, {
    onDelete: 'set null',
  }),
  tanggalKunjungan: date('tanggal_kunjungan'),
  trackingToken: varchar('tracking_token', { length: 32 })
    .notNull()
    .unique(),
  status: varchar('status', { length: 20 })
    .$type<QueueStatus>()
    .notNull()
    .default('WAITING'),
  sumber: varchar('sumber', { length: 10 })
    .$type<Sumber>()
    .notNull()
    .default('KIOS'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  calledAt: timestamp('called_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  skippedAt: timestamp('skipped_at', { withTimezone: true }),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  expiredAt: timestamp('expired_at', { withTimezone: true }),
})

export const antreanLog = pgTable('antrean_log', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  kode: varchar('kode', { length: 10 }),
  nomorUrut: integer('nomor_urut'),
  layananId: varchar('layanan_id').notNull(),
  loketId: varchar('loket_id'),
  petugasId: varchar('petugas_id'),
  pemohonId: varchar('pemohon_id'),
  sesiId: varchar('sesi_id'),
  tanggalKunjungan: date('tanggal_kunjungan'),
  trackingToken: varchar('tracking_token', { length: 32 }).notNull(),
  sumber: varchar('sumber', { length: 10 })
    .$type<Sumber>()
    .notNull()
    .default('KIOS'),
  status: varchar('status', { length: 20 })
    .$type<QueueStatus>()
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  calledAt: timestamp('called_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  skippedAt: timestamp('skipped_at', { withTimezone: true }),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  expiredAt: timestamp('expired_at', { withTimezone: true }),
  archivedAt: timestamp('archived_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})