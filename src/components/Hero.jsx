import React from 'react'
import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden">
      {/* 3D mystical cover */}
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/no-S8HKPA9ln9-NN/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Atmospheric overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0b15]/40 via-[#0b0b15]/30 to-[#0b0b15]/70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.25),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-24 sm:py-32 flex min-h-[90vh] items-center">
        <div className="max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs sm:text-sm text-violet-200/80 mb-4">Mystic Guidance • Shadow Work • Energy Alchemy</p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight text-white drop-shadow-[0_0_45px_rgba(124,58,237,0.35)]">
            Angel of Darkness
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-violet-100/90 max-w-2xl">
            Tarot readings, chakra cleansing, and enchanted offerings for seekers who walk between worlds. Step into the glow and receive the messages meant for you.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#book" className="inline-flex items-center rounded-xl bg-violet-500/90 hover:bg-violet-500 text-white px-6 py-3 text-sm font-medium transition">
              Book a Reading
            </a>
            <a href="#shop" className="inline-flex items-center rounded-xl border border-violet-300/30 bg-black/30 hover:bg-black/50 text-violet-100 px-6 py-3 text-sm font-medium backdrop-blur-sm transition">
              Shop Mystics
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
