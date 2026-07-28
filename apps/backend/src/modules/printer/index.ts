import { Elysia } from 'elysia'
import { PrinterService } from './service'
import { PrinterModel } from './model'

export const printerModule = new Elysia({ prefix: '/api/printer' })
  .post(
    '/receipt',
    ({ body }) => PrinterService.generateReceipt(body),
    {
      body: PrinterModel.receiptBody,
      response: { 200: PrinterModel.response },
    },
  )
  .post(
    '/test',
    () => PrinterService.generateTestPrint(),
    {
      response: { 200: PrinterModel.response },
    },
  )