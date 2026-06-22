import React, { useState } from 'react'
import '../styles/trustscreen.css'

// ----------------------------------------------------------------
// Scenario data — same flow structure, improved language + signals
// ----------------------------------------------------------------
const SCENARIOS = {
  LOW: {
    bandLabel: 'Trusted flow',
    requester: 'Swiggy Instamart',
    requesterHandle: 'swiggy@okaxis',
    label_text: 'Refund',
    displayed: 1,
    actual: 1,
    mismatch: false,
    cooldown: 0,
    verified: true,
    merchantType: 'Registered business',
    whyShowing: null,
    whyNetwork: null,
    merchant: {
      name: 'Swiggy Instamart',
      handle: 'swiggy@okaxis',
      signals: [
        { ok: true,  text: 'Registered business entity' },
        { ok: true,  text: 'VPA active for 4+ years' },
        { ok: true,  text: 'Verified by Axis Bank PSP' },
      ],
      relationship: { ok: true, text: 'You have 12 previous transactions' },
      identityLabel: 'Identity Verified',
      relationshipLabel: 'Relationship Established',
    },
  },
  MEDIUM: {
    bandLabel: 'Review before paying',
    requester: 'Cashback Store',
    requesterHandle: 'unknown.merchant@oksbi',
    label_text: 'Cashback',
    displayed: 1,
    actual: 499,
    mismatch: true,
    cooldown: 0,
    verified: false,
    merchantType: 'Unregistered VPA',
    whyShowing: "The amount shown (\u20b91) is different from the amount this request will actually debit (\u20b9499). This sometimes happens in genuine refunds, but it's worth confirming.",
    whyNetwork: null,
    merchant: {
      name: 'Cashback Store',
      handle: 'unknown.merchant@oksbi',
      signals: [
        { ok: false, text: 'Not a registered business entity' },
        { ok: true,  text: 'VPA active for 8 months' },
        { ok: false, text: 'Not verified by PSP' },
      ],
      relationship: { ok: false, text: 'No previous transactions with you' },
      identityLabel: 'Identity Not Confirmed',
      relationshipLabel: 'Relationship Not Established',
    },
  },
  HIGH: {
    bandLabel: 'Needs your attention',
    requester: 'Prize Claim',
    requesterHandle: 'prize.claim@okaxis',
    label_text: 'Cashback',
    displayed: 1,
    actual: 15000,
    mismatch: true,
    cooldown: 8,
    verified: false,
    merchantType: 'Unverified sender',
    whyShowing: "The amount shown (\u20b91) doesn't match what will actually leave your account (\u20b915,000). This sender isn't in your contacts and has no transaction history with you.",
    whyNetwork: "Similar requests from this sender have been flagged by other users on the UPI network.",
    merchant: {
      name: 'Prize Claim',
      handle: 'prize.claim@okaxis',
      signals: [
        { ok: false, text: 'Not a registered business entity' },
        { ok: false, text: 'VPA registered 3 days ago' },
        { ok: false, text: 'Not verified by any PSP' },
      ],
      relationship: { ok: false, text: 'No previous transactions with you' },
      identityLabel: 'Identity Not Verified',
      relationshipLabel: 'Relationship Not Established',
    },
  },
}

