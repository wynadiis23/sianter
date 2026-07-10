import { eq, and, gte, lt, sql } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import { emitAntreanEvent } from '../realtime/service'

export abstract class KiosService {
  static async listLayanan() {
    return await db
      .select({
        id: schema.layanan.id,
        nama: schema.layanan.nama,
        prefix: schema.layanan.prefix,
        deskripsi: schema.layanan.deskripsi,
        gambar: schema.layanan.gambar,
        warna: schema.layanan.warna,
      })
      .from(schema.layanan)
      .where(eq(schema.layanan.aktif, true))
      .orderBy(schema.layanan.nama)
  }

  static async createAntrean(layananId: string) {
    const [layanan] = await db
      .select()
      .from(schema.layanan)
      .where(
        and(eq(schema.layanan.id, layananId), eq(schema.layanan.aktif, true)),
      )
      .limit(1)
    if (!layanan) throw status(404, { message: 'Layanan tidak ditemukan' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [last] = await db
      .select({
        maxUrut: sql<number>`coalesce(max(${schema.antrean.nomorUrut}), 0)`,
      })
      .from(schema.antrean)
      .where(
        and(
          eq(schema.antrean.layananId, layananId),
          gte(schema.antrean.createdAt, today),
          lt(schema.antrean.createdAt, tomorrow),
        ),
      )

    const nomorUrut = (last?.maxUrut ?? 0) + 1
    const kode = `${layanan.prefix}-${nomorUrut.toString().padStart(3, '0')}`

    const [antrean] = await db
      .insert(schema.antrean)
      .values({
        kode,
        nomorUrut,
        layananId,
        status: 'WAITING',
      })
      .returning()

    await emitAntreanEvent('antrean:created', antrean.id)

    return {
      kode: antrean.kode,
      nomorUrut: antrean.nomorUrut,
      namaLayanan: layanan.nama,
    }
  }
}
