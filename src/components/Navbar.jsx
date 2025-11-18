import React from 'react'

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3">
          <a href="#" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-[0_0_25px_rgba(124,58,237,0.7)]" />
            <span className="text-white font-semibold tracking-wide">Angel of Darkness</span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <a href="#services" className="text-violet-100/80 hover:text-white">Offerings</a>
            <a href="#book" className="text-violet-100/80 hover:text-white">Book</a>
            <a href="#shop" className="text-violet-100/80 hover:text-white">Shop</a>
            <a href="#contact" className="text-violet-100/80 hover:text-white">Contact</a>
          </nav>
          <a href="#book" className="inline-flex items-center rounded-xl bg-violet-500/90 hover:bg-violet-500 text-white px-4 py-2 text-sm font-medium transition">
            Book Now
          </a>
        </div>
      </div>
    </header>
  )
}
