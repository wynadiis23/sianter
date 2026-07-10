import { eq } from 'drizzle-orm'
import { db, schema } from '../../db/client'
import type { WsEvent, PengaturanEventData } from './model'

const monitorClients = new Set<any>()
const loketClients = new Set<any>()

export function registerMonitor(ws: any) {
  monitorClients.add(ws)
}

export function unregisterMonitor(ws: any) {
  monitorClients.delete(ws)
}

export function registerLoket(ws: any) {
  loketClients.add(ws)
}

export function unregisterLoket(ws: any) {
  loketClients.delete(ws)
}

function broadcast(clients: Set<any>, event: WsEvent) {
  for (const ws of clients) ws.send(event)
}

export function broadcastMonitor(event: WsEvent) {
  broadcast(monitorClients, event)
}

export function broadcastLoket(event: WsEvent) {
  broadcast(loketClients, event)
}

export async function emitAntreanEvent(
  type: WsEvent['type'],
  antreanId: string,
) {
  try {
    const [row] = await db
      .select({
        id: schema.antrean.id,
        kode: schema.antrean.kode,
        nomorUrut: schema.antrean.nomorUrut,
        layananId: schema.antrean.layananId,
        layananNama: schema.layanan.nama,
        loketId: schema.antrean.loketId,
        loketNomor: schema.loket.nomor,
        loketNama: schema.loket.nama,
        status: schema.antrean.status,
      })
      .from(schema.antrean)
      .innerJoin(schema.layanan, eq(schema.antrean.layananId, schema.layanan.id))
      .leftJoin(schema.loket, eq(schema.antrean.loketId, schema.loket.id))
      .where(eq(schema.antrean.id, antreanId))
      .limit(1)

    if (!row) return

    const event = { type, data: row } as WsEvent
    broadcastMonitor(event)
    broadcastLoket(event)
  } catch (err) {
    console.error(`[realtime] emitAntreanEvent ${type} failed:`, err)
  }
}

export async function emitPengaturanEvent(data: PengaturanEventData) {
  try {
    const event = { type: 'pengaturan:updated' as const, data } as WsEvent
    broadcastMonitor(event)
    broadcastLoket(event)
  } catch (err) {
    console.error('[realtime] emitPengaturanEvent failed:', err)
  }
}