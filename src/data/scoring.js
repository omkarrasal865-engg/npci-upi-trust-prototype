// Mirrors the POST /v1/risk/collect-request-score contract from the case study.
// This is a deterministic, explainable scoring function — not a black box —
// because the product decision was "app branches on risk_band, not raw score."

export function computeRisk(signals) {
  let score = 0
  const reasons = []

  if (signals.amountLabelMismatch) {
    score += 0.42
    reasons.push({ code: 'AMOUNT_LABEL_MISMATCH', weight: 0.42, label: 'Displayed label does not match actual debit amount' })
  }
  if (signals.newDevice) {
    score += 0.14
    reasons.push({ code: 'NEW_DEVICE_NEW_PAYEE', weight: 0.14, label: 'New device, first interaction with this requester VPA' })
  }
  if (signals.fanout) {
    score += 0.27
    reasons.push({ code: 'FANOUT_PATTERN', weight: 0.27, label: 'Requester VPA sent collect requests to many distinct recipients in a short window' })
  }
  if (signals.screenShare) {
    score += 0.35
    reasons.push({ code: 'SCREEN_SHARE_ACTIVE', weight: 0.35, label: 'Accessibility / remote-access service active at moment of request' })
  }
  if (signals.elderlyFlagged) {
    score += 0.08
    reasons.push({ code: 'ELDERLY_FLAGGED_CONTEXT', weight: 0.08, label: 'Recipient account is age-flagged — lower anomaly threshold applies' })
  }
  if (signals.thinHistory) {
    // Thin-history nudges risk up only slightly on its own — this is the
    // deliberate calibration choice: a first-time user should NOT score
    // like a seasoned user deviating from established pattern.
    score += 0.06
    reasons.push({ code: 'THIN_HISTORY_CONTEXT', weight: 0.06, label: 'Recipient has limited transaction history (calibrated low — see Part 2 note)' })
  }

  score = Math.min(score, 0.99)

  let band = 'LOW'
  let action = 'STANDARD'
  let cooldown = 0
  if (score >= 0.65) {
    band = 'HIGH'
    action = 'HARD_CONFIRM_WITH_COOLDOWN'
    cooldown = 8
  } else if (score >= 0.25) {
    band = 'MEDIUM'
    action = 'INTENT_CLARIFY'
    cooldown = 0
  }

  const primarySignal = reasons.length
    ? reasons.reduce((a, b) => (b.weight > a.weight ? b : a)).code
    : 'NONE'

  return { score: Number(score.toFixed(2)), band, action, cooldown, reasons, primarySignal }
}

export const defaultSignals = {
  amountLabelMismatch: false,
  newDevice: false,
  fanout: false,
  screenShare: false,
  elderlyFlagged: false,
  thinHistory: false,
}

export const signalMeta = [
  { key: 'amountLabelMismatch', label: 'Amount/label mismatch', hint: '"Cashback ₹1" label, actual debit ₹15,000', layer: 'NPCI' },
  { key: 'newDevice', label: 'New device + new payee', hint: 'First time this device has paid this VPA', layer: 'App' },
  { key: 'fanout', label: 'Fan-out pattern', hint: 'Same requester VPA, many recipients, short window', layer: 'NPCI' },
  { key: 'screenShare', label: 'Screen-share active', hint: 'Remote-access accessibility service running now', layer: 'App' },
  { key: 'elderlyFlagged', label: 'Elderly-flagged account', hint: 'Self-disclosed or bank-flagged', layer: 'Bank CBS' },
  { key: 'thinHistory', label: 'Thin transaction history', hint: 'First-time / low-tenure UPI user', layer: 'Bank CBS' },
]
