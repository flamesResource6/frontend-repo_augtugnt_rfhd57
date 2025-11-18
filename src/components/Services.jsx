import React from 'react'
import { Sparkles, Wand2, BookOpen, Eye, Droplets, Gem, Shirt } from 'lucide-react'

const services = [
  {
    icon: <Eye className="w-6 h-6 text-violet-300" />,
    title: 'Tarot Readings',
    subtitle: 'Insightful & intuitive guidance',
    description: 'Receive clear messages and grounded next steps through compassionate, no-fluff tarot spreads tailored to your path.'
  },
  {
    icon: <Sparkles className="w-6 h-6 text-violet-300" />,
    title: 'Angel Card Pulls',
    subtitle: 'Messages of hope & clarity',
    description: 'Gentle, affirming messages from your guides to soothe the heart and illuminate what matters most.'
  },
  {
    icon: <BookOpen className="w-6 h-6 text-violet-300" />,
    title: 'Oracle Card Reading',
    subtitle: 'Deep insights & guidance',
    description: 'Explore archetypes and soul themes with layered oracle spreads for deeper reflection and remembrance.'
  },
  {
    icon: <Wand2 className="w-6 h-6 text-violet-300" />,
    title: 'Spiritual Awakening',
    subtitle: 'Tools & guidance for your journey',
    description: 'Practical rituals, shadow integration, and energy hygiene to support awakening with grace.'
  },
  {
    icon: <Droplets className="w-6 h-6 text-violet-300" />,
    title: 'Chakra Cleansing',
    subtitle: 'Energy balancing & rejuvenation',
    description: 'Release stagnation and re-align your centers with soothing energetic resets and sound-clearing.'
  },
  {
    icon: <Wand2 className="w-6 h-6 text-violet-300" />,
    title: 'Potions & Spells',
    subtitle: 'Custom blends & enchanted bath bombs',
    description: 'Handcrafted oils, soaks, and spell kits charged with intention to amplify your workings.'
  },
]

const shop = [
  {
    icon: <Gem className="w-6 h-6 text-violet-300" />,
    title: 'Jewelry',
    subtitle: 'Mystical pieces',
    description: 'Crystal pendants, talismans, and protective charms to carry your power.'
  },
  {
    icon: <Shirt className="w-6 h-6 text-violet-300" />,
    title: 'Clothing',
    subtitle: 'Stylish & ritual-ready',
    description: 'Flowing layers and shadowy staples to adorn your path.'
  }
]

function Card({ icon, title, subtitle, description }) {
  return (
    <div className="group relative rounded-2xl border border-violet-300/10 bg-gradient-to-b from-white/5 to-white/0 p-6 backdrop-blur-sm transition hover:border-violet-300/20">
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_60%)]" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 border border-white/10">
          {icon}
        </div>
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <p className="text-violet-200/80 text-sm">{subtitle}</p>
        <p className="mt-3 text-violet-100/70 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function Services() {
  return (
    <section id="services" className="relative py-20 bg-[#0b0b15]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_60%)]" />
      <div className="relative z-10 container mx-auto px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Offerings</h2>
          <p className="mt-3 text-violet-100/80">Choose the doorway that calls to you. Each session is grounded, compassionate, and focused on real support.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <Card key={i} {...s} />
          ))}
        </div>

        <div id="shop" className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <h3 className="text-2xl font-bold text-white">Mystic Shop</h3>
            <a href="#contact" className="text-violet-300 hover:text-white text-sm">Custom requests →</a>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {shop.map((s, i) => (
              <Card key={i} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
