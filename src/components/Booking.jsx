import React, { useState } from 'react'

export default function Booking() {
  const [form, setForm] = useState({ name: '', email: '', service: 'Tarot Reading', notes: '' })
  const [status, setStatus] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      // For now, mock success. Can be wired to backend later.
      await new Promise(r => setTimeout(r, 800))
      setStatus('sent')
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <section id="book" className="relative bg-[#0b0b15] py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),transparent_60%)]" />
      <div className="relative z-10 container mx-auto px-6">
        <div className="mb-10 max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Book a Session</h2>
          <p className="mt-3 text-violet-100/80">Choose your offering and share any intentions. You’ll receive a confirmation by email.</p>
        </div>

        <form onSubmit={submit} className="grid gap-4 max-w-2xl">
          <div>
            <label className="block text-sm text-violet-200 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-violet-200/50 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm text-violet-200 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-violet-200/50 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-sm text-violet-200 mb-1">Service</label>
            <select name="service" value={form.service} onChange={handleChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option>Tarot Reading</option>
              <option>Angel Card Pull</option>
              <option>Oracle Card Reading</option>
              <option>Spiritual Awakening</option>
              <option>Chakra Cleansing</option>
              <option>Potions & Spells</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-violet-200 mb-1">Notes or Intentions</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-violet-200/50 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="What would you like to focus on?" />
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={status==='sending'} className="inline-flex items-center rounded-xl bg-violet-500/90 hover:bg-violet-500 text-white px-6 py-3 text-sm font-medium transition disabled:opacity-50">
              {status==='sending' ? 'Sending…' : 'Request Booking'}
            </button>
            {status==='sent' && <span className="text-sm text-emerald-300">Request sent! Check your email.</span>}
            {status==='error' && <span className="text-sm text-rose-300">Something went wrong. Try again.</span>}
          </div>
        </form>
      </div>
    </section>
  )
}
