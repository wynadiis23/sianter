import { eq, and, gte, lt, inArray, desc, isNotNull } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import { emitAntreanEvent } from '../realtime/service'

export abstract class AntreanService {
  static async getLayananByLoket(loketId: string) {
    const rows = await db
      .select({
        id: schema.layanan.id,
        nama: schema.layanan.nama,
        prefix: schema.layanan.prefix,
      })
      .from(schema.loketLayanan)
      .innerJoin(
        schema.layanan,
        eq(schema.loketLayanan.layananId, schema.layanan.id),
      )
      .where(
        and(
          eq(schema.loketLayanan.loketId, loketId),
          eq(schema.layanan.aktif, true),
        ),
      )
      .orderBy(schema.layanan.nama)

    return rows
  }

  static async listAvailableLoket() {
    const lokets = await db.query.loket.findMany({
      where: eq(schema.loket.aktif, true),
      orderBy: schema.loket.nomor,
    })

    return lokets.map((loket) => ({
      id: loket.id,
      nomor: loket.nomor,
      nama: loket.nama,
    }))
  }

  static async getDashboard(loketId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [pengaturan] = await db
      .select({ mode: schema.pengaturan.modeAntrean })
      .from(schema.pengaturan)
      .limit(1)

    const layananRows = await db
      .select({ id: schema.loketLayanan.layananId })
      .from(schema.loketLayanan)
      .where(eq(schema.loketLayanan.loketId, loketId))

    const layananIds = layananRows.map((r) => r.id)

    if (layananIds.length === 0) {
      return {
        mode: pengaturan?.mode ?? 'FIFO_GLOBAL',
        aktif: null,
        daftarWaiting: [],
        daftarSkipped: [],
        countPerLayanan: {},
      }
    }

    const [aktif] = await db
      .select({
        id: schema.antrean.id,
        kode: schema.antrean.kode,
        nomorUrut: schema.antrean.nomorUrut,
        status: schema.antrean.status,
        sumber: schema.antrean.sumber,
        trackingToken: schema.antrean.trackingToken,
        layananId: schema.antrean.layananId,
        namaLayanan: schema.layanan.nama,
        namaPemohon: schema.pemohon.nama,
        noHpPemohon: schema.pemohon.noHp,
      })
      .from(schema.antrean)
      .innerJoin(schema.layanan, eq(schema.antrean.layananId, schema.layanan.id))
      .leftJoin(schema.pemohon, eq(schema.antrean.pemohonId, schema.pemohon.id))
      .where(
        and(
          eq(schema.antrean.loketId, loketId),
          inArray(schema.antrean.status, ['CALLED', 'RECALLED']),
        ),
      )
      .limit(1)

    const daftarWaiting = await db
      .select({
        id: schema.antrean.id,
        kode: schema.antrean.kode,
        nomorUrut: schema.antrean.nomorUrut,
        layananId: schema.antrean.layananId,
        sumber: schema.antrean.sumber,
        trackingToken: schema.antrean.trackingToken,
        namaLayanan: schema.layanan.nama,
        createdAt: schema.antrean.createdAt,
        namaPemohon: schema.pemohon.nama,
        noHpPemohon: schema.pemohon.noHp,
      })
      .from(schema.antrean)
      .innerJoin(schema.layanan, eq(schema.antrean.layananId, schema.layanan.id))
      .leftJoin(schema.pemohon, eq(schema.antrean.pemohonId, schema.pemohon.id))
      .where(
        and(
          eq(schema.antrean.status, 'WAITING'),
          inArray(schema.antrean.layananId, layananIds),
          gte(schema.antrean.createdAt, today),
          lt(schema.antrean.createdAt, tomorrow),
        ),
      )
      .orderBy(schema.antrean.createdAt)

    const daftarSkipped = await db
      .select({
        id: schema.antrean.id,
        kode: schema.antrean.kode,
        nomorUrut: schema.antrean.nomorUrut,
        status: schema.antrean.status,
        sumber: schema.antrean.sumber,
        trackingToken: schema.antrean.trackingToken,
        layananId: schema.antrean.layananId,
        namaLayanan: schema.layanan.nama,
        skippedAt: schema.antrean.skippedAt,
        namaPemohon: schema.pemohon.nama,
        noHpPemohon: schema.pemohon.noHp,
      })
      .from(schema.antrean)
      .innerJoin(schema.layanan, eq(schema.antrean.layananId, schema.layanan.id))
      .leftJoin(schema.pemohon, eq(schema.antrean.pemohonId, schema.pemohon.id))
      .where(
        and(
          eq(schema.antrean.status, 'SKIPPED'),
          eq(schema.antrean.loketId, loketId),
          gte(schema.antrean.createdAt, today),
          lt(schema.antrean.createdAt, tomorrow),
          isNotNull(schema.antrean.skippedAt),
        ),
      )
      .orderBy(desc(schema.antrean.skippedAt))
      .limit(5)

    const countPerLayanan: Record<string, number> = {}
    for (const item of daftarWaiting) {
      countPerLayanan[item.layananId] =
        (countPerLayanan[item.layananId] ?? 0) + 1
    }

    const todayDateStr = today.toISOString().split('T')[0]

    const daftarOnline = await db
      .select({
        id: schema.antrean.id,
        kode: schema.antrean.kode,
        nomorUrut: schema.antrean.nomorUrut,
        sumber: schema.antrean.sumber,
        trackingToken: schema.antrean.trackingToken,
        layananId: schema.antrean.layananId,
        namaLayanan: schema.layanan.nama,
        namaPemohon: schema.pemohon.nama,
        noHpPemohon: schema.pemohon.noHp,
        namaSesi: schema.sesi.nama,
        jamMulai: schema.sesi.jamMulai,
        jamSelesai: schema.sesi.jamSelesai,
        tanggalKunjungan: schema.antrean.tanggalKunjungan,
      })
      .from(schema.antrean)
      .innerJoin(schema.layanan, eq(schema.antrean.layananId, schema.layanan.id))
      .leftJoin(schema.pemohon, eq(schema.antrean.pemohonId, schema.pemohon.id))
      .innerJoin(schema.sesi, eq(schema.antrean.sesiId, schema.sesi.id))
      .where(
        and(
          eq(schema.antrean.status, 'RESERVED'),
          eq(schema.antrean.sumber, 'ONLINE'),
          eq(schema.antrean.tanggalKunjungan, todayDateStr),
          inArray(schema.antrean.layananId, layananIds),
        ),
      )
      .orderBy(schema.sesi.jamMulai, schema.antrean.createdAt)

    const kuesionerIds = new Set<string>()
    if (aktif?.layananId) kuesionerIds.add(aktif.layananId)
    for (const w of daftarWaiting) kuesionerIds.add(w.layananId)
    for (const s of daftarSkipped) kuesionerIds.add(s.layananId)
    for (const o of daftarOnline) kuesionerIds.add(o.layananId)

    const kuesionerRows = kuesionerIds.size > 0
      ? await db
          .select()
          .from(schema.kuesioner)
          .where(
            and(
              inArray(schema.kuesioner.layananId, [...kuesionerIds]),
              eq(schema.kuesioner.aktif, true),
            ),
          )
      : []

    const kuesionerMap = new Map(kuesionerRows.map((k) => [k.layananId, k]))

    const mapKuesioner = (item: { layananId: string }) => {
      const k = kuesionerMap.get(item.layananId)
      return {
        kuesionerLink: k?.link ?? null,
        kuesionerCaption: k?.caption ?? null,
      }
    }

    return {
      mode: pengaturan?.mode ?? 'FIFO_GLOBAL',
      aktif: aktif ? { ...aktif, ...mapKuesioner(aktif) } : null,
      daftarWaiting: daftarWaiting.map((w) => ({ ...w, ...mapKuesioner(w) })),
      daftarSkipped: daftarSkipped.map((s) => ({ ...s, ...mapKuesioner(s) })),
      daftarOnline: daftarOnline.map((o) => ({ ...o, ...mapKuesioner(o) })),
      countPerLayanan,
    }
  }

