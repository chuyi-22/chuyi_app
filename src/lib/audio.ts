export type SoundKey = 'rain' | 'ocean' | 'forest' | 'fire'

export const SOUNDS: { key: SoundKey; label: string; emoji: string }[] = [
  { key: 'rain', label: '雨声', emoji: '🌧️' },
  { key: 'ocean', label: '海浪', emoji: '🌊' },
  { key: 'forest', label: '森林', emoji: '🌲' },
  { key: 'fire', label: '篝火', emoji: '🔥' },
]

function noiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown', seconds = 4): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    if (type === 'white') {
      data[i] = white * 0.6
    } else if (type === 'brown') {
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.2
    } else {
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
  }
  return buf
}

class AmbientEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private sources: AudioScheduledSourceNode[] = []
  private nodes: AudioNode[] = []
  private volume = 0.5
  private current: SoundKey | null = null

  private context(): AudioContext {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.volume
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  get playing(): SoundKey | null {
    return this.current
  }

  async play(key: SoundKey) {
    const ctx = this.context()
    if (ctx.state === 'suspended') await ctx.resume()
    this.stop()
    this.current = key
    const master = this.master!

    const src = ctx.createBufferSource()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    if (key === 'rain') {
      src.buffer = noiseBuffer(ctx, 'white')
      filter.type = 'bandpass'
      filter.frequency.value = 1400
      filter.Q.value = 0.6
      gain.gain.value = 0.5
    } else if (key === 'ocean') {
      src.buffer = noiseBuffer(ctx, 'brown')
      filter.type = 'lowpass'
      filter.frequency.value = 700
      gain.gain.value = 0.45
      // 慢速起伏
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.09
      lfoGain.gain.value = 0.22
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)
      lfo.start()
      this.sources.push(lfo)
      this.nodes.push(lfoGain)
    } else if (key === 'forest') {
      src.buffer = noiseBuffer(ctx, 'pink')
      filter.type = 'bandpass'
      filter.frequency.value = 2400
      filter.Q.value = 0.5
      gain.gain.value = 0.32
    } else {
      src.buffer = noiseBuffer(ctx, 'brown')
      filter.type = 'lowpass'
      filter.frequency.value = 1600
      gain.gain.value = 0.4
      // 篝火噼啪：随机抖动音量
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.type = 'triangle'
      lfo.frequency.value = 7
      lfoGain.gain.value = 0.12
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)
      lfo.start()
      this.sources.push(lfo)
      this.nodes.push(lfoGain)
    }

    src.loop = true
    src.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    src.start()

    this.sources.push(src)
    this.nodes.push(filter, gain)
  }

  stop() {
    for (const s of this.sources) {
      try {
        s.stop()
      } catch {
        /* already stopped */
      }
    }
    for (const n of this.nodes) {
      try {
        n.disconnect()
      } catch {
        /* noop */
      }
    }
    this.sources = []
    this.nodes = []
    this.current = null
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05)
    }
  }

  dispose() {
    this.stop()
    this.ctx?.close()
    this.ctx = null
    this.master = null
  }
}

export const ambient = new AmbientEngine()

/** 计时结束的提示音 */
export function playChime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    const notes = [784, 988, 1175]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.16)
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + i * 0.16 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.16 + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.16)
      osc.stop(ctx.currentTime + i * 0.16 + 0.55)
    })
    window.setTimeout(() => ctx.close(), 1400)
  } catch {
    /* 浏览器不支持音频时静默失败 */
  }
}
