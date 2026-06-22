import React, { useState } from 'react'
import '../styles/api.css'

const SAMPLE_REQUEST = `{
  "request_id": "8f14e2-...-c441",
  "requester_vpa": "cashback@oksbi",
  "recipient_vpa": "priya.k@okhdfc",
  "amount": 15000.00,
  "displayed_label": "Cashback ₹1",
  "actual_amount": 15000.00,
  "device_signals": {
    "device_id_hash": "a91f...",
    "is_new_device_for_recipient": true,
    "accessibility_service_active": true,
    "app_switch_count_last_60s": 4
  },
  "recipient_context": {
    "account_tenure_days": 12,
    "avg_transaction_amount_90d": 420.00,
    "elderly_flagged": true
  },
  "timestamp": "2026-06-21T09:14:02Z"
}`

const SAMPLE_RESPONSE = `{
  "request_id": "8f14e2-...-c441",
  "risk_band": "HIGH",
  "risk_score": 0.91,
  "primary_signal": "AMOUNT_LABEL_MISMATCH",
  "required_ux_action": "HARD_CONFIRM_WITH_COOLDOWN",
  "cooldown_seconds": 8,
  "explanation_for_user": "This request says ₹1 but will
    actually debit ₹15,000 from your account."
}`

const TABS = [
  { id: 'request', label: 'Request', sub: 'PSP app → NPCI switch' },
  { id: 'response', label: 'Response', sub: 'NPCI switch → PSP app' },
]

export default function ApiExplorer() {
  const [tab, setTab] = useState('request')

  return (
    <section id="api">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Part 3 — Risk API Contract</p>
          <h2>One synchronous call, before the user sees Accept</h2>
          <p>
            <code className="mono">POST /v1/risk/collect-request-score</code> — called the moment
            a collect request is received, not after the user taps Accept. Target latency: under
            150ms, sized against existing UPI decisioning norms so it never becomes a visible delay.
          </p>
        </div>

        <div className="api-shell">
          <div className="api-shell-top">
            <div className="api-method">
              <span className="api-method-badge">POST</span>
              <span className="api-path mono">/v1/risk/collect-request-score</span>
            </div>
            <div className="api-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`api-tab ${tab === t.id ? 'api-tab--active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="api-body">
            <pre className="api-code mono">
              {tab === 'request' ? SAMPLE_REQUEST : SAMPLE_RESPONSE}
            </pre>
            <p className="api-flow-label">{TABS.find((t) => t.id === tab).sub}</p>
          </div>
        </div>

        <div className="api-callout">
          <h3>Why a ready-to-render string, not just a score</h3>
          <p>
            The response carries <code className="mono">explanation_for_user</code> as plain
            language, not just a number — so every PSP app shows the same NPCI-approved
            explanation regardless of how mature that PSP's own UX team is. Across 50+ UPI apps,
            this is the difference between one consistent warning and 50 different homegrown
            ones, some of which would inevitably get tuned out.
          </p>
        </div>
      </div>
    </section>
  )
}
