import { and, eq } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import type { KuesionerModel } from './model'

export abstract class KuesionerService {
  static async list() {
    return await db
      .select()
      .from(schema.kuesioner)
      .orderBy(schema.kuesioner.createdAt)
  }

  static async create(body: KuesionerModel['body']) {
    const [existing] = await db
      .select()
      .from(schema.kuesioner)
      .where(eq(schema.kuesioner.layananId, body.layananId))
      .limit(1)
    if (existing) throw status(409, { message: 'Layanan ini sudah memiliki kuesioner' })

    const [created] = await db
      .insert(schema.kuesioner)
      .values({ ...body, aktif: body.aktif ?? true })
      .returning()

    return created
  }

  static async update(id: string, body: KuesionerModel['body']) {
    const [conflict] = await db
      .select()
      .from(schema.kuesioner)
      .where(eq(schema.kuesioner.layananId, body.layananId))
      .limit(1)
    if (conflict && conflict.id !== id) throw status(409, { message: 'Layanan ini sudah memiliki kuesioner' })

    const [updated] = await db
      .update(schema.kuesioner)
      .set({ ...body, aktif: body.aktif ?? true, updatedAt: new Date() })
      .where(eq(schema.kuesioner.id, id))
      .returning()

    if (!updated) throw status(404, { message: 'Kuesioner tidak ditemukan' })
    return updated
  }

  static async remove(id: string) {
    const [deleted] = await db
      .delete(schema.kuesioner)
      .where(eq(schema.kuesioner.id, id))
      .returning()

    if (!deleted) throw status(404, { message: 'Kuesioner tidak ditemukan' })
    return { success: true as const }
  }

  static async findAktifByLayananId(layananId: string) {
    const [item] = await db
      .select()
      .from(schema.kuesioner)
      .where(
        and(
          eq(schema.kuesioner.layananId, layananId),
          eq(schema.kuesioner.aktif, true),
        ),
      )
      .limit(1)

    return item ?? null
  }
}
