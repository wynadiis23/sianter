import { pgTable, varchar, boolean, timestamp, integer, text } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const layanan = pgTable('layanan', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  nama: varchar('nama', { length: 100 }).notNull(),
  prefix: varchar('prefix', { length: 3 }).notNull(),
  deskripsi: varchar('deskripsi', { length: 200 }),
  gambar: text('gambar'),
  warna: varchar('warna', { length: 7 }),
  aktif: boolean('aktif').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const loket = pgTable('loket', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  nomor: integer('nomor').notNull().unique(),
  nama: varchar('nama', { length: 100 }),
  aktif: boolean('aktif').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
