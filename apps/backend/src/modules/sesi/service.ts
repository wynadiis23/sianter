import { eq, sql, inArray } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import type { SesiModel } from './model'

export abstract class SesiService {
  static async list() {
    const rows = await db
      .select({
        id: schema.sesi.id,
        nama: schema.sesi.nama,
        jamMulai: schema.sesi.jamMulai,
        jamSelesai: schema.sesi.jamSelesai,
        kuota: schema.sesi.kuota,
        aktif: schema.sesi.aktif,
        createdAt: schema.sesi.createdAt,
        updatedAt: schema.sesi.updatedAt,
        layananId: schema.layanan.id,
        namaLayanan: schema.layanan.nama,
      })
      .from(schema.sesi)
      .innerJoin(
        schema.sesiLayanan,
        eq(schema.sesiLayanan.sesiId, schema.sesi.id),
      )
      .innerJoin(
        schema.layanan,
        eq(schema.sesiLayanan.layananId, schema.layanan.id),
      )
      .orderBy(schema.sesi.jamMulai, schema.layanan.nama)

    const grouped = new Map<
      string,
      {
        id: string
        nama: string
        jamMulai: string
        jamSelesai: string
        kuota: number
        aktif: boolean
        createdAt: Date
        updatedAt: Date
        layananIds: string[]
        namaLayanan: string[]
      }
    >()

    for (const row of rows) {
      const key = row.id
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: row.id,
          nama: row.nama,
          jamMulai: row.jamMulai,
          jamSelesai: row.jamSelesai,
          kuota: row.kuota,
          aktif: row.aktif,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          layananIds: [],
          namaLayanan: [],
        })
      }
      const group = grouped.get(key)!
      if (row.layananId) {
        group.layananIds.push(row.layananId)
        group.namaLayanan.push(row.namaLayanan)
      }
    }

    return Array.from(grouped.values()).map((g) => ({
      ...g,
      layananIds: g.layananIds,
      namaLayanan: g.namaLayanan.join(', '),
    }))
  }

  static async create(body: SesiModel['body']) {
    const layananList = await db
      .select({ id: schema.layanan.id })
      .from(schema.layanan)
      .where(inArray(schema.layanan.id, body.layananIds))
    if (layananList.length !== body.layananIds.length) {
      throw status(404, { message: 'Beberapa layanan tidak ditemukan' })
    }

    const { layananIds, ...sesiData } = body
    const values = {
      nama: sesiData.nama,
      jamMulai: sesiData.jamMulai,
      jamSelesai: sesiData.jamSelesai,
      kuota: sesiData.kuota ?? 0,
      aktif: sesiData.aktif ?? true,
    }

    const [created] = await db.insert(schema.sesi).values(values).returning()

    if (layananIds.length > 0) {
      await db.insert(schema.sesiLayanan).values(
        layananIds.map((layananId) => ({
          sesiId: created.id,
          layananId,
        })),
      )
    }

    const allLayanan = await db
      .select({ id: schema.layanan.id, nama: schema.layanan.nama })
      .from(schema.layanan)
      .where(inArray(schema.layanan.id, layananIds))

    return {
      ...created,
      layananIds: allLayanan.map((l) => l.id),
      namaLayanan: allLayanan.map((l) => l.nama).join(', '),
    }
  }

  static async update(id: string, body: SesiModel['body']) {
    const [existing] = await db
      .select()
      .from(schema.sesi)
      .where(eq(schema.sesi.id, id))
      .limit(1)
    if (!existing) throw status(404, { message: 'Sesi tidak ditemukan' })

    const layananList = await db
      .select({ id: schema.layanan.id, nama: schema.layanan.nama })
      .from(schema.layanan)
      .where(inArray(schema.layanan.id, body.layananIds))
    if (layananList.length !== body.layananIds.length) {
      throw status(404, { message: 'Beberapa layanan tidak ditemukan' })
    }

    const { layananIds, ...sesiData } = body
    const values = {
      nama: sesiData.nama,
      jamMulai: sesiData.jamMulai,
      jamSelesai: sesiData.jamSelesai,
      kuota: sesiData.kuota ?? 0,
      aktif: sesiData.aktif ?? true,
    }

    const [updated] = await db
      .update(schema.sesi)
      .set(values)
      .where(eq(schema.sesi.id, id))
      .returning()

    await db
      .delete(schema.sesiLayanan)
      .where(eq(schema.sesiLayanan.sesiId, id))

    if (layananIds.length > 0) {
      await db.insert(schema.sesiLayanan).values(
        layananIds.map((layananId) => ({
          sesiId: id,
          layananId,
        })),
      )
    }

    return {
      ...updated,
      layananIds: layananList.map((l) => l.id),
      namaLayanan: layananList.map((l) => l.nama).join(', '),
    }
  }

  static async remove(id: string) {
    const [existing] = await db
      .select()
      .from(schema.sesi)
      .where(eq(schema.sesi.id, id))
      .limit(1)
    if (!existing) throw status(404, { message: 'Sesi tidak ditemukan' })

    const [linkCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.sesiLayanan)
      .where(eq(schema.sesiLayanan.sesiId, id))

    if (linkCount && Number(linkCount.count) > 0) {
      throw status(409, { message: 'Sesi tidak dapat dihapus karena masih memiliki layanan terkait' })
    }

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
