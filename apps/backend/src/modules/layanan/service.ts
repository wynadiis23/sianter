import { eq } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import type { LayananModel } from './model'

export abstract class LayananService {
  static async list() {
    return await db
      .select()
      .from(schema.layanan)
      .orderBy(schema.layanan.createdAt)
  }

  static async create(body: LayananModel['body']) {
    const values = { ...body, aktif: body.aktif ?? true }
    const [existing] = await db
      .select()
      .from(schema.layanan)
      .where(eq(schema.layanan.prefix, values.prefix))
      .limit(1)
    if (existing) throw status(409, { message: 'Prefix sudah digunakan' })
    const [created] = await db
      .insert(schema.layanan)
      .values(values)
      .returning()
    return created
  }

  static async update(id: string, body: LayananModel['body']) {
    const values = { ...body, aktif: body.aktif ?? true }
    const [conflict] = await db
      .select()
      .from(schema.layanan)
      .where(eq(schema.layanan.prefix, values.prefix))
      .limit(1)
    if (conflict && conflict.id !== id)
      throw status(409, { message: 'Prefix sudah digunakan' })
    const [updated] = await db
      .update(schema.layanan)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.layanan.id, id))
      .returning()
    if (!updated) throw status(404, { message: 'Layanan tidak ditemukan' })
    return updated
  }

  static async remove(id: string) {
    const [deleted] = await db
      .delete(schema.layanan)
      .where(eq(schema.layanan.id, id))
      .returning()
    if (!deleted) throw status(404, { message: 'Layanan tidak ditemukan' })
    return { success: true as const }
  }
}
