import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { admin } from 'better-auth/plugins'
import { db, schema } from '../db/client'
import { env } from '../env'
import { ac, adminRole, petugasRole } from './permissions'

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
  trustedOrigins: [env.BASE_URL, env.FRONTEND_URL],
  plugins: [
    admin({
      ac,
      roles: {
        SUPER_ADMIN: adminRole,
        PETUGAS_LOKET: petugasRole,
      },
      defaultRole: 'PETUGAS_LOKET',
      adminRoles: ['SUPER_ADMIN'],
    }),
  ],
  secret: env.BETTER_AUTH_SECRET,
})