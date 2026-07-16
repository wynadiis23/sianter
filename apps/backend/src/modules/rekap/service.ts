import { and, eq, gte, lt, SQL, count } from 'drizzle-orm'
import { db, schema } from '../../db/client'
import { QUEUE_STATUS, type QueueStatus } from '@sianter/shared'

interface RekapQuery {
  mode?: string
  tanggal?: string
  bulan?: string
  tahun?: string
  layananId?: string
  loketId?: string
  status?: string
  page?: number
  limit?: number
}

function buildDateConditions(q: RekapQuery): SQL[] {
  const conditions: SQL[] = []

  if (q.tanggal) {
    const start = new Date(q.tanggal + 'T00:00:00+08:00')
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    conditions.push(gte(schema.antrean.createdAt, start))
    conditions.push(lt(schema.antrean.createdAt, end))
  } else if (q.bulan) {
    const start = new Date(q.bulan + '-01T00:00:00+08:00')
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    conditions.push(gte(schema.antrean.createdAt, start))
    conditions.push(lt(schema.antrean.createdAt, end))
  } else if (q.tahun) {
    const start = new Date(q.tahun + '-01-01T00:00:00+08:00')
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + 1)
    conditions.push(gte(schema.antrean.createdAt, start))
    conditions.push(lt(schema.antrean.createdAt, end))
  }

  return conditions
}

function buildFilterConditions(q: RekapQuery) {
  const conditions: SQL[] = buildDateConditions(q)

  if (q.layananId) {
    conditions.push(eq(schema.antrean.layananId, q.layananId))
  }

  if (q.loketId) {
    conditions.push(eq(schema.antrean.loketId, q.loketId))
  }

  if (q.status && (QUEUE_STATUS as readonly string[]).includes(q.status)) {
    conditions.push(eq(schema.antrean.status, q.status as QueueStatus))
  }

  return conditions
}

export abstract class RekapService {
  static async getRekap(q: RekapQuery) {
    const page = Math.max(1, q.page ?? 1)
    const limit = Math.min(100, Math.max(1, q.limit ?? 20))
    const offset = (page - 1) * limit

    const conditions = buildFilterConditions(q)
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const countResult = await db
      .select({ total: count() })
      .from(schema.antrean)
      .where(where)

    const total = countResult[0]?.total ?? 0

    const rows = await db
      .select({
        id: schema.antrean.id,
        kode: schema.antrean.kode,
        nomorUrut: schema.antrean.nomorUrut,
        status: schema.antrean.status,
        namaLayanan: schema.layanan.nama,
        prefixLayanan: schema.layanan.prefix,
        nomorLoket: schema.loket.nomor,
        namaLoket: schema.loket.nama,
        namaPemohon: schema.pemohon.nama,
        noHpPemohon: schema.pemohon.noHp,
        tanggalKunjungan: schema.antrean.tanggalKunjungan,
        createdAt: schema.antrean.createdAt,
        calledAt: schema.antrean.calledAt,
        finishedAt: schema.antrean.finishedAt,
        skippedAt: schema.antrean.skippedAt,
        checkedInAt: schema.antrean.checkedInAt,
        expiredAt: schema.antrean.expiredAt,
      })
      .from(schema.antrean)
      .innerJoin(schema.layanan, eq(schema.antrean.layananId, schema.layanan.id))
      .leftJoin(schema.loket, eq(schema.antrean.loketId, schema.loket.id))
      .leftJoin(schema.pemohon, eq(schema.antrean.pemohonId, schema.pemohon.id))
      .where(where)
      .orderBy(schema.antrean.createdAt)
      .offset(offset)
      .limit(limit)

    const items = rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      calledAt: r.calledAt?.toISOString() ?? null,
      finishedAt: r.finishedAt?.toISOString() ?? null,
      skippedAt: r.skippedAt?.toISOString() ?? null,
      checkedInAt: r.checkedInAt?.toISOString() ?? null,
      expiredAt: r.expiredAt?.toISOString() ?? null,
      tanggalKunjungan: r.tanggalKunjungan ?? null,
    }))

    const summaryRows = await db
      .select({
        status: schema.antrean.status,
        total: count(),
      })
      .from(schema.antrean)
      .where(where)
      .groupBy(schema.antrean.status)

    const summary: Record<string, number> = {}
    for (const s of QUEUE_STATUS) {
      summary[s.toLowerCase()] = 0
    }
    for (const r of summaryRows) {
      if (r.status) {
        summary[r.status.toLowerCase()] = r.total
      }
    }
    summary.total = total

    const perLayananRows = await db
      .select({
        layananId: schema.antrean.layananId,
        status: schema.antrean.status,
        total: count(),
      })
      .from(schema.antrean)
      .where(where)
      .groupBy(schema.antrean.layananId, schema.antrean.status)

    const layananMap = await db
      .select({
        id: schema.layanan.id,
        nama: schema.layanan.nama,
        prefix: schema.layanan.prefix,
      })
      .from(schema.layanan)

    const layananIdx: Record<string, { nama: string; prefix: string }> = {}
    for (const l of layananMap) {
      layananIdx[l.id] = { nama: l.nama, prefix: l.prefix }
    }

    const perLayananMap: Record<string, Record<string, number>> = {}
    for (const r of perLayananRows) {
      if (!perLayananMap[r.layananId]) {
        perLayananMap[r.layananId] = {}
      }
      perLayananMap[r.layananId][r.status] = r.total
    }

    const perLayanan = Object.entries(perLayananMap).map(([layananId, statuses]) => {
      const info = layananIdx[layananId] ?? { nama: 'Unknown', prefix: '?' }
      const entry: Record<string, any> = {
        layananId,
        nama: info.nama,
        prefix: info.prefix,
        total: 0,
      }
      for (const s of QUEUE_STATUS) {
        entry[s.toLowerCase()] = statuses[s] ?? 0
        entry.total += statuses[s] ?? 0
      }
      return entry as {
        layananId: string
        nama: string
        prefix: string
        total: number
        waiting: number
        called: number
        recalled: number
        finished: number
        skipped: number
        expired: number
        reserved: number
      }
    })

    return {
      summary,
      perLayanan,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
