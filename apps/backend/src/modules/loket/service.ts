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

    const activeLayanan = await db
      .select({ id: schema.layanan.id })
      .from(schema.layanan)
      .where(eq(schema.layanan.aktif, true))

    if (activeLayanan.length > 0) {
      await db.insert(schema.loketLayanan).values(
        activeLayanan.map((l) => ({
          loketId: created.id,
          layananId: l.id,
        })),
      )
    }

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

  static async listLayanan(loketId: string) {
    const allLayanan = await db
      .select({
        id: schema.layanan.id,
        nama: schema.layanan.nama,
        prefix: schema.layanan.prefix,
      })
      .from(schema.layanan)
      .where(eq(schema.layanan.aktif, true))
      .orderBy(schema.layanan.nama)

    const assignedRows = await db
      .select({ layananId: schema.loketLayanan.layananId })
      .from(schema.loketLayanan)
      .where(eq(schema.loketLayanan.loketId, loketId))

    const assignedSet = new Set(assignedRows.map((r) => r.layananId))

    return allLayanan.map((l) => ({
      ...l,
      assigned: assignedSet.has(l.id),
    })) as LoketModel['layananItem'][]
  }

  static async setLayanan(loketId: string, layananIds: string[]) {
    await db
      .delete(schema.loketLayanan)
      .where(eq(schema.loketLayanan.loketId, loketId))

    if (layananIds.length > 0) {
      await db.insert(schema.loketLayanan).values(
        layananIds.map((layananId) => ({
          loketId,
          layananId,
        })),
      )
    }

    return { success: true as const }
  }
}
