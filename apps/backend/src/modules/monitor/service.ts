import { eq, and, inArray, gte, lt, desc, isNotNull } from 'drizzle-orm'
import { db, schema } from '../../db/client'

export abstract class MonitorService {
  static async get() {
    const [pengaturan] = await db
      .select()
      .from(schema.pengaturan)
      .limit(1)

    const kegiatanList = await db
      .select({
        id: schema.kegiatan.id,
        tanggalWaktu: schema.kegiatan.tanggalWaktu,
        namaKegiatan: schema.kegiatan.namaKegiatan,
        metodeRapat: schema.kegiatan.metodeRapat,
        penyelenggara: schema.kegiatan.penyelenggara,
        nomorSurat: schema.kegiatan.nomorSurat,
        keterangan: schema.kegiatan.keterangan,
      })
      .from(schema.kegiatan)
      .orderBy(schema.kegiatan.tanggalWaktu)

    const layananList = await db
      .select()
      .from(schema.layanan)
      .where(eq(schema.layanan.aktif, true))
      .orderBy(schema.layanan.nama)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const result = await Promise.all(
      layananList.map(async (l) => {
        const [dipanggil] = await db
          .select({
            kode: schema.antrean.kode,
            nomorUrut: schema.antrean.nomorUrut,
            status: schema.antrean.status,
            loketNama: schema.loket.nama,
          })
          .from(schema.antrean)
          .leftJoin(schema.loket, eq(schema.antrean.loketId, schema.loket.id))
          .where(
            and(
              eq(schema.antrean.layananId, l.id),
              inArray(schema.antrean.status, ['CALLED', 'RECALLED']),
            ),
          )
          .limit(1)

        const menunggu = await db
          .select({
            kode: schema.antrean.kode,
            nomorUrut: schema.antrean.nomorUrut,
          })
          .from(schema.antrean)
          .where(
            and(
              eq(schema.antrean.layananId, l.id),
              eq(schema.antrean.status, 'WAITING'),
              gte(schema.antrean.createdAt, today),
              lt(schema.antrean.createdAt, tomorrow),
            ),
          )
          .orderBy(schema.antrean.createdAt)
          .limit(5)

        const dilewati = await db
          .select({
            kode: schema.antrean.kode,
            nomorUrut: schema.antrean.nomorUrut,
          })
          .from(schema.antrean)
          .where(
            and(
              eq(schema.antrean.layananId, l.id),
              eq(schema.antrean.status, 'SKIPPED'),
              gte(schema.antrean.createdAt, today),
              lt(schema.antrean.createdAt, tomorrow),
              isNotNull(schema.antrean.skippedAt),
            ),
          )
          .orderBy(desc(schema.antrean.skippedAt))
          .limit(5)

        return {
          id: l.id,
          nama: l.nama,
          prefix: l.prefix,
          warna: l.warna ?? null,
          dipanggil: dipanggil ?? null,
          menunggu,
          dilewati,
        }
      }),
    )

    return {
      layanan: result,
      kegiatan: kegiatanList,
      runningText: pengaturan?.runningText ?? null,
      mediaUrl: pengaturan?.mediaUrl ?? null,
      youtubeVideoUrl: pengaturan?.youtubeVideoUrl ?? null,
      youtubePlaylistUrl: pengaturan?.youtubePlaylistUrl ?? null,
      slideshowImages: pengaturan?.slideshowImages ?? null,
      slideshowInterval: pengaturan?.slideshowInterval ?? 5,
    }
  }
}