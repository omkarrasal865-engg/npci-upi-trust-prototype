import React, { useEffect, useState } from 'react'
import '../styles/hero.css'

export default function Hero({ onStart }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setFlipped((f) => !f), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">NPCI · Challenge 4 · Agentic AI Product Manager</p>
          <h1 className="hero-title">
            "Accept ₹1" <br />should never <br />mean <em>−₹15,000.</em>
          </h1>
          <p className="hero-sub">
            A trust-scoring layer for UPI collect requests — built to cut social-engineering
            fraud without slowing down the 95% of people paying normally. Four parts, one
            working prototype: exploit audit, live risk scorer, risk API contract, and the
            in-app screen that fixes the actual moment of failure.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onStart}>Walk through the build</button>
            <span className="hero-byline">Omkar Rasal — submitted for the UPI Trust challenge</span>
          </div>
        </div>

        <div className="hero-demo">
          <div className={`demo-card ${flipped ? 'demo-card--credit' : 'demo-card--debit'}`}>
            <div className="demo-card-top">
              <span className="demo-label">{flipped ? 'Money in' : 'Money out'}</span>
              <span className={`demo-pill ${flipped ? 'pill-credit' : 'pill-debit'}`}>
                {flipped ? 'CREDIT' : 'DEBIT'}
              </span>
            </div>
            <div className="demo-amount">
              <span className="demo-arrow">{flipped ? '↓' : '↑'}</span>
              ₹{flipped ? '1' : '15,000'}
            </div>
            <p className="demo-caption">
              {flipped
                ? 'This is what the user expects when they tap Accept.'
                : 'This is what actually happens — same button, opposite direction.'}
            </p>
          </div>
          <p className="demo-footnote">Same "Accept" button. Same collect request. The screen doesn't change — that's the exploit.</p>
        </div>
      </div>
    </header>
  )
}
