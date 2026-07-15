import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { ac, adminRole, petugasRole, petugasKegiatanRole } from '@sianter/backend/permissions'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [
    adminClient({
      ac,
      roles: {
        SUPER_ADMIN: adminRole,
        PETUGAS_LOKET: petugasRole,
        PETUGAS_KEGIATAN: petugasKegiatanRole,
      },
    }),
  ],
})

export const { signIn, signOut, useSession } = authClient