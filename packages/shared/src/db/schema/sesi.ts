import { pgTable, varchar, time, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const sesi = pgTable('sesi', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  nama: varchar('nama', { length: 100 }).notNull(),
  jamMulai: time('jam_mulai').notNull(),
  jamSelesai: time('jam_selesai').notNull(),
  kuota: integer('kuota').notNull().default(0),
  aktif: boolean('aktif').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
