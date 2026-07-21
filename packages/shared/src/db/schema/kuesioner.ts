import { pgTable, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { layanan } from './layanan'

export const kuesioner = pgTable('kuesioner', {
  id: varchar('id').$defaultFn(() => createId()).primaryKey(),
  layananId: varchar('layanan_id')
    .notNull()
    .references(() => layanan.id, { onDelete: 'cascade' })
    .unique(),
  link: text('link').notNull(),
  caption: varchar('caption', { length: 200 }).notNull(),
  aktif: boolean('aktif').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
