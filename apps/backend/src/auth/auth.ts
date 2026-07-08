import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { db, schema } from '../db/client'
import { env } from '../env'
import { ROLES } from '@sianter/shared'

export const auth = betterAuth({
  baseURL: env.BASE_URL,
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: [...ROLES],
        required: true,
        defaultValue: 'PETUGAS_LOKET',
        input: false,
      },
    },
  },
  secret: env.BETTER_AUTH_SECRET,
})

