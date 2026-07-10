import { useState, useCallback, useRef } from 'react'

export function useSpeech() {
  const [enabled, setEnabled] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    return ctxRef.current
  }

  const speak = useCallback(
    async (text: string) => {
      if (!enabled) return

      const match = text.match(/^Nomor (\S+), silakan menuju (.+)$/)
      if (!match) return
      const [, kode, loket] = match

      const tokens: string[] = ['frase_nomor']

      for (const ch of kode) {
        if (/[A-Z]/.test(ch)) tokens.push(`abjad_${ch}`)
        else if (/[0-9]/.test(ch)) tokens.push(`angka_${ch}`)
      }

      tokens.push('frase_loket')

      if (loket !== 'loket') {
        for (const ch of loket) {
          if (/[A-Z]/.test(ch)) tokens.push(`abjad_${ch}`)
          else if (/[0-9]/.test(ch)) tokens.push(`angka_${ch}`)
        }
      }

      try {
        const ctx = getCtx()
        if (ctx.state === 'suspended') await ctx.resume()

        sourceRef.current?.stop()
        sourceRef.current?.disconnect()

        const buffers = await Promise.all(
          tokens.map(async (t) => {
            const res = await fetch(`/audio/${t}.wav`)
            const arr = await res.arrayBuffer()
            return ctx.decodeAudioData(arr)
          }),
        )

        const totalLength = buffers.reduce((s, b) => s + b.length, 0)
        const output = ctx.createBuffer(1, totalLength, ctx.sampleRate)
        let offset = 0
        for (const buf of buffers) {
          output.copyToChannel(buf.getChannelData(0), 0, offset)
          offset += buf.length
        }

        const source = ctx.createBufferSource()
        source.buffer = output
        source.connect(ctx.destination)
        // source.playbackRate.value = 1.0
        source.start()
        sourceRef.current = source
      } catch {
        // silently ignore playback errors
      }
    },
    [enabled],
  )

  return { enabled, setEnabled, speak }
}