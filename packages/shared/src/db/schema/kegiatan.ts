import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const kegiatan = pgTable('kegiatan', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  tanggalWaktu: text('tanggal_waktu').notNull(),
  namaKegiatan: text('nama_kegiatan').notNull(),
  metodeRapat: text('metode_rapat').notNull(),
  penyelenggara: text('penyelenggara').notNull(),
  nomorSurat: text('nomor_surat').notNull(),
  keterangan: text('keterangan').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})