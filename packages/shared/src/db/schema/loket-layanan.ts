import { pgTable, varchar, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { loket, layanan } from './layanan'

export const loketLayanan = pgTable(
  'loket_layanan',
  {
    id: varchar('id')
      .$defaultFn(() => createId())
      .primaryKey(),
    loketId: varchar('loket_id')
      .notNull()
      .references(() => loket.id, { onDelete: 'cascade' }),
    layananId: varchar('layanan_id')
      .notNull()
      .references(() => layanan.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique('loket_layanan_unique').on(t.loketId, t.layananId)],
)
