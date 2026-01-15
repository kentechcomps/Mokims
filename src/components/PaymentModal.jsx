import { useState } from 'react'
import '../styles/BundleCard.css'

export default function PaymentModal({ bundle, onClose }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('input') // 'input' | 'waiting' | 'success' | 'failed'

  if (!bundle) return null

  // ---------------------------
  // Normalize phone for Paystack (2547XXXXXXXX)
  // ---------------------------
  const normalizePhone = (phone) => {
    const p = phone.replace(/\D/g, '') // remove spaces, +, etc.
    if (p.startsWith('07') && p.length === 10) return '254' + p.slice(1)
    if (p.startsWith('2547') && p.length === 12) return p
    throw new Error('Invalid phone number format. Use 07XXXXXXXX or 2547XXXXXXXX')
  }

  // ---------------------------
  // Poll order status from backend
  // ---------------------------
  const pollOrderStatus = (reference) => {
    setStatus('waiting')
    setLoading(true)
    setError(null)

    let attempts = 0
    const maxAttempts = 80 // ~4 minutes
    const interval = setInterval(async () => {
      attempts += 1
      try {
        const r = await fetch(`/orders/${encodeURIComponent(reference)}`)
        if (r.ok) {
          const j = await r.json()
          if (j.status === 'success') {
            clearInterval(interval)
            setLoading(false)
            setStatus('success')
            return
          }
          if (j.status === 'failed') {
            clearInterval(interval)
            setLoading(false)
            setStatus('failed')
            setError('Payment failed. Please try again.')
            return
          }
        }
      } catch {
        // ignore transient errors
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setLoading(false)
        setStatus('failed')
        setError('Payment not confirmed yet. Check your phone or try again.')
      }
    }, 3000)
  }

  // ---------------------------
  // Submit payment
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!phone) return setError('Please enter your phone number')

    let normalizedPhone
    try {
      normalizedPhone = normalizePhone(phone)
    } catch (err) {
      return setError(err.message)
    }

    setLoading(true)
    const reference = `starlink_${bundle.id}_${Date.now()}`
    try {
      const resp = await fetch('http://127.0.0.1:5000/paystack/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          amount: bundle.price,
          reference,
          email: 'mutukukennedy34@gmail.com' // required by Paystack
        })
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.message || 'Payment initiation failed')

      // STK push sent — start polling
      pollOrderStatus(reference)
    } catch (err) {
      setError(err.message || 'Payment initiation failed')
      setLoading(false)
    }
  }

  // Fee calculation
  const fee = Math.ceil(bundle.price * 0.015)
  const total = bundle.price + fee

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        <h3>Buy {bundle.duration} - {bundle.data}</h3>
        <p className="bundle-description">{bundle.description}</p>

        <div className="price">
          <span className="currency">{bundle.currency}</span>
          <span className="amount">{total}</span>
        </div>

        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          Includes M-Pesa processing fee (KES {fee})
        </p>

        {status === 'input' && (
          <form onSubmit={handleSubmit} className="payment-form">
            <label style={{ display: 'block', marginBottom: 8 }}>
              M-Pesa Phone Number
            </label>

            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="07xxxxxxxx or 2547xxxxxxxx"
              required
              style={{
                padding: '0.5rem',
                width: '100%',
                borderRadius: 6,
                border: '1px solid #ccc'
              }}
            />

            {error && <p style={{ color: 'salmon', marginTop: 8 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className="buy-btn" disabled={loading}>
                {loading ? 'Sending...' : `Pay Ksh ${total}`}
              </button>

              <button
                type="button"
                className="quick-btn"
                onClick={onClose}
                style={{ background: '#fff', color: '#0f1419' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {status === 'waiting' && <p>📱 Check your phone for the M-Pesa prompt…</p>}
        {status === 'success' && <p>✅ Payment Successful!</p>}
        {status === 'failed' && <p>❌ Payment Failed: {error}</p>}
      </div>
    </div>
  )
}
