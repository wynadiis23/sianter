import { pgTable, varchar, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { sesi } from './sesi'
import { layanan } from './layanan'

export const sesiLayanan = pgTable('sesi_layanan', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  sesiId: varchar('sesi_id')
    .notNull()
    .references(() => sesi.id, { onDelete: 'cascade' }),
  layananId: varchar('layanan_id')
    .notNull()
    .references(() => layanan.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => [
  unique('sesi_layanan_sesi_id_layanan_id_unique').on(t.sesiId, t.layananId),
])
