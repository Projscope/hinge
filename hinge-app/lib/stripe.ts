import Stripe from 'stripe'

let _stripe: Stripe | null = null

export default function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY environment variable')
    _stripe = new Stripe(key, { apiVersion: '2025-03-31.basil' })
  }
  return _stripe
}