  static async call(
    loketId: string,
    petugasId: string,
    layananId?: string,
  ) {
    const [existing] = await db
      .select()
      .from(schema.antrean)
      .where(
        and(
          eq(schema.antrean.loketId, loketId),
          inArray(schema.antrean.status, ['CALLED', 'RECALLED']),
        ),
      )
      .limit(1)

    if (existing) {
      throw status(409, {
        message: 'Selesaikan atau skip antrean aktif terlebih dahulu',
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const conditions: Parameters<typeof and>[0][] = [
      eq(schema.antrean.status, 'WAITING'),
      gte(schema.antrean.createdAt, today),
      lt(schema.antrean.createdAt, tomorrow),
    ]

    if (layananId) {
      conditions.push(eq(schema.antrean.layananId, layananId))
    } else {
      const layananRows = await db
        .select({ id: schema.loketLayanan.layananId })
        .from(schema.loketLayanan)
        .where(eq(schema.loketLayanan.loketId, loketId))

      if (layananRows.length === 0) {
        throw status(400, { message: 'Tidak ada layanan yang terdaftar' })
      }

      conditions.push(
        inArray(
          schema.antrean.layananId,
          layananRows.map((r) => r.id),
        ),
      )
    }

    const [nextTicket] = await db
      .select()
      .from(schema.antrean)
      .where(and(...conditions))
      .orderBy(schema.antrean.createdAt)
      .limit(1)

    if (!nextTicket) {
      throw status(404, { message: 'Tidak ada antrean yang menunggu' })
    }

    const [updated] = await db
      .update(schema.antrean)
      .set({
        status: 'CALLED',
        loketId,
        petugasId,
        calledAt: new Date(),
      })
      .where(eq(schema.antrean.id, nextTicket.id))
      .returning()

    if (updated) {
      await emitAntreanEvent('antrean:called', updated.id)
    }

    return updated
  }

  static async recall(id: string) {
    const [updated] = await db
      .update(schema.antrean)
      .set({ status: 'RECALLED' })
      .where(
        and(
          eq(schema.antrean.id, id),
          inArray(schema.antrean.status, ['CALLED', 'RECALLED']),
        ),
      )
      .returning()

    if (!updated) {
      throw status(404, { message: 'Antrean tidak ditemukan atau sudah selesai' })
    }
    await emitAntreanEvent('antrean:recalled', updated.id)
    return updated
  }

  static async callSkipped(id: string, petugasId: string) {
    const [ticket] = await db
      .select()
      .from(schema.antrean)
      .where(eq(schema.antrean.id, id))
      .limit(1)

    if (!ticket || ticket.status !== 'SKIPPED') {
      throw status(404, { message: 'Antrean tidak ditemukan atau sudah diproses' })
    }

    if (!ticket.loketId) {
      throw status(400, { message: 'Antrean tidak memiliki loket' })
    }

    const [existing] = await db
      .select()
      .from(schema.antrean)
      .where(
        and(
          eq(schema.antrean.loketId, ticket.loketId),
          inArray(schema.antrean.status, ['CALLED', 'RECALLED']),
        ),
      )
      .limit(1)

    if (existing) {
      throw status(409, {
        message: 'Selesaikan atau skip antrean aktif terlebih dahulu',
      })
    }

    const [updated] = await db
      .update(schema.antrean)
      .set({
        status: 'CALLED',
        petugasId,
        calledAt: new Date(),
        skippedAt: null,
      })
      .where(eq(schema.antrean.id, id))
      .returning()

    if (updated) {
      await emitAntreanEvent('antrean:called', updated.id)
    }

    return updated
  }

  static async skip(id: string) {
    const [updated] = await db
      .update(schema.antrean)
      .set({ status: 'SKIPPED', skippedAt: new Date() })
      .where(
        and(
          eq(schema.antrean.id, id),
          inArray(schema.antrean.status, ['CALLED', 'RECALLED']),
        ),
      )
      .returning()

    if (!updated) {
      throw status(404, { message: 'Antrean tidak ditemukan atau sudah selesai' })
    }
    await emitAntreanEvent('antrean:skipped', updated.id)
    return updated
  }

  static async finish(id: string) {
    const [updated] = await db
      .update(schema.antrean)
      .set({ status: 'FINISHED', finishedAt: new Date() })
      .where(
        and(
          eq(schema.antrean.id, id),
          inArray(schema.antrean.status, ['CALLED', 'RECALLED']),
        ),
      )
      .returning()

    if (!updated) {
      throw status(404, { message: 'Antrean tidak ditemukan atau sudah selesai' })
    }
    await emitAntreanEvent('antrean:finished', updated.id)
    return updated
  }
}
