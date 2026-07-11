import { eq, and, sql } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import type { SesiModel } from './model'

export abstract class SesiService {
  static async list() {
    return await db
      .select({
        id: schema.sesi.id,
        nama: schema.sesi.nama,
        jamMulai: schema.sesi.jamMulai,
        jamSelesai: schema.sesi.jamSelesai,
        kuota: schema.sesi.kuota,
        layananId: schema.sesi.layananId,
        namaLayanan: schema.layanan.nama,
        aktif: schema.sesi.aktif,
        createdAt: schema.sesi.createdAt,
        updatedAt: schema.sesi.updatedAt,
      })
      .from(schema.sesi)
      .innerJoin(schema.layanan, eq(schema.sesi.layananId, schema.layanan.id))
      .orderBy(schema.layanan.nama, schema.sesi.jamMulai)
  }

  static async create(body: SesiModel['body']) {
    const [layanan] = await db
      .select()
      .from(schema.layanan)
      .where(eq(schema.layanan.id, body.layananId))
      .limit(1)
    if (!layanan) throw status(404, { message: 'Layanan tidak ditemukan' })

    const [existing] = await db
      .select()
      .from(schema.sesi)
      .where(
        and(
          eq(schema.sesi.nama, body.nama),
          eq(schema.sesi.layananId, body.layananId),
        ),
      )
      .limit(1)
    if (existing) throw status(409, { message: 'Sesi dengan nama yang sama sudah ada untuk layanan ini' })

    const values = {
      nama: body.nama,
      jamMulai: body.jamMulai,
      jamSelesai: body.jamSelesai,
      kuota: body.kuota ?? 0,
      layananId: body.layananId,
      aktif: body.aktif ?? true,
    }

    const [created] = await db.insert(schema.sesi).values(values).returning()

    return {
      ...created,
      namaLayanan: layanan.nama,
    }
  }

  static async update(id: string, body: SesiModel['body']) {
    const [existing] = await db
      .select()
      .from(schema.sesi)
      .where(eq(schema.sesi.id, id))
      .limit(1)
    if (!existing) throw status(404, { message: 'Sesi tidak ditemukan' })

    const [layanan] = await db
      .select()
      .from(schema.layanan)
      .where(eq(schema.layanan.id, body.layananId))
      .limit(1)
    if (!layanan) throw status(404, { message: 'Layanan tidak ditemukan' })

    const [duplicate] = await db
      .select()
      .from(schema.sesi)
      .where(
        and(
          eq(schema.sesi.nama, body.nama),
          eq(schema.sesi.layananId, body.layananId),
        ),
      )
      .limit(1)
    if (duplicate && duplicate.id !== id) {
      throw status(409, { message: 'Sesi dengan nama yang sama sudah ada untuk layanan ini' })
    }

    const values = {
      nama: body.nama,
      jamMulai: body.jamMulai,
      jamSelesai: body.jamSelesai,
      kuota: body.kuota ?? 0,
      layananId: body.layananId,
      aktif: body.aktif ?? true,
    }

    const [updated] = await db
      .update(schema.sesi)
      .set(values)
      .where(eq(schema.sesi.id, id))
      .returning()

    return {
      ...updated,
      namaLayanan: layanan.nama,
    }
  }

  static async remove(id: string) {
    const [existing] = await db
      .select()
      .from(schema.sesi)
      .where(eq(schema.sesi.id, id))
      .limit(1)
    if (!existing) throw status(404, { message: 'Sesi tidak ditemukan' })

    const [antreanCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.antrean)
      .where(eq(schema.antrean.sesiId, id))

    if (antreanCount && Number(antreanCount.count) > 0) {
      throw status(409, { message: 'Sesi tidak dapat dihapus karena masih memiliki antrean terkait' })
    }

    await db.delete(schema.sesi).where(eq(schema.sesi.id, id))
    return { success: true as const }
  }
}
