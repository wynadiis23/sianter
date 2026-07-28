import QRCode from 'qrcode'
import { Manager, type ImageData } from 'escpos-buffer'

export class CustomManager extends Manager {
  async buildQrcodeImage(data: string, size: number): Promise<ImageData> {
    const moduleSize = size ?? 6
    const qr = QRCode.create(data, { errorCorrectionLevel: 'L' })
    const modules = qr.modules
    const matrixSize = modules.size
    const pixelSize = matrixSize * moduleSize

    const rgba = Buffer.alloc(pixelSize * pixelSize * 4)

    for (let y = 0; y < pixelSize; y++) {
      for (let x = 0; x < pixelSize; x++) {
        const moduleX = Math.floor(x / moduleSize)
        const moduleY = Math.floor(y / moduleSize)
        const isBlack = modules.get(moduleX, moduleY) === 1
        const idx = (y * pixelSize + x) * 4
        rgba[idx] = isBlack ? 0 : 255
        rgba[idx + 1] = isBlack ? 0 : 255
        rgba[idx + 2] = isBlack ? 0 : 255
        rgba[idx + 3] = 255
      }
    }

    return { data: rgba, width: pixelSize, height: pixelSize }
  }

  async loadImage(): Promise<ImageData> {
    throw new Error('loadImage not needed')
  }

  async loadImageFromBuffer(): Promise<ImageData> {
    throw new Error('loadImageFromBuffer not needed')
  }
}