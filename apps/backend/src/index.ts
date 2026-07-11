import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authPlugin } from './auth/plugin'
import { realtimeModule } from './modules/realtime'
import { healthModule } from './modules/health'
import { meModule } from './modules/me'
import { layananModule } from './modules/layanan'
import { loketModule } from './modules/loket'
import { pengaturanModule } from './modules/pengaturan'
import { kiosModule } from './modules/kios'
import { antreanModule } from './modules/antrean'
import { monitorModule } from './modules/monitor'
import { trackingModule } from './modules/tracking'
import { antreanOnlineModule } from './modules/antrean-online'

const app = new Elysia()
  .use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  )
  .use(authPlugin)
  .use(realtimeModule)
  .use(healthModule)
  .use(meModule)
  .use(layananModule)
  .use(loketModule)
  .use(pengaturanModule)
  .use(kiosModule)
  .use(antreanModule)
  .use(monitorModule)
  .use(trackingModule)
  .use(antreanOnlineModule)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)

export type App = typeof app
export type { WsEvent, AntreanEventData, PengaturanEventData } from './modules/realtime/model'
