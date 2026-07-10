import { Elysia } from 'elysia'
import { MonitorService } from './service'
import { MonitorModel } from './model'

export const monitorModule = new Elysia({ prefix: '/api/monitor' }).get(
  '/',
  () => MonitorService.get(),
  {
    response: MonitorModel.response,
  },
)