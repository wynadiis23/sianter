import { eq, and, gte, lt, ne, or, sql } from 'drizzle-orm'
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

  static async checkDuplicateAntrean(pemohonId: string, excludeId?: string) {
    const { today, tomorrow } = todayRange()

    const conditions = [
      eq(schema.antrean.pemohonId, pemohonId),
      or(
        eq(schema.antrean.status, 'RESERVED'),
        eq(schema.antrean.status, 'WAITING'),
        eq(schema.antrean.status, 'CALLED'),
        eq(schema.antrean.status, 'RECALLED'),
      ),
      gte(schema.antrean.createdAt, today),
      lt(schema.antrean.createdAt, tomorrow),
    ]

    if (excludeId) {
      conditions.push(ne(schema.antrean.id, excludeId))
    }

    const [duplicate] = await db
      .select({ id: schema.antrean.id })
      .from(schema.antrean)
      .where(and(...conditions))
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

    if (antrean) {
      await emitAntreanEvent('antrean:created', antrean.id)
    }

    return {
      kode: antrean.kode!,
      nomorUrut: antrean.nomorUrut!,
      namaLayanan: layanan.nama,
      trackingToken: antrean.trackingToken,
    }
  }

  static async checkIn(token: string) {
    const [antrean] = await db
      .select({
        id: schema.antrean.id,
        status: schema.antrean.status,
        layananId: schema.antrean.layananId,
        pemohonId: schema.antrean.pemohonId,
        sesiId: schema.antrean.sesiId,
        tanggalKunjungan: schema.antrean.tanggalKunjungan,
        trackingToken: schema.antrean.trackingToken,
      })
      .from(schema.antrean)
      .where(eq(schema.antrean.trackingToken, token))
      .limit(1)

    if (!antrean) {
      throw status(404, { message: 'Tiket tidak ditemukan' })
    }

    if (antrean.status !== 'RESERVED') {
      throw status(400, { message: 'Tiket sudah di-check-in atau sudah tidak berlaku' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (!antrean.tanggalKunjungan) {
      throw status(400, { message: 'Tiket tidak memiliki tanggal kunjungan' })
    }

    const tanggalKunjungan = new Date(antrean.tanggalKunjungan)
    tanggalKunjungan.setHours(0, 0, 0, 0)

    if (tanggalKunjungan.getTime() !== today.getTime()) {
      throw status(400, {
        message: 'Tiket ini hanya bisa di-check-in pada tanggal kunjungan yang telah dipilih',
      })
    }

    if (antrean.sesiId) {
      const [sesi] = await db
        .select({
          jamMulai: schema.sesi.jamMulai,
          jamSelesai: schema.sesi.jamSelesai,
        })
        .from(schema.sesi)
        .where(eq(schema.sesi.id, antrean.sesiId))
        .limit(1)

      if (sesi) {
        const now = new Date()
        const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
        const graceEnd = sesi.jamSelesai

        if (nowTime > graceEnd) {
          throw status(400, {
            message: 'Sesi kunjungan Anda sudah berakhir. Silakan daftar ulang.',
          })
        }
      }
    }

    const hasDuplicate = await KiosService.checkDuplicateAntrean(antrean.pemohonId!, antrean.id)
    if (hasDuplicate) {
      throw status(409, {
        message: 'Nomor HP ini sudah memiliki antrean aktif hari ini',
      })
    }

    const [last] = await db
      .select({
        maxUrut: sql<number>`coalesce(max(${schema.antrean.nomorUrut}), 0)`,
      })
      .from(schema.antrean)
      .where(
        and(
          eq(schema.antrean.layananId, antrean.layananId),
          gte(schema.antrean.createdAt, today),
          lt(schema.antrean.createdAt, tomorrow),
        ),
      )

    const [layanan] = await db
      .select({ prefix: schema.layanan.prefix, nama: schema.layanan.nama })
      .from(schema.layanan)
      .where(eq(schema.layanan.id, antrean.layananId))
      .limit(1)

    const nomorUrut = (last?.maxUrut ?? 0) + 1
    const kode = `${layanan!.prefix}-${nomorUrut.toString().padStart(3, '0')}`

    const [updated] = await db
      .update(schema.antrean)
      .set({
        kode,
        nomorUrut,
        status: 'WAITING',
        checkedInAt: new Date(),
      })
      .where(eq(schema.antrean.id, antrean.id))
      .returning()

    if (updated) {
      await emitAntreanEvent('antrean:created', updated.id)
    }

    return {
      kode: kode,
      nomorUrut: nomorUrut,
      namaLayanan: layanan!.nama,
      trackingToken: antrean.trackingToken,
    }
  }
}