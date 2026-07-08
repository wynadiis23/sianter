import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import type { QueueMode } from '../../enums'

export const pengaturan = pgTable('pengaturan', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  modeAntrean: varchar('mode_antrean', { length: 20 })
    .$type<QueueMode>()
    .notNull()
    .default('FIFO_GLOBAL'),
  runningText: text('running_text'),
  mediaUrl: text('media_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