export default function TrustScreen() {
  const [band, setBand] = useState('HIGH')
  const [stage, setStage] = useState('request')
  const [count, setCount] = useState(SCENARIOS.HIGH.cooldown)
  const [showWhy, setShowWhy] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const scenario = SCENARIOS[band]

  const startFlow = () => {
    if (band === 'LOW') {
      setStage('done')
      return
    }
    setStage('clarify')
    setShowWhy(false)
  }

  const proceedToCooldown = () => {
    if (band === 'HIGH') {
      setStage('cooldown')
      let c = scenario.cooldown
      setCount(c)
      const t = setInterval(() => {
        c -= 1
        setCount(c)
        if (c <= 0) {
          clearInterval(t)
          setStage('done')
        }
      }, 1000)
    } else {
      setStage('done')
    }
  }

  const reset = (b) => {
    setBand(b)
    setStage('request')
    setCount(SCENARIOS[b].cooldown)
    setShowWhy(false)
    setShowModal(false)
  }

  return (
    <section id="screen">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Part 4 — AI-Built In-App Explainer</p>
          <h2>The screen that fixes the actual moment</h2>
          <p>
            Not a banner above the same Accept button — those get tuned out. The fix makes
            money direction the dominant visual element, surfaces the actual amount, and gives
            users a "Verify Merchant" path before they commit.
          </p>
        </div>

        <div className="screen-demo-grid">
          <div className="band-picker">
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <button
                key={key}
                className={`band-btn band-btn--${key.toLowerCase()} ${band === key ? 'band-btn--active' : ''}`}
                onClick={() => reset(key)}
              >
                <span className="band-btn-label">{s.bandLabel}</span>
                <span className="band-btn-key">{key}</span>
              </button>
            ))}
            <div className="band-picker-note">
              <p><strong>In scope:</strong> direction made dominant, amount mismatch surfaced, verify merchant flow, explainability, cooldown for HIGH only.</p>
              <p><strong>Out of scope (30-day MVP):</strong> blocking outright, changing the collect-request protocol.</p>
            </div>
          </div>

          <div className="phone-stage">
            <div className="phone">
              {/* Dynamic Island style notch */}
              <div className="phone-island" />
              <div className="phone-screen">
                {stage === 'request' && (
                  <RequestScreen scenario={scenario} band={band} onAccept={startFlow} />
                )}
                {stage === 'clarify' && (
                  <ClarifyScreen
                    scenario={scenario}
                    band={band}
                    showWhy={showWhy}
                    onToggleWhy={() => setShowWhy(w => !w)}
                    onProceed={proceedToCooldown}
                    onCancel={() => setStage('request')}
                    onVerify={() => setShowModal(true)}
                  />
                )}
                {showModal && (
                  <MerchantModal
                    merchant={scenario.merchant}
                    onClose={() => setShowModal(false)}
                  />
                )}
                {stage === 'cooldown' && (
                  <CooldownScreen count={count} scenario={scenario} />
                )}
                {stage === 'done' && (
                  <DoneScreen scenario={scenario} band={band} onReplay={() => reset(band)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------
// Screen 1 — Request screen
// Direction pill is the very first thing on screen, above the amount.
// Green = money coming in. Red = money going out.
// The amount label pill is neutral now — no false green credit signal.
// ----------------------------------------------------------------
function RequestScreen({ scenario, band, onAccept }) {
  const isOut = true // collecting always debits the user
  return (
    <div className="ps ps--request">
      {/* App bar */}
      <div className="ps-appbar">
        <span className="ps-appbar-back">‹</span>
        <span className="ps-appbar-title">Payment Request</span>
        <span className="ps-appbar-spacer" />
      </div>

      {/* Merchant identity */}
      <div className="ps-merchant">
        <div className="ps-merchant-avatar">
          {scenario.requester[0]}
        </div>
        <div className="ps-merchant-info">
          <p className="ps-merchant-name">{scenario.requester}</p>
          <p className="ps-merchant-handle">{scenario.requesterHandle}</p>
        </div>
        {scenario.verified && (
          <span className="ps-verified-badge">✓ Verified</span>
        )}
      </div>

      {/* Direction pill — dominant, above the amount */}
      <div className="ps-direction-pill ps-direction-pill--out">
        <span className="ps-direction-pill-arrow">↑</span>
        <span>Money going out</span>
      </div>

      {/* Amount — the dominant number */}
      <div className="ps-amount-block">
        <span className="ps-amount-label-neutral">{scenario.label_text}</span>
        <span className="ps-amount-big">₹{scenario.displayed.toLocaleString('en-IN')}</span>
      </div>

      {/* Mismatch warning inline on the request screen for MEDIUM/HIGH */}
      {scenario.mismatch && (
        <div className="ps-mismatch-notice">
          <span className="ps-mismatch-icon">⚠</span>
          <span>Actual debit: <strong>₹{scenario.actual.toLocaleString('en-IN')}</strong></span>
        </div>
      )}

      <div className="ps-action-group">
        <button className="ps-accept" onClick={onAccept}>
          {band === 'LOW' ? 'Pay ₹' + scenario.displayed : 'Review & Pay'}
        </button>
        <button className="ps-decline">Decline</button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------
// Screen 2 — Clarify / trust review screen
// Trust-oriented language. Verify merchant CTA. Why am I seeing this?
// HIGH and MEDIUM differ only in urgency framing, not in alarm level.
// ----------------------------------------------------------------
function ClarifyScreen({ scenario, band, showWhy, onToggleWhy, onProceed, onCancel, onVerify }) {
  const isHigh = band === 'HIGH'

  return (
    <div className={`ps ps--clarify ${isHigh ? 'ps--clarify-high' : 'ps--clarify-medium'}`}>
      {/* App bar */}
      <div className="ps-appbar">
        <button className="ps-appbar-back" onClick={onCancel}>‹</button>
        <span className="ps-appbar-title">Review Payment</span>
        <span className="ps-appbar-spacer" />
      </div>

      {/* Trust badge — not a fraud warning */}
      <div className={`ps-trust-badge ${isHigh ? 'ps-trust-badge--review' : 'ps-trust-badge--check'}`}>
        <span>{isHigh ? '🔍 Please review' : '👀 Check before paying'}</span>
      </div>

      {/* Money direction — DOMINANT. This is the whole point. */}
      <div className="ps-direction-block">
        <div className="ps-direction-arrow-large">↑</div>
        <div className="ps-direction-label">
          <p className="ps-direction-heading">Leaving your account</p>
          <p className="ps-direction-to">→ {scenario.requester}</p>
        </div>
      </div>

      {/* Amount comparison */}
      <div className="ps-amount-compare">
        <div className="ps-amount-compare-row">
          <span className="ps-compare-label">Shown to you</span>
          <span className="ps-compare-value-small">₹{scenario.displayed.toLocaleString('en-IN')}</span>
        </div>
        <div className="ps-amount-compare-divider" />
        <div className="ps-amount-compare-row">
          <span className="ps-compare-label">Will actually debit</span>
          <span className="ps-compare-value-big">₹{scenario.actual.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Merchant trust signals */}
      <div className="ps-trust-signals">
        <div className="ps-trust-signal">
          <span className="ps-trust-signal-icon ps-trust-signal-icon--warn">!</span>
          <span>{scenario.merchantType} · Not in your contacts</span>
        </div>
      </div>

      {/* Verify merchant CTA */}
      <button className="ps-verify-btn" onClick={onVerify}>
        <span className="ps-verify-icon">🔍</span>
        Verify this merchant
      </button>

      {/* Why am I seeing this — explainability */}
      <button className="ps-why-btn" onClick={onToggleWhy}>
        {showWhy ? 'Hide details ↑' : 'Why am I seeing this? ↓'}
      </button>
      {showWhy && scenario.whyShowing && (
        <div className="ps-why-content">
          <div className="ps-why-bullets">
            <div className="ps-why-bullet">
              <span className="ps-why-dot ps-why-dot--local" />
              <span>{scenario.whyShowing}</span>
            </div>
            {scenario.whyNetwork && (
              <div className="ps-why-bullet--network">
                <div className="ps-why-network-row">
                  <span className="ps-why-dot ps-why-dot--network" />
                  <span className="ps-why-network-text">{scenario.whyNetwork}</span>
                </div>
                <span className="ps-why-network-tag">NPCI network signal</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="ps-action-group ps-action-group--clarify">
        <button className="ps-proceed-trust" onClick={onProceed}>
          {isHigh ? "I've verified this — proceed" : 'Yes, proceed with payment'}
        </button>
        <button className="ps-decline" onClick={onCancel}>Cancel payment</button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------
// Screen 3 — Cooldown (HIGH only)
// Framed as "a moment to confirm" not a punishment.
// Fixed: number no longer spins inside the ring.
// ----------------------------------------------------------------
function CooldownScreen({ count, scenario }) {
  return (
    <div className="ps ps--cooldown">
      <div className="ps-appbar">
        <span className="ps-appbar-back" />
        <span className="ps-appbar-title">Just a moment</span>
        <span className="ps-appbar-spacer" />
      </div>
      <div className="ps-cooldown-wrap">
        <div className="ps-cooldown-ring">
          <svg className="ps-cooldown-svg" viewBox="0 0 80 80">
            <circle className="ps-cooldown-track" cx="40" cy="40" r="34" />
            <circle
              className="ps-cooldown-progress"
              cx="40" cy="40" r="34"
              style={{ strokeDashoffset: 213.6 * (1 - count / 8) }}
            />
          </svg>
          <span className="ps-cooldown-num">{count}</span>
        </div>
        <p className="ps-cooldown-heading">Take a moment to confirm</p>
        <p className="ps-cooldown-text">
          ₹{scenario.actual.toLocaleString('en-IN')} will leave your account.<br />
          This brief pause helps you stay in control.
        </p>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------
// Screen 4 — Done
// ----------------------------------------------------------------
function DoneScreen({ scenario, band, onReplay }) {
  const isReviewed = band !== 'LOW'
  return (
    <div className="ps ps--done">
      <div className="ps-appbar">
        <span className="ps-appbar-back" />
        <span className="ps-appbar-title">{isReviewed ? 'Payment reviewed' : 'Ready to pay'}</span>
        <span className="ps-appbar-spacer" />
      </div>
      <div className="ps-done-body">
        <div className={`ps-done-icon ${isReviewed ? 'ps-done-icon--reviewed' : 'ps-done-icon--ok'}`}>
          {isReviewed ? '✓' : '✓'}
        </div>
        <p className="ps-done-title">
          {isReviewed ? 'Enter your PIN to complete' : 'Proceeding to PIN'}
        </p>
        <p className="ps-done-sub">
          {isReviewed
            ? `You've reviewed the payment to ${scenario.requester}. Enter your UPI PIN to confirm ₹${scenario.actual.toLocaleString('en-IN')}.`
            : `Trusted request from ${scenario.requester} — proceeding normally.`}
        </p>
        <button className="ps-replay" onClick={onReplay}>Replay this flow</button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------
// Merchant Verification Modal
// Renders as an overlay inside the phone screen.
// Shows: registered status, VPA age, PSP verification, relationship.
// Identity and relationship are summarised as two clear labels at
// the bottom — matches the design spec in Image 1.
// Does NOT show fraud scores or model confidence.
// ----------------------------------------------------------------
function MerchantModal({ merchant, onClose }) {
  const allOk = merchant.signals.every(s => s.ok)
  const identityOk = merchant.signals.filter(s => s.ok).length >= 2

  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal">
        {/* Header */}
        <div className="ps-modal-header">
          <span className="ps-modal-title">Merchant Verification</span>
          <button className="ps-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Merchant name */}
        <div className="ps-modal-merchant">
          <div className="ps-modal-avatar">{merchant.name[0]}</div>
          <div>
            <p className="ps-modal-name">{merchant.name}</p>
            <p className="ps-modal-handle">{merchant.handle}</p>
          </div>
        </div>

        {/* Verification signals */}
        <div className="ps-modal-signals">
          {merchant.signals.map((sig, i) => (
            <div key={i} className="ps-modal-signal-row">
              <span className={`ps-modal-signal-dot ${sig.ok ? 'ps-modal-dot--ok' : 'ps-modal-dot--warn'}`}>
                {sig.ok ? '✓' : '!'}
              </span>
              <span className="ps-modal-signal-text">{sig.text}</span>
            </div>
          ))}
        </div>

        {/* Relationship */}
        <div className={`ps-modal-relationship ${merchant.relationship.ok ? 'ps-modal-rel--ok' : 'ps-modal-rel--warn'}`}>
          <span className="ps-modal-rel-icon">{merchant.relationship.ok ? '↔' : '⚠'}</span>
          <span>{merchant.relationship.text}</span>
        </div>

        {/* Summary verdict — two labels, clear */}
        <div className="ps-modal-verdict">
          <span className={`ps-modal-verdict-pill ${identityOk ? 'ps-verdict--ok' : 'ps-verdict--warn'}`}>
            {merchant.identityLabel}
          </span>
          <span className={`ps-modal-verdict-pill ${merchant.relationship.ok ? 'ps-verdict--ok' : 'ps-verdict--warn'}`}>
            {merchant.relationshipLabel}
          </span>
        </div>

        <button className="ps-modal-dismiss" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}
