import { Elysia } from 'elysia'
import { db, schema } from '../db/client'

export const publicSettingsModule = new Elysia()
  .get('/api/settings/printer-prefixes', async () => {
    const [setting] = await db
      .select({ printerNamePrefixes: schema.pengaturan.printerNamePrefixes })
      .from(schema.pengaturan)
      .limit(1)
    return { printerNamePrefixes: setting?.printerNamePrefixes ?? null }
  })
