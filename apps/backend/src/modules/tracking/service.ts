import { eq, and, gte, lt, sql } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'

export abstract class TrackingService {
  static async getByToken(token: string) {
    const [antrean] = await db
      .select({
        kode: schema.antrean.kode,
        status: schema.antrean.status,
        namaLayanan: schema.layanan.nama,
        nama: schema.pemohon.nama,
        loketNama: schema.loket.nama,
        pemohonId: schema.antrean.pemohonId,
        layananId: schema.antrean.layananId,
        createdAt: schema.antrean.createdAt,
        calledAt: schema.antrean.calledAt,
        finishedAt: schema.antrean.finishedAt,
      })
      .from(schema.antrean)
      .innerJoin(schema.layanan, eq(schema.antrean.layananId, schema.layanan.id))
      .innerJoin(schema.pemohon, eq(schema.antrean.pemohonId, schema.pemohon.id))
      .leftJoin(schema.loket, eq(schema.antrean.loketId, schema.loket.id))
      .where(eq(schema.antrean.trackingToken, token))
      .limit(1)

    if (!antrean) {
      throw status(404, { message: 'Antrean tidak ditemukan' })
    }

    let position: number | null = null
    let totalWaiting = 0

    if (antrean.status === 'WAITING') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [result] = await db
        .select({
          total: sql<number>`count(*)`,
          pos: sql<number>`count(*) filter (where ${schema.antrean.createdAt} <= ${antrean.createdAt})`,
        })
        .from(schema.antrean)
        .where(
          and(
            eq(schema.antrean.layananId, antrean.layananId),
            eq(schema.antrean.status, 'WAITING'),
            gte(schema.antrean.createdAt, today),
            lt(schema.antrean.createdAt, tomorrow),
          ),
        )

      totalWaiting = Number(result?.total ?? 0)
      position = result?.pos != null ? Number(result.pos) : null
    }

    return {
      kode: antrean.kode,
      status: antrean.status,
      nama: antrean.nama,
      namaLayanan: antrean.namaLayanan,
      position,
      totalWaiting,
      loketNama: antrean.loketNama,
      createdAt: antrean.createdAt.toISOString(),
      calledAt: antrean.calledAt?.toISOString() ?? null,
      finishedAt: antrean.finishedAt?.toISOString() ?? null,
    }
  }
}
