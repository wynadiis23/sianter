import { useState, useCallback, useRef } from 'react'

export function useSpeech() {
  const [enabled, setEnabled] = useState(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  if (typeof window !== 'undefined' && voicesRef.current.length === 0) {
    const synth = window.speechSynthesis
    const loadVoices = () => {
      voicesRef.current = synth.getVoices()
    }
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices, { once: true })
  }

  const speak = useCallback(
    (text: string) => {
      if (!enabled) return
      const synth = window.speechSynthesis
      if (!synth) return
      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'id-ID'
      const idVoice = voicesRef.current.find((v) => v.lang.startsWith('id'))
      if (idVoice) utterance.voice = idVoice
      synth.speak(utterance)
    },
    [enabled],
  )

  return { enabled, setEnabled, speak }
}