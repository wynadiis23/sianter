import { eq, and, gte, lt, or, sql } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import { emitAntreanEvent } from '../realtime/service'

function todayRange() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return { today, tomorrow }
}

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

  static async upsertPemohon(nama: string, noHp: string) {
    const [existing] = await db
      .select({ id: schema.pemohon.id })
      .from(schema.pemohon)
      .where(eq(schema.pemohon.noHp, noHp))
      .limit(1)

    if (existing) {
      const [updated] = await db
        .update(schema.pemohon)
        .set({ nama })
        .where(eq(schema.pemohon.id, existing.id))
        .returning({ id: schema.pemohon.id })

      return updated.id
    }

    const [inserted] = await db
      .insert(schema.pemohon)
      .values({ nama, noHp })
      .returning({ id: schema.pemohon.id })

    return inserted.id
  }

  static async checkDuplicateAntrean(pemohonId: string) {
    const { today, tomorrow } = todayRange()

    const [duplicate] = await db
      .select({ id: schema.antrean.id })
      .from(schema.antrean)
      .where(
        and(
          eq(schema.antrean.pemohonId, pemohonId),
          or(
            eq(schema.antrean.status, 'WAITING'),
            eq(schema.antrean.status, 'CALLED'),
            eq(schema.antrean.status, 'RECALLED'),
          ),
          gte(schema.antrean.createdAt, today),
          lt(schema.antrean.createdAt, tomorrow),
        ),
      )
      .limit(1)

    return !!duplicate
  }

  static async createAntrean(
    layananId: string,
    nama: string,
    noHp: string,
  ) {
    const [layanan] = await db
      .select()
      .from(schema.layanan)
      .where(
        and(eq(schema.layanan.id, layananId), eq(schema.layanan.aktif, true)),
      )
      .limit(1)
    if (!layanan) throw status(404, { message: 'Layanan tidak ditemukan' })

    const pemohonId = await KiosService.upsertPemohon(nama, noHp)

    const hasDuplicate = await KiosService.checkDuplicateAntrean(pemohonId)
    if (hasDuplicate) {
      throw status(409, {
        message:
          'Nomor HP ini sudah terdaftar dalam antrean hari ini. Silakan selesaikan antrean yang sudah ada.',
      })
    }

    const { today, tomorrow } = todayRange()

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
        pemohonId,
        status: 'WAITING',
      })
      .returning()

    await emitAntreanEvent('antrean:created', antrean.id)

    return {
      kode: antrean.kode,
      nomorUrut: antrean.nomorUrut,
      namaLayanan: layanan.nama,
      trackingToken: antrean.trackingToken,
    }
  }
}
