import { API_URL } from '../config.js';
import emailjs from '@emailjs/browser';
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'
import { CreditCard, Truck, AlertCircle, Tag, X, CheckCircle, ChevronDown, Gift } from 'lucide-react'
import qrImage from '../assets/qr code.jpeg'

function CheckoutPage() {
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()

  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [showCoupons, setShowCoupons] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState([])

  // UPI State
  const [utr, setUtr] = useState('')

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  })

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const stored = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
      setCart(stored)
    }
  }, [isSignedIn, user])

  useEffect(() => {
    // Fetch available coupons
    fetch(`${API_URL}/api/coupons`)
      .then(res => res.json())
      .then(data => setAvailableCoupons(data))
      .catch(err => console.error('Failed to load coupons', err))
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = subtotal >= 499 ? 0 : 49
  const total = Math.max(0, subtotal + delivery - couponDiscount)

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    if (!codeToApply.trim()) return
    
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToApply, cartTotal: subtotal })
      })
      const result = await res.json()

      if (result.valid) {
        setAppliedCoupon({ code: codeToApply.toUpperCase(), discountType: result.discountType, discountValue: result.discountValue })
        setCouponDiscount(result.discount)
        setCouponCode(codeToApply.toUpperCase())
        setCouponError('')
        setShowCoupons(false)
        toast.success(`Coupon applied! Saved ₹${result.discount}`, { icon: '🏷️' })
      } else {
        setCouponError(result.error || 'Invalid coupon')
        setAppliedCoupon(null)
        setCouponDiscount(0)
      }
    } catch (error) {
      setCouponError('Error validating coupon')
      setAppliedCoupon(null)
      setCouponDiscount(0)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponCode('')
    setCouponError('')
    toast('Coupon removed', { icon: '❌' })
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    if (!isSignedIn) {
      openSignIn()
      return
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty!')
      return
    }

    if (!formData.name || !formData.address || !formData.city || !formData.phone) {
      toast.error('Please fill in all shipping details from the form.')
      return
    }

    if (paymentMethod === 'upi' && (!utr || utr.trim().length < 6)) {
      toast.error('Please enter a valid Transaction/UTR reference number to confirm your UPI payment.')
      return
    }

    toast.loading('Placing order securely...', { id: 'orderToast' });
    try {
      // 1. Save Order to Neon Database
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId: user.id,
          items: cart,
          totalAmount: total,
          paymentMethod: paymentMethod,
          utrNumber: utr.trim(),
          shipping: formData
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Database connection error');

      const newOrder = data.order;

      // Same compact ID format as OrdersPage: last 6 chars uppercase
      const compactId = newOrder.id.slice(-6).toUpperCase();

      // 2. Build admin email content 
      const adminEmailBody = `
Order ID: #${compactId}
Date: ${new Date(newOrder.createdAt).toLocaleDateString()}

Customer Details:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Address: ${formData.address}, ${formData.city}, ${formData.zip}
Payment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI (Manual Verification)'}
${paymentMethod === 'upi' ? `\n🔥 UPI TRANSACTION / UTR NUMBER: ${utr.trim()} 🔥\n(Please check your bank app to verify this payment!)\n` : ''}
Items Ordered:
${cart.map(item => `- ${item.qty}x ${item.name} (₹${item.price}) -> ₹${item.price * item.qty}`).join('\n')}

Subtotal: ₹${subtotal}
Delivery: ₹${delivery}
Grand Total: ₹${total}
`;

      // 3. Send email to Admin
      await fetch('https://api.web3forms.com/submit', {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: "548886d7-0d2a-44b7-9920-1c6eb13b1244",
          subject: `New DB Order #${compactId} from ${formData.name}`,
          from_name: "NehaShop Orders",
          name: formData.name,
          email: formData.email,
          message: adminEmailBody
        })
      });

      // 4. Send confirmation email to Customer via EmailJS (sends to actual customer email)
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_name: formData.name,
          to_email: formData.email,
          order_id: compactId,
          order_date: new Date(newOrder.createdAt).toLocaleDateString(),
          order_items: cart.map(item => `${item.qty}x ${item.name} — ₹${item.price * item.qty}`).join('\n'),
          subtotal: `₹${subtotal}`,
          delivery: delivery === 0 ? 'FREE' : `₹${delivery}`,
          coupon_discount: couponDiscount > 0 ? `-₹${couponDiscount}` : 'None',
          grand_total: `₹${total}`,
          payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI (Pending Verification)' : 'Credit/Debit Card',
          shipping_address: `${formData.address}, ${formData.city} - ${formData.zip}`,
          shipping_phone: `+91 ${formData.phone}`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success(paymentMethod === 'upi' ? '⏳ Order securely placed! Pending UPI Verification.' : '🎉 Order placed! Confirmation email sent!', {
        id: 'orderToast',
        style: { borderRadius: '10px', background: '#1E3A5F', color: '#fff' },
        duration: 5000
      });

      // Clear Cart in localStorage
      const cartKey = `cart_${user.id}`
      localStorage.setItem(cartKey, JSON.stringify([]))
      window.dispatchEvent(new Event('cartUpdated'))

      navigate('/orders')
    } catch (error) {
      toast.error('Checkout failed! ' + error.message, { id: 'orderToast' });
      console.error(error);
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle size={64} className="text-[#F97316]" />
        <h2 className="text-2xl font-black text-[#1E3A5F]">Sign in to checkout</h2>
        <button
          onClick={() => openSignIn()}
          className="bg-[#F97316] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
        >
          Login / Sign Up
        </button>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-2xl font-black text-[#1E3A5F]">Your cart is empty!</h2>
        <Link to="/" className="text-[#F97316] font-bold hover:underline">Go shopping</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-[#1E3A5F] mb-8">Secure Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Form Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Shipping Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-[#1E3A5F]">
                <Truck className="text-[#F97316]" size={24} /> Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-[#F97316]" placeholder="John Doe" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:border-[#F97316] transition-colors">
                    <span className="bg-gray-100 px-3 flex items-center text-gray-700 font-bold text-sm border-r border-gray-300 select-none">
                      🇮🇳 +91
                    </span>
                    <input
                      required
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setFormData(prev => ({ ...prev, phone: val }))
                      }}
                      pattern="[6-9]{1}[0-9]{9}"
                      title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9"
                      placeholder="98765 43210"
                      className="flex-1 px-3 py-3 text-gray-800 text-sm outline-none bg-white font-medium tracking-wider"
                    />
                    {formData.phone.length === 10 && (
                      <span className="pr-3 flex items-center text-green-500">✓</span>
                    )}
                  </div>
                  {formData.phone.length > 0 && formData.phone.length < 10 && (
                    <p className="text-xs text-orange-500 font-medium">{10 - formData.phone.length} more digit{10 - formData.phone.length !== 1 ? 's' : ''} needed</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Full Address</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-[#F97316]" placeholder="123 Main Street, Apt 4" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">City</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-[#F97316]" placeholder="New York" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">ZIP Code</label>
                  <input required name="zip" value={formData.zip} onChange={handleInputChange} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-[#F97316]" placeholder="10001" />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-[#1E3A5F]">
                <CreditCard className="text-[#F97316]" size={24} /> Payment Method
              </h2>
              <div className="flex flex-col gap-3">
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-colors ${paymentMethod === 'cod' ? 'border-[#F97316] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-5 h-5 accent-[#F97316]"
                  />
                  <div>
                    <span className="block font-bold text-[#1E3A5F]">Cash on Delivery</span>
                    <span className="text-sm text-gray-500">Pay when your order arrives</span>
                  </div>
                </label>
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-colors ${paymentMethod === 'card' ? 'border-[#F97316] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-5 h-5 accent-[#F97316]"
                  />
                  <div>
                    <span className="block font-bold text-[#1E3A5F]">Credit/Debit Card</span>
                    <span className="text-sm text-gray-500">Securely processed (Mocked)</span>
                  </div>
                </label>

                {/* UPI Manual Payment Option */}
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-colors ${paymentMethod === 'upi' ? 'border-[#F97316] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="w-5 h-5 accent-[#F97316]"
                  />
                  <div>
                    <span className="block font-bold text-[#1E3A5F]">UPI (PhonePe, GPay, Paytm)</span>
                    <span className="text-sm text-gray-500">Manual verification via QR Code</span>
                  </div>
                </label>

                {/* UPI Details Panel */}
                {paymentMethod === 'upi' && (
                  <div className="mt-2 bg-gradient-to-br from-orange-50/80 to-orange-100/50 border border-orange-200 rounded-2xl p-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                    <p className="text-[#1E3A5F] text-lg font-black mb-1">Scan & Pay Exact Amount:</p>
                    <p className="text-[#F97316] text-3xl font-black mb-5">₹{total}</p>

                    <div className="w-full max-w-[300px] mx-auto mb-6 hover:scale-105 transition-transform duration-300 rounded-3xl overflow-hidden shadow-md border border-gray-100">
                      <img
                        src={qrImage}
                        alt="Your Exact QR Code"
                        className="w-full h-auto object-contain"
                      />
                    </div>

                    <p className="text-sm font-bold text-gray-600 mb-2">Or pay to UPI ID:</p>
                    <div className="bg-white border text-[#1E3A5F] font-black border-orange-200 rounded-xl px-5 py-2.5 mb-6 select-all shadow-sm flex items-center gap-2 cursor-copy active:scale-95 transition-all" onClick={() => { navigator.clipboard.writeText('6205839760@ybl'); toast.success('UPI ID Copied!') }}>
                      6205839760@ybl <span className="text-gray-400 text-xs ml-2 font-normal">(Click to Copy)</span>
                    </div>

                    <div className="w-full text-left bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <label className="text-sm font-black text-[#1E3A5F] block mb-2">Step 2: Enter Transaction/UTR Number <span className="text-red-500">*</span></label>
                      <input
                        required={paymentMethod === 'upi'}
                        type="text"
                        value={utr}
                        onChange={(e) => setUtr(e.target.value.toUpperCase())}
                        placeholder="e.g. 312345678901"
                        className="w-full border-2 border-gray-200 focus:border-[#F97316] rounded-xl p-3 outline-none text-base font-bold placeholder-gray-400 tracking-widest text-[#1E3A5F] transition-colors bg-gray-50 focus:bg-white"
                      />
                      <p className="text-[11px] text-gray-500 mt-2.5 font-medium leading-relaxed">
                        After successful payment, please enter the <strong className="text-gray-700">12-digit UPI reference number (UTR)</strong> above so we can verify your order manually. Your order will be confirmed upon verification via email.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-black text-[#1E3A5F] mb-6">Order Summary</h2>
              <div className="flex flex-col gap-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                    <p className="font-black text-[#1E3A5F]">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex flex-col gap-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {delivery === 0 ? <span className="text-green-600 font-semibold">FREE</span> : <span className="font-semibold text-gray-800">₹{delivery}</span>}
                </div>

                {/* Coupon Input */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <div>
                          <p className="text-xs font-black text-green-700">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600">-₹{couponDiscount} saved!</p>
                        </div>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={couponCode}
                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                            placeholder="Enter coupon code"
                            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 focus:border-[#F97316] rounded-xl text-sm uppercase font-bold outline-none tracking-widest transition-colors"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="bg-[#1E3A5F] hover:bg-[#F97316] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex-shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}

                      {/* Browse Coupons toggle */}
                      <button
                        type="button"
                        onClick={() => setShowCoupons(p => !p)}
                        className="flex items-center gap-1.5 text-[#F97316] hover:text-orange-600 text-xs font-bold transition-colors mt-0.5 w-fit"
                      >
                        <Gift size={13} />
                        Browse Available Coupons
                        <ChevronDown size={13} className={`transition-transform duration-200 ${showCoupons ? 'rotate-180' : ''}`} />
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ${showCoupons ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col gap-2 pt-1">
                          {availableCoupons.filter(c => c.isActive).map(c => {
                            const isPercent = c.discountType === 'percentage'
                            return (
                              <div key={c.id} className="border border-dashed border-orange-200 rounded-xl p-3 bg-orange-50/50 flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-black text-[#1E3A5F] text-sm tracking-widest">{c.code}</span>
                                    <span className="text-[10px] bg-[#F97316] text-white px-2 py-0.5 rounded-full font-bold">
                                      {isPercent ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 leading-tight">Use code {c.code} for great savings.</p>
                                  {c.minOrderAmount > 0 && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">Min. order: ₹{c.minOrderAmount}</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleApplyCoupon(c.code)}
                                  className="text-xs border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white px-3 py-1.5 rounded-lg font-black transition-all flex-shrink-0"
                                >
                                  Apply
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="border-t mt-1 pt-3 flex justify-between text-lg font-black text-[#1E3A5F]">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-[#1E3A5F] hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                Place Order (₹{total})
                {couponDiscount > 0 && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold ml-1">COUPON ✓</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage