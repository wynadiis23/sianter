import { Printer, InMemory, Image, Align, Style, Cut } from 'escpos-buffer'
import { PNG } from 'pngjs'
import fs from 'fs'
import { join } from 'path'
import type { PrinterModel } from './model'
import { CustomManager } from './manager'

const LOGO_PATH = join(import.meta.dir, '..', '..', 'assets', 'logo-kpu-bali.png')
const imageManager = new CustomManager()

function loadLogo(): Image {
  const png = PNG.sync.read(fs.readFileSync(LOGO_PATH))
  const maxWidth = 70

  if (png.width <= maxWidth) {
    return new Image({ data: Buffer.from(png.data), width: png.width, height: png.height })
  }

  const scale = maxWidth / png.width
  const width = maxWidth
  const height = Math.max(1, Math.round(png.height * scale))
  const resized = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    const srcY = Math.min(png.height - 1, Math.floor(y / scale))
    for (let x = 0; x < width; x++) {
      const srcX = Math.min(png.width - 1, Math.floor(x / scale))
      const srcIdx = (srcY * png.width + srcX) * 4
      const dstIdx = (y * width + x) * 4

      resized[dstIdx] = png.data[srcIdx]
      resized[dstIdx + 1] = png.data[srcIdx + 1]
      resized[dstIdx + 2] = png.data[srcIdx + 2]
      resized[dstIdx + 3] = png.data[srcIdx + 3]
    }
  }

  return new Image({ data: resized, width, height })
}

export abstract class PrinterService {
  static async generateReceipt(
    body: PrinterModel['receiptBody'],
  ): Promise<PrinterModel['response']> {
    const connection = new InMemory()
    const printer = await Printer.CONNECT('POS-58', connection, imageManager)

    await printer.setColumns(32)

    const logo = loadLogo()
    await printer.setAlignment(Align.Center)
    await printer.draw(logo)

    await printer.writeln('KOMISI PEMILIHAN UMUM', 0, Align.Center)
    await printer.writeln('PROVINSI BALI', 0, Align.Center)
    await printer.feed(1)
    await printer.writeln('================================', 0, Align.Center)
    await printer.feed(1)

    await printer.writeln('NOMOR ANTREAN', 0, Align.Center)
    await printer.withStyle({
      width: 4,
      height: 6,
      bold: true,
      align: Align.Center,
      }, async () => {
        await printer.writeln(body.kode)
    })
    await printer.feed(1)

    await printer.writeln('================================', 0, Align.Center)

    if (body.kuesionerUrl) {
      await printer.writeln('Bantu tingkatkan layanan kami', 0, Align.Center)
      await printer.feed(1)
      await printer.withStyle({
        align: Align.Center
      }, async () => {
        await printer.qrcode(body.kuesionerUrl!, 3)
      })
      await printer.writeln(body.kuesionerUrl, Style.Condensed, Align.Center)
      await printer.feed(1)
    }


    await printer.cutter(Cut.Partial)
    await printer.close()

    const buffer = connection.buffer()
    return { buffer: buffer.toString('base64') }
  }

  static async generateTestPrint(): Promise<PrinterModel['response']> {
    const connection = new InMemory()
    const printer = await Printer.CONNECT('POS-58', connection, imageManager)

    await printer.writeln('=== TEST PRINT ===', Style.Bold, Align.Center)
    await printer.writeln('Sianter Queue System', 0, Align.Center)
    await printer.writeln('Printer Thermal OK', 0, Align.Center)
    await printer.feed(3)
    await printer.cutter(Cut.Partial)
    await printer.close()

    const buffer = connection.buffer()
    return { buffer: buffer.toString('base64') }
  }
}