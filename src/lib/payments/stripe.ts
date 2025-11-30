export const STRIPE_PK = import.meta.env.VITE_STRIPE_PK as string | undefined
export const isStripeConfigured = !!STRIPE_PK
