import { eq, and, gte, lt, or, sql } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import { generateShortToken } from '../../lib/token'

export abstract class AntreanOnlineService {
  static async listSesi(layananId?: string) {
    if (layananId) {
      return await db
        .select({
          id: schema.sesi.id,
          nama: schema.sesi.nama,
          jamMulai: schema.sesi.jamMulai,
          jamSelesai: schema.sesi.jamSelesai,
          kuota: schema.sesi.kuota,
        })
        .from(schema.sesi)
        .innerJoin(
          schema.sesiLayanan,
          eq(schema.sesiLayanan.sesiId, schema.sesi.id),
        )
        .where(
          and(
            eq(schema.sesi.aktif, true),
            eq(schema.sesiLayanan.layananId, layananId),
          ),
        )
        .orderBy(schema.sesi.jamMulai)
    }

    return await db
      .select({
        id: schema.sesi.id,
        nama: schema.sesi.nama,
        jamMulai: schema.sesi.jamMulai,
        jamSelesai: schema.sesi.jamSelesai,
        kuota: schema.sesi.kuota,
      })
      .from(schema.sesi)
      .where(eq(schema.sesi.aktif, true))
      .orderBy(schema.sesi.jamMulai)
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

  static async createReservation(
    layananId: string,
    nama: string,
    noHp: string,
    sesiId: string,
    tanggalKunjungan: string,
  ) {
    const [layanan] = await db
      .select()
      .from(schema.layanan)
      .where(
        and(eq(schema.layanan.id, layananId), eq(schema.layanan.aktif, true)),
      )
      .limit(1)
    if (!layanan) throw status(404, { message: 'Layanan tidak ditemukan' })

    const [sesi] = await db
      .select({ id: schema.sesi.id, nama: schema.sesi.nama, jamMulai: schema.sesi.jamMulai, jamSelesai: schema.sesi.jamSelesai, kuota: schema.sesi.kuota })
      .from(schema.sesi)
      .innerJoin(
        schema.sesiLayanan,
        and(
          eq(schema.sesiLayanan.sesiId, schema.sesi.id),
          eq(schema.sesiLayanan.layananId, layananId),
        ),
      )
      .where(
        and(eq(schema.sesi.id, sesiId), eq(schema.sesi.aktif, true)),
      )
      .limit(1)
    if (!sesi) throw status(404, { message: 'Sesi tidak ditemukan atau tidak sesuai dengan layanan yang dipilih' })

    const tanggal = new Date(tanggalKunjungan + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (tanggal.getTime() < today.getTime()) {
      throw status(400, { message: 'Tanggal kunjungan tidak boleh di masa lalu' })
    }

    if (sesi.kuota > 0) {
      const [count] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.antrean)
        .where(
          and(
            eq(schema.antrean.sesiId, sesiId),
            eq(schema.antrean.tanggalKunjungan, tanggalKunjungan),
            eq(schema.antrean.status, 'RESERVED'),
          ),
        )

      if ((count?.total ?? 0) >= sesi.kuota) {
        throw status(409, {
          message: 'Kuota sesi ini sudah penuh. Silakan pilih sesi lain.',
        })
      }
    }

    const pemohonId = await AntreanOnlineService.upsertPemohon(nama, noHp)

    const todayRange = new Date()
    todayRange.setHours(0, 0, 0, 0)
    const tomorrowRange = new Date(todayRange)
    tomorrowRange.setDate(tomorrowRange.getDate() + 1)

    const [duplicate] = await db
      .select({ id: schema.antrean.id })
      .from(schema.antrean)
      .where(
        and(
          eq(schema.antrean.pemohonId, pemohonId),
          or(
            eq(schema.antrean.status, 'RESERVED'),
            eq(schema.antrean.status, 'WAITING'),
            eq(schema.antrean.status, 'CALLED'),
            eq(schema.antrean.status, 'RECALLED'),
          ),
          gte(schema.antrean.createdAt, todayRange),
          lt(schema.antrean.createdAt, tomorrowRange),
        ),
      )
      .limit(1)

    if (duplicate) {
      throw status(409, {
        message: 'Nomor HP ini sudah terdaftar dalam antrean hari ini',
      })
    }

    const [antrean] = await db
      .insert(schema.antrean)
      .values({
        layananId,
        pemohonId,
        sesiId,
        tanggalKunjungan,
        status: 'RESERVED',
        sumber: 'ONLINE',
        trackingToken: generateShortToken(),
      })
      .returning()

    const formattedTanggal = String(tanggalKunjungan).substring(0, 10)

    return {
      trackingToken: antrean.trackingToken,
      namaLayanan: layanan.nama,
      namaSesi: sesi.nama,
      jamMulai: sesi.jamMulai,
      jamSelesai: sesi.jamSelesai,
      tanggalKunjungan: formattedTanggal,
    }
  }
}