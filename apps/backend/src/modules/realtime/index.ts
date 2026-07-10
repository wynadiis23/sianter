import { Elysia } from 'elysia'
import { auth } from '../../auth/auth'
import { WsModel } from './model'
import {
  registerMonitor,
  unregisterMonitor,
  registerLoket,
  unregisterLoket,
} from './service'

export const realtimeModule = new Elysia({ prefix: '/api/ws' })
  .ws('/monitor', {
    response: WsModel.event,
    open(ws) {
      registerMonitor(ws)
    },
    close(ws) {
      unregisterMonitor(ws)
    },
    message() {},
  })
  .ws('/loket', {
    response: WsModel.event,
    async open(ws) {
      const session = await auth.api.getSession({
        headers: ws.data.request.headers,
      })
      if (
        !session ||
        (session.user.role !== 'PETUGAS_LOKET' &&
          session.user.role !== 'SUPER_ADMIN')
      ) {
        ws.close()
        return
      }
      registerLoket(ws)
    },
    close(ws) {
      unregisterLoket(ws)
    },
    message() {},
  })