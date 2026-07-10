import { eq } from 'drizzle-orm'
import { db, schema } from '../../db/client'
import type { PengaturanModel } from './model'
import { emitPengaturanEvent } from '../realtime/service'

export abstract class PengaturanService {
  static async get() {
    const [existing] = await db.select().from(schema.pengaturan).limit(1)
    if (existing) return existing
    const [created] = await db.insert(schema.pengaturan).values({}).returning()
    return created
  }

  static async upsert(body: PengaturanModel['body']) {
    const [existing] = await db.select().from(schema.pengaturan).limit(1)
    let result
    if (existing) {
      const [updated] = await db
        .update(schema.pengaturan)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(schema.pengaturan.id, existing.id))
        .returning()
      result = updated
    } else {
      const [created] = await db
        .insert(schema.pengaturan)
        .values(body)
        .returning()
      result = created
    }
    await emitPengaturanEvent(result)
    return result
  }
}
