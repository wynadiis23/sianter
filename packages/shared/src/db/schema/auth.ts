import { pgTable, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import type { Role } from '../../enums'

export const user = pgTable('user', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .notNull()
    .default(false),
  image: varchar('image'),
  role: varchar('role', { length: 50 })
    .$type<Role>()
    .notNull()
    .default('PETUGAS_LOKET'),
  banned: boolean('banned').notNull().default(false),
  banReason: varchar('ban_reason', { length: 255 }),
  banExpires: timestamp('ban_expires', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const session = pgTable('session', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: varchar('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: varchar('ip_address'),
  userAgent: varchar('user_agent'),
  impersonatedBy: varchar('impersonated_by'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const account = pgTable('account', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: varchar('account_id').notNull(),
  providerId: varchar('provider_id').notNull(),
  accessToken: varchar('access_token'),
  refreshToken: varchar('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
    withTimezone: true,
  }),
  scope: varchar('scope'),
  idToken: varchar('id_token'),
  password: varchar('password'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const verification = pgTable('verification', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  identifier: varchar('identifier').notNull(),
  value: varchar('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
