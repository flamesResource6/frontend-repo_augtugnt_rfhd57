import React, { useEffect, useRef } from 'react'

// Audio + cursor reactive particle portal
export default function PortalCanvas() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const audioActiveRef = useRef(false)
  const mouseRef = useRef({ x: 0, y: 0 })
  const deviceTiltRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const center = { x: width / 2, y: height / 2 }
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * DPR
    canvas.height = height * DPR
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    ctx.scale(DPR, DPR)

    const particleCount = Math.min(1600, Math.floor((width * height) / 1200))
    const particles = new Array(particleCount).fill(0).map(() => {
      const r = Math.random() * 2 * Math.PI
      const dist = Math.pow(Math.random(), 0.5) * Math.min(width, height) * 0.45
      const x = center.x + Math.cos(r) * dist
      const y = center.y + Math.sin(r) * dist
      return {
        x,
        y,
        vx: 0,
        vy: 0,
        baseR: 1 + Math.random() * 1.5,
        hue: 260 + Math.random() * 60,
      }
    })

    // Web Audio setup (optional)
    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.85
        source.connect(analyser)
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current = analyser
        dataArrayRef.current = dataArray
        audioActiveRef.current = true
      } catch (e) {
        audioActiveRef.current = false
      }
    }

    setupAudio()

    const onMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const onTouch = (e) => {
      const t = e.touches[0]
      if (!t) return
      mouseRef.current.x = t.clientX
      mouseRef.current.y = t.clientY
    }

    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      center.x = width / 2
      center.y = height / 2
      const DPR2 = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * DPR2
      canvas.height = height * DPR2
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(DPR2, DPR2)
    }

    const onDeviceMotion = (e) => {
      const { beta, gamma } = e // x/y tilt
      // Normalize to [-1, 1]
      if (beta != null && gamma != null) {
        deviceTiltRef.current.x = Math.max(-1, Math.min(1, gamma / 45))
        deviceTiltRef.current.y = Math.max(-1, Math.min(1, beta / 45))
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('deviceorientation', onDeviceMotion)

    let t = 0
    const render = () => {
      t += 0.016
      // Audio level
      let level = 0
      const analyser = analyserRef.current
      const arr = dataArrayRef.current
      if (analyser && arr) {
        analyser.getByteFrequencyData(arr)
        // Focus on low/mid frequencies
        let sum = 0
        const n = Math.min(64, arr.length)
        for (let i = 0; i < n; i++) sum += arr[i]
        level = sum / (n * 255)
      }
      // Base field forces
      const mx = mouseRef.current.x || center.x
      const my = mouseRef.current.y || center.y
      const tiltX = deviceTiltRef.current.x
      const tiltY = deviceTiltRef.current.y

      ctx.clearRect(0, 0, width, height)

      // Subtle nebula backdrop
      const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, Math.max(width, height) * 0.8)
      grad.addColorStop(0, `rgba(20, 10, 40, 0.35)`)
      grad.addColorStop(1, `rgba(5, 2, 15, 0.0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mx + tiltX * 120 - p.x
        const dy = my + tiltY * 120 - p.y
        const dist = Math.hypot(dx, dy) + 0.0001

        // Attraction to cursor with falloff
        const force = Math.min(12 / dist, 0.12)
        p.vx += dx * force * (0.6 + level * 1.8)
        p.vy += dy * force * (0.6 + level * 1.8)

        // Swirl field
        const swirl = 0.002 + level * 0.01
        const svx = -dy * swirl
        const svy = dx * swirl
        p.vx += svx
        p.vy += svy

        // Damping
        p.vx *= 0.92
        p.vy *= 0.92

        p.x += p.vx * 0.016
        p.y += p.vy * 0.016

        // Soft pull back to center bounds
        const ddx = p.x - center.x
        const ddy = p.y - center.y
        const d2 = Math.hypot(ddx, ddy)
        if (d2 > Math.min(width, height) * 0.48) {
          p.vx -= ddx * 0.001
          p.vy -= ddy * 0.001
        }

        // Draw
        const glow = 0.4 + level * 0.9
        const alpha = 0.45 + level * 0.4
        ctx.beginPath()
        ctx.fillStyle = `hsla(${p.hue + Math.sin(t * 0.6 + i * 0.002) * 10}, 90%, ${70 + Math.sin(i) * 10}%, ${alpha})`
        ctx.arc(p.x, p.y, p.baseR + glow * 1.8, 0, Math.PI * 2)
        ctx.fill()
      }

      // Portal ring
      ctx.beginPath()
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.45 + level * 0.4})`
      ctx.lineWidth = 2 + level * 3
      ctx.shadowColor = 'rgba(139, 92, 246, 0.8)'
      ctx.shadowBlur = 20 + level * 40
      ctx.arc(center.x, center.y, Math.min(width, height) * (0.18 + level * 0.05), 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('deviceorientation', onDeviceMotion)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
    />
  )
}
