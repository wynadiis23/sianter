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
  return new Image({ data: Buffer.from(png.data), width: png.width, height: png.height })
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
    await printer.feed(1)

    await printer.writeln('KOMISI PEMILIHAN UMUM', Style.Bold, Align.Center)
    await printer.writeln('PROVINSI BALI', Style.Bold, Align.Center)
    await printer.feed(1)
    await printer.writeln('================================', 0, Align.Center)
    await printer.feed(1)

    await printer.writeln('NOMOR ANTREAN', 0, Align.Center)
    await printer.feed(1)
    await printer.writeln(
      body.kode,
      Style.DoubleHeight | Style.DoubleWidth | Style.Bold,
      Align.Center,
    )
    await printer.feed(1)

    await printer.writeln('================================', 0, Align.Center)
    await printer.feed(1)

    await printer.writeln(body.namaLayanan, 0, Align.Left)
    await printer.writeln(body.timestamp, 0, Align.Left)
    await printer.feed(1)

    await printer.writeln('================================', 0, Align.Center)
    await printer.feed(1)

    await printer.qrcode(body.trackingUrl, 6)
    await printer.writeln('Scan QR untuk pantau antrean', 0, Align.Center)
    await printer.feed(1)

    if (body.kuesionerUrl) {
      await printer.writeln('================================', 0, Align.Center)
      await printer.feed(1)
      if (body.kuesionerCaption) {
        await printer.writeln(body.kuesionerCaption, 0, Align.Center)
        await printer.feed(1)
      }
      await printer.qrcode(body.kuesionerUrl, 6)
      await printer.feed(1)
    }

    await printer.writeln('================================', 0, Align.Center)
    await printer.feed(1)
    await printer.writeln('Harap menunggu nomor antrean', 0, Align.Center)
    await printer.writeln('Anda dipanggil.', 0, Align.Center)
    await printer.writeln('Terima kasih.', 0, Align.Center)
    await printer.feed(3)

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