import React, { useMemo, useState } from 'react'
import { computeRisk, defaultSignals, signalMeta } from '../data/scoring.js'
import '../styles/scorer.css'

const BAND_COPY = {
  LOW: { color: 'var(--credit)', bg: 'var(--credit-soft)', deep: 'var(--credit-deep)', desc: 'Standard accept flow — no change. This protects the 95%.' },
  MEDIUM: { color: 'var(--amber)', bg: 'var(--amber-soft)', deep: '#7A4D06', desc: 'Intent-clarifying screen shown before PIN entry. One extra screen, ~2–3 seconds.' },
  HIGH: { color: 'var(--debit)', bg: 'var(--debit-soft)', deep: 'var(--debit-deep)', desc: 'Hard interstitial — explicit re-confirmation of amount and direction, plus a short cooldown before PIN entry is accepted.' },
}

export default function RiskScorer() {
  const [signals, setSignals] = useState(defaultSignals)
  const result = useMemo(() => computeRisk(signals), [signals])
  const copy = BAND_COPY[result.band]

  const toggle = (key) => setSignals((s) => ({ ...s, [key]: !s[key] }))

  return (
    <section id="scorer">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Part 2 — Trust Scoring, Live</p>
          <h2>Toggle the signals. Watch the band move.</h2>
          <p>
            This mirrors the actual scoring logic NPCI's central switch would run synchronously
            — under a 150ms budget — before a PSP app ever renders the collect request. Branch
            on <code className="mono">risk_band</code>, never on the raw score.
          </p>
        </div>

        <div className="scorer-grid">
          <div className="signal-panel">
            <p className="panel-label">Request signals</p>
            {signalMeta.map((s) => (
              <button
                key={s.key}
                className={`signal-toggle ${signals[s.key] ? 'signal-toggle--on' : ''}`}
                onClick={() => toggle(s.key)}
              >
                <span className="signal-check">{signals[s.key] ? '✓' : ''}</span>
                <span className="signal-text">
                  <span className="signal-label">{s.label}</span>
                  <span className="signal-hint">{s.hint}</span>
                </span>
                <span className="signal-layer">{s.layer}</span>
              </button>
            ))}
          </div>

          <div className="result-panel">
            <div className="result-card" style={{ borderColor: copy.color }}>
              <div className="result-top">
                <span className="panel-label">Risk band</span>
                <span className="result-score mono">{result.score.toFixed(2)}</span>
              </div>
              <div className="result-band" style={{ color: copy.color }}>
                {result.band}
              </div>
              <p className="result-desc">{copy.desc}</p>

              <div className="result-divider" />

              <div className="result-row">
                <span className="result-row-label">required_ux_action</span>
                <span className="result-row-value mono">{result.action}</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">cooldown_seconds</span>
                <span className="result-row-value mono">{result.cooldown}</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">primary_signal</span>
                <span className="result-row-value mono">{result.primarySignal}</span>
              </div>

              {result.reasons.length > 0 && (
                <>
                  <div className="result-divider" />
                  <p className="panel-label" style={{ marginBottom: 10 }}>Contributing signals</p>
                  <div className="reason-bars">
                    {result.reasons.map((r) => (
                      <div key={r.code} className="reason-bar-row">
                        <span className="reason-bar-label">{r.label}</span>
                        <div className="reason-bar-track">
                          <div
                            className="reason-bar-fill"
                            style={{ width: `${r.weight * 100}%`, background: copy.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="calibration-note">
          <span className="calibration-note-tag">Design decision</span>
          <p>
            Notice <strong>"thin transaction history"</strong> alone only adds 0.06 — deliberately
            small. A model that scores "new to UPI" the same as "established user suddenly
            deviating" would systematically over-friction first-time and elderly users — the exact
            cohort this challenge asks NPCI to protect, not penalize.
          </p>
        </div>
      </div>
    </section>
  )
}
