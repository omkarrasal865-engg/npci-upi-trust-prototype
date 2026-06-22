import React, { useEffect, useState } from 'react'
import Hero from './components/Hero.jsx'
import ExploitAudit from './components/ExploitAudit.jsx'
import RiskScorer from './components/RiskScorer.jsx'
import ApiExplorer from './components/ApiExplorer.jsx'
import TrustScreen from './components/TrustScreen.jsx'
import Footer from './components/Footer.jsx'
import './styles/app.css'

const SECTIONS = [
  { id: 'audit', label: '1. Exploit Audit', num: '01' },
  { id: 'scorer', label: '2. Live Risk Scorer', num: '02' },
  { id: 'api', label: '3. Risk API', num: '03' },
  { id: 'screen', label: '4. In-App Screen', num: '04' },
]

export default function App() {
  const [active, setActive] = useState('audit')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app">
      <nav className="topnav">
        <div className="container topnav-inner">
          <div className="brand">
            <span className="brand-mark">₹</span>
            <span className="brand-text">UPI Trust</span>
          </div>
          <div className="navlinks">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                className={`navlink ${active === s.id ? 'navlink-active' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                <span className="navlink-num">{s.num}</span>
                {s.label.replace(/^\d\.\s/, '')}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <Hero onStart={() => scrollTo('audit')} />

      <main>
        <ExploitAudit />
        <RiskScorer />
        <ApiExplorer />
        <TrustScreen />
      </main>

      <Footer />
    </div>
  )
}
