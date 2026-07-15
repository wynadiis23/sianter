import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { eq } from 'drizzle-orm'
import { status } from 'elysia'
import { db, schema } from '../../db/client'
import type { KegiatanModel } from './model'
import * as XLSX from 'xlsx'

const MODULE_DIR = import.meta.dir
const UPLOADS_DIR = join(MODULE_DIR, '../../../../uploads')
const TEMPLATE_PATH = join(UPLOADS_DIR, 'template_kegiatan.xlsx')
const DEFAULT_TEMPLATE_SRC = join(MODULE_DIR, '../../../../template_kegiatan.xlsx')

export abstract class KegiatanService {
  static async list() {
    return db.select().from(schema.kegiatan).orderBy(schema.kegiatan.tanggalWaktu)
  }

  static async create(body: KegiatanModel['body']) {
    const [created] = await db
      .insert(schema.kegiatan)
      .values(body)
      .returning()
    return created
  }

  static async update(id: string, body: KegiatanModel['body']) {
    const [existing] = await db
      .select()
      .from(schema.kegiatan)
      .where(eq(schema.kegiatan.id, id))
      .limit(1)
    if (!existing) throw status(404, { message: 'Kegiatan tidak ditemukan' })

    const [updated] = await db
      .update(schema.kegiatan)
      .set(body)
      .where(eq(schema.kegiatan.id, id))
      .returning()
    return updated
  }

  static async remove(id: string) {
    const [existing] = await db
      .select()
      .from(schema.kegiatan)
      .where(eq(schema.kegiatan.id, id))
      .limit(1)
    if (!existing) throw status(404, { message: 'Kegiatan tidak ditemukan' })

    await db.delete(schema.kegiatan).where(eq(schema.kegiatan.id, id))
    return { success: true as const }
  }

  static async importExcel(buffer: ArrayBuffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      range: 1,
    })

    const parsed = rows
      .filter((row) => {
        const tgl = row['Hari/Tanggal/Waktu']
        const kegiatan = row['Kegiatan']
        return tgl && kegiatan && String(tgl).trim() && String(kegiatan).trim()
      })
      .map((row) => ({
        tanggalWaktu: String(row['Hari/Tanggal/Waktu'] ?? '').trim(),
        namaKegiatan: String(row['Kegiatan'] ?? '').trim(),
        metodeRapat: String(row['Metode Rapat'] ?? '').trim(),
        penyelenggara: String(row['Penyelenggara'] ?? '').trim(),
        nomorSurat: String(row['Nomor Surat'] ?? '').trim(),
        keterangan: String(row['Keterangan'] ?? '').trim(),
      }))

    if (parsed.length === 0) {
      throw status(400, { message: 'Tidak ada data valid di file Excel' })
    }

    const existing = await db.select({ id: schema.kegiatan.id }).from(schema.kegiatan)
    const replaced = existing.length

    await db.transaction(async (tx) => {
      await tx.delete(schema.kegiatan);
      await tx.insert(schema.kegiatan).values(parsed);
    })

    return { imported: parsed.length, replaced }
  }

  static ensureDefaultTemplate() {
    if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })
    if (!existsSync(TEMPLATE_PATH) && existsSync(DEFAULT_TEMPLATE_SRC)) {
      Bun.write(TEMPLATE_PATH, Bun.file(DEFAULT_TEMPLATE_SRC))
    }
  }

  static getTemplate() {
    this.ensureDefaultTemplate()
    if (!existsSync(TEMPLATE_PATH)) throw status(404, { message: 'Template tidak tersedia' })
    return Bun.file(TEMPLATE_PATH).arrayBuffer()
  }

  static async updateTemplate(buffer: ArrayBuffer) {
    if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })
    await Bun.write(TEMPLATE_PATH, buffer)
    return { success: true as const }
  }
}