import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const pemohon = pgTable('pemohon', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  nama: varchar('nama', { length: 100 }).notNull(),
  noHp: varchar('no_hp', { length: 15 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
