import React from 'react'

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-[#090914] border-t border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.06),transparent_60%)]" />
      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500" />
            <span className="text-white font-semibold">Angel of Darkness</span>
          </div>
          <p className="mt-3 text-sm text-violet-200/70 max-w-md">Readings and remedies for those called to walk the liminal way. With care, integrity, and magic.</p>
        </div>
        <div className="text-violet-200/80 text-sm">
          <p>angelofdarkness@example.com</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
