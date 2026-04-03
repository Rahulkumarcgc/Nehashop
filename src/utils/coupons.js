// ─────────────────────────────────────────────────────
// 🏷️  COUPON CODES — Centralized Config
// Later: Replace this with an API call →  GET /api/coupons
// ─────────────────────────────────────────────────────

export const COUPONS = [
  {
    code: 'NEHA16',
    type: 'percent',      // 'percent' | 'flat'
    value: 16,            // 16% off
    minOrder: 0,
    description: '16% off on any order',
    maxDiscount: 500,
  },
  {
    code: 'NEHA50',
    type: 'flat',      // 'percent' | 'flat'
    value: 50,            // 16% off
    minOrder: 0,
    description: 'flat rs 50 off',
    maxDiscount: 50,
  },
  {
    code: 'RAHA1618',
    type: 'flat',
    value: 1618,          // ₹1618 flat off
    minOrder: 2000,
    description: '₹1618 off on orders above ₹2000',
    maxDiscount: 1618,
  },
  {
    code: 'RA18',
    type: 'percent',
    value: 18,            // 18% off
    minOrder: 0,
    description: '18% off on any order',
    maxDiscount: 800,
  },
  {
    code: 'RAHA100',
    type: 'flat',
    value: 100,           // ₹100 off — newsletter welcome gift
    minOrder: 0,
    description: '₹100 off on any order — Newsletter exclusive!',
    maxDiscount: 100,
  },
  {
    code: 'NEHA4OCT',
    type: 'flat',
    value: 400,           // ₹400 flat off
    minOrder: 999,
    description: '₹400 off on orders above ₹999',
    maxDiscount: 400,
  },
]

/**
 * Validate and apply a coupon code.
 * @param {string} code - The coupon code entered by the user.
 * @param {number} subtotal - The cart subtotal.
 * @returns {{ valid: boolean, coupon?: object, discount?: number, message: string }}
 */
export function applyCoupon(code, subtotal) {
  const coupon = COUPONS.find(c => c.code === code.toUpperCase().trim())

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code. Please check and try again.' }
  }

  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `This coupon requires a minimum order of ₹${coupon.minOrder}.`
    }
  }

  let discount = coupon.type === 'percent'
    ? Math.round((subtotal * coupon.value) / 100)
    : coupon.value

  // Apply cap
  discount = Math.min(discount, coupon.maxDiscount)

  return {
    valid: true,
    coupon,
    discount,
    message: `✅ "${coupon.code}" applied! You saved ₹${discount}.`
  }
}

