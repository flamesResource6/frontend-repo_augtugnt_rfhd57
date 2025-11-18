import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Booking from './components/Booking'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-[#0b0b15] text-white">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Booking />
      </main>
      <Footer />
    </div>
  )
}

export default App
