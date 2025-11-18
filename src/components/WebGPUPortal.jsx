import React, { useEffect, useRef, useState } from 'react'
import PortalCanvas from './PortalCanvas'

// Experimental: WebGPU particle portal with compute shader + instanced quads
export default function WebGPUPortal() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const [gpuOk, setGpuOk] = useState(true)

  // Audio
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
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
      } catch (e) {
        // mic denied; fine
      }
    }
    setupAudio()
  }, [])

  useEffect(() => {
    let device, context, format
    let computePipeline, renderPipeline
    let positionBuffer, velocityBuffer, paramsBuffer
    let bindGroup, bindGroupRender

    const canvas = canvasRef.current
    if (!canvas) return

    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    const particleCount = Math.min(200_000, Math.floor((window.innerWidth * window.innerHeight) / 4)) // heavy but scalable

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * DPR)
      canvas.height = Math.floor(h * DPR)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      if (context) {
        context.configure({ device, format, alphaMode: 'premultiplied', size: [canvas.width, canvas.height] })
      }
    }

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

    const init = async () => {
      try {
        if (!('gpu' in navigator)) throw new Error('WebGPU not supported')
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) throw new Error('No WebGPU adapter')
        device = await adapter.requestDevice()
        context = canvas.getContext('webgpu')
        format = navigator.gpu.getPreferredCanvasFormat()
        context.configure({ device, format, alphaMode: 'premultiplied' })
        resize()

        // Create buffers
        const posArray = new Float32Array(particleCount * 2)
        const velArray = new Float32Array(particleCount * 2)
        for (let i = 0; i < particleCount; i++) {
          const r = Math.random() * Math.PI * 2
          const d = Math.pow(Math.random(), 0.5) * 0.9
          posArray[i * 2 + 0] = Math.cos(r) * d
          posArray[i * 2 + 1] = Math.sin(r) * d
          velArray[i * 2 + 0] = 0
          velArray[i * 2 + 1] = 0
        }
        positionBuffer = device.createBuffer({
          size: posArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        })
        velocityBuffer = device.createBuffer({
          size: velArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        })
        device.queue.writeBuffer(positionBuffer, 0, posArray)
        device.queue.writeBuffer(velocityBuffer, 0, velArray)

        // Params: mouse (clip), dt, audio, aspect, count
        const paramsSize = 4 * 4 // 4 floats
        paramsBuffer = device.createBuffer({ size: paramsSize, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })

        const computeShader = /* wgsl */`
          struct Vec2 { x: f32, y: f32 };
          struct Positions { data: array<vec2<f32>> };
          struct Velocities { data: array<vec2<f32>> };
          @group(0) @binding(0) var<storage, read_write> positions: Positions;
          @group(0) @binding(1) var<storage, read_write> velocities: Velocities;
          @group(0) @binding(2) var<uniform> params: vec4<f32>; // mouse.x, mouse.y, dt, audio

          @compute @workgroup_size(256)
          fn main(@builtin(global_invocation_id) id: vec3<u32>) {
            let i = id.x;
            if (i >= arrayLength(&positions.data)) { return; }
            var p = positions.data[i];
            var v = velocities.data[i];

            // Attraction towards mouse
            let mx = params.x; // clip space [-1,1]
            let my = params.y;
            var dx = mx - p.x;
            var dy = my - p.y;
            let dist = max(length(vec2<f32>(dx, dy)), 0.0001);

            let force = min(0.6 / dist, 0.06);
            let audio = params.w;
            v = v + vec2<f32>(dx, dy) * force * (0.6 + audio * 2.0);

            // Swirl
            let swirl = 0.08 + audio * 0.25;
            let svx = -dy * swirl;
            let svy =  dx * swirl;
            v = v + vec2<f32>(svx, svy);

            // Damping
            v = v * 0.965;

            // Integrate
            let dt = params.z;
            p = p + v * dt;

            // Soft bounds pull
            let d2 = length(p);
            if (d2 > 0.98) {
              p = p * 0.98;
              v = v - normalize(p) * 0.001;
            }

            positions.data[i] = p;
            velocities.data[i] = v;
          }
        `

        computePipeline = device.createComputePipeline({
          layout: 'auto',
          compute: { module: device.createShaderModule({ code: computeShader }), entryPoint: 'main' }
        })

        const renderShader = /* wgsl */`
          struct Positions { data: array<vec2<f32>> };
          @group(0) @binding(0) var<storage, read> positions: Positions;
          @group(0) @binding(1) var<uniform> params: vec4<f32>; // mouse.x, mouse.y, dt, audio

          struct VSOut { @builtin(position) pos: vec4<f32>; @location(0) hue: f32; };

          @vertex
          fn vs(@builtin(instance_index) iid: u32, @builtin(vertex_index) vid: u32) -> VSOut {
            // build a small quad from vertex_index
            var corners = array<vec2<f32>, 6>(
              vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0),
              vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, 1.0), vec2<f32>(-1.0, 1.0)
            );
            let p = positions.data[iid];
            let audio = params.w;
            let size = 0.006 + audio * 0.01; // in clip space
            let corner = corners[vid] * size;
            var out: VSOut;
            out.pos = vec4<f32>(p + corner, 0.0, 1.0);
            out.hue = f32(iid % 1024u) / 1024.0;
            return out;
          }

          @fragment
          fn fs(in: VSOut) -> @location(0) vec4<f32> {
            // simple mystical violet palette
            let h = in.hue;
            let r = 0.6 + 0.4 * abs(sin(6.2831 * (h + 0.15)));
            let g = 0.4 + 0.3 * abs(sin(6.2831 * (h + 0.45)));
            let b = 0.9;
            return vec4<f32>(r, g, b, 0.8);
          }
        `

        renderPipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module: device.createShaderModule({ code: renderShader }), entryPoint: 'vs' },
          fragment: { module: device.createShaderModule({ code: renderShader }), entryPoint: 'fs', targets: [{ format }] },
          primitive: { topology: 'triangle-list' }
        })

        bindGroup = device.createBindGroup({
          layout: computePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: positionBuffer } },
            { binding: 1, resource: { buffer: velocityBuffer } },
            { binding: 2, resource: { buffer: paramsBuffer } },
          ]
        })

        bindGroupRender = device.createBindGroup({
          layout: renderPipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: positionBuffer } },
            { binding: 1, resource: { buffer: paramsBuffer } },
          ]
        })

        let last = performance.now()
        const frame = () => {
          const now = performance.now()
          const dt = Math.min((now - last) / 1000, 0.033)
          last = now

          // audio level
          let level = 0
          const an = analyserRef.current
          const arr = dataArrayRef.current
          if (an && arr) {
            an.getByteFrequencyData(arr)
            let sum = 0
            const n = Math.min(64, arr.length)
            for (let i = 0; i < n; i++) sum += arr[i]
            level = sum / (n * 255)
          }

          // mouse to clip space
          const cx = (mouseRef.current.x / window.innerWidth) * 2 - 1
          const cy = -((mouseRef.current.y / window.innerHeight) * 2 - 1)

          const params = new Float32Array([cx, cy, dt, level])
          device.queue.writeBuffer(paramsBuffer, 0, params)

          // Compute pass
          const encoder = device.createCommandEncoder()
          const cpass = encoder.beginComputePass()
          cpass.setPipeline(computePipeline)
          cpass.setBindGroup(0, bindGroup)
          const wg = Math.ceil(particleCount / 256)
          cpass.dispatchWorkgroups(wg)
          cpass.end()

          // Render pass
          const texView = context.getCurrentTexture().createView()
          const rpass = encoder.beginRenderPass({
            colorAttachments: [{
              view: texView,
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store'
            }]
          })
          rpass.setPipeline(renderPipeline)
          rpass.setBindGroup(0, bindGroupRender)
          rpass.draw(6, particleCount) // 6 verts per quad, instanced by particleCount
          rpass.end()

          device.queue.submit([encoder.finish()])
          rafRef.current = requestAnimationFrame(frame)
        }
        rafRef.current = requestAnimationFrame(frame)
      } catch (e) {
        console.warn('WebGPU init failed, falling back to 2D portal', e)
        setGpuOk(false)
      }
    }

    init()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onTouch, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  if (!gpuOk || !(typeof navigator !== 'undefined' && 'gpu' in navigator)) {
    return <PortalCanvas />
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
    />
  )
}
