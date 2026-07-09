import { eq } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import type { LoketModel } from './model'

export abstract class LoketService {
  static async list() {
    return await db
      .select()
      .from(schema.loket)
      .orderBy(schema.loket.nomor)
  }

  static async create(body: LoketModel['body']) {
    const values = { ...body, aktif: body.aktif ?? true }
    const [existing] = await db
      .select()
      .from(schema.loket)
      .where(eq(schema.loket.nomor, values.nomor))
      .limit(1)
    if (existing) throw status(409, { message: 'Nomor loket sudah digunakan' })
    const [created] = await db
      .insert(schema.loket)
      .values(values)
      .returning()
    return created
  }

  static async update(id: string, body: LoketModel['body']) {
    const values = { ...body, aktif: body.aktif ?? true }
    const [conflict] = await db
      .select()
      .from(schema.loket)
      .where(eq(schema.loket.nomor, values.nomor))
      .limit(1)
    if (conflict && conflict.id !== id)
      throw status(409, { message: 'Nomor loket sudah digunakan' })
    const [updated] = await db
      .update(schema.loket)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.loket.id, id))
      .returning()
    if (!updated) throw status(404, { message: 'Loket tidak ditemukan' })
    return updated
  }

  static async remove(id: string) {
    const [deleted] = await db
      .delete(schema.loket)
      .where(eq(schema.loket.id, id))
      .returning()
    if (!deleted) throw status(404, { message: 'Loket tidak ditemukan' })
    return { success: true as const }
  }
}
