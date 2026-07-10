import { eq, and, inArray, gte, lt } from 'drizzle-orm'
import { db, schema } from '../../db/client'

export abstract class MonitorService {
  static async get() {
    const [pengaturan] = await db
      .select()
      .from(schema.pengaturan)
      .limit(1)

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

        return {
          id: l.id,
          nama: l.nama,
          prefix: l.prefix,
          warna: l.warna ?? null,
          dipanggil: dipanggil ?? null,
          menunggu,
        }
      }),
    )

    return {
      layanan: result,
      runningText: pengaturan?.runningText ?? null,
      mediaUrl: pengaturan?.mediaUrl ?? null,
      youtubeVideoUrl: pengaturan?.youtubeVideoUrl ?? null,
      youtubePlaylistUrl: pengaturan?.youtubePlaylistUrl ?? null,
      slideshowImages: pengaturan?.slideshowImages ?? null,
      slideshowInterval: pengaturan?.slideshowInterval ?? 5,
    }
  }
}