import { eq } from 'drizzle-orm'
import { db, schema } from './db/client'
import { auth } from './auth/auth'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@sianter.local'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin123'
const ADMIN_NAME = 'Super Admin'

async function seed() {
  const [existing] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, ADMIN_EMAIL))
    .limit(1)

  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`)
    if (existing.role !== 'SUPER_ADMIN') {
      await db
        .update(schema.user)
        .set({ role: 'SUPER_ADMIN' })
        .where(eq(schema.user.id, existing.id))
      console.log('Role updated to SUPER_ADMIN')
    }
    return
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    })
  } catch (e) {
    console.error('Failed to create admin via signUpEmail:', e)
    throw e
  }

  await db
    .update(schema.user)
    .set({ role: 'SUPER_ADMIN' })
    .where(eq(schema.user.email, ADMIN_EMAIL))

  console.log(`Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
}

seed()
  .then(() => {
    console.log('Seed complete')
    process.exit(0)
  })
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
