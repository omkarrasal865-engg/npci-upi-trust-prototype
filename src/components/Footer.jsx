import React from 'react'
import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-strategy">
          <p className="eyebrow">Strategic framing</p>
          <h3>This scoring layer is a bridge, not the destination</h3>
          <p>
            The structurally cleanest fix — a protocol-level, non-overridable DEBIT/CREDIT label
            every PSP must render — is the right long-run answer, the same way withdrawing P2P
            collect was. It just can't ship across 700+ banks' UI integration timelines in 30 days.
            This trust-scoring layer is the fast, NPCI-side bridge that protects users now while
            that slower protocol change moves through governance.
          </p>
        </div>

        <div className="footer-meta">
          <div className="footer-meta-col">
            <p className="footer-meta-label">Submission</p>
            <p className="footer-meta-value">Omkar Rasal</p>
            <p className="footer-meta-value">Agentic AI Product Manager — NPCI</p>
          </div>
          <div className="footer-meta-col">
            <p className="footer-meta-label">Challenge</p>
            <p className="footer-meta-value">4 — UPI Trust</p>
            <p className="footer-meta-value">Fraud prevention without friction</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
