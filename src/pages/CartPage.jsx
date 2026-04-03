import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'

function CartPage() {
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const [cart, setCart] = useState([])

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const stored = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
      setCart(stored)
    }
  }, [isSignedIn, user])

  const saveCart = (updatedCart) => {
    if (!user?.id) return
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart))
    setCart(updatedCart)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const increaseQty = (id) => {
    const updated = cart.map(item =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    )
    saveCart(updated)
  }

  const decreaseQty = (id) => {
    const updated = cart
      .map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item)
      .filter(item => item.qty > 0)
    saveCart(updated)
  }

  const removeItem = (id) => {
    const removed = cart.find(item => item.id === id)
    const updated = cart.filter(item => item.id !== id)
    saveCart(updated)

    toast((t) => (
      <span className="flex items-center gap-3">
        <span>Item removed from cart</span>
        <button
          onClick={() => {
            const current = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
            const restored = [...current, removed]
            localStorage.setItem(`cart_${user.id}`, JSON.stringify(restored))
            window.dispatchEvent(new Event('cartUpdated'))
            toast.dismiss(t.id)
          }}
          className="bg-[#F97316] text-white text-xs px-3 py-1 rounded-full font-bold hover:bg-orange-600 transition-colors flex-shrink-0"
        >
          Undo
        </button>
      </span>
    ), { icon: '🗑️', duration: 4000 })
  }

  const clearCart = () => {
    saveCart([])
    toast.success('Cart cleared!')
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = subtotal >= 499 ? 0 : 49
  const total = subtotal + delivery

  // Trust badges defined as a plain array to avoid emoji encoding issues in JSX strings
  const trustBadges = [
    'Secure Checkout',
    '7-Day Easy Returns',
    'Fast Delivery',
  ]

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag size={64} className="text-gray-300" />
        <h2 className="text-2xl font-black text-[#1E3A5F]">Please login to view your cart</h2>
        <p className="text-gray-500 text-sm">Your cart items are saved after login.</p>
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
        <ShoppingBag size={64} className="text-gray-300" />
        <h2 className="text-2xl font-black text-[#1E3A5F]">Your cart is empty!</h2>
        <p className="text-gray-500 text-sm">Add some products to get started.</p>
        <Link
          to="/"
          className="bg-[#F97316] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          Shop Now <ArrowRight size={18} />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-[#1E3A5F]">
            My Cart
            <span className="text-base font-normal text-gray-500 ml-2">({cart.length} items)</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center hover:shadow-md transition-shadow"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-xs bg-orange-100 text-[#F97316] px-2 py-0.5 rounded-full font-semibold">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-gray-800 mt-1 truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-black text-[#1E3A5F]">&#8377;{item.price}</span>
                    <span className="text-xs text-gray-400 line-through">&#8377;{item.oldPrice}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="text-gray-600 hover:text-[#F97316] transition-colors font-bold"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="text-gray-600 hover:text-[#F97316] transition-colors font-bold"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-black text-[#1E3A5F]">
                    &#8377;{item.price * item.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-black text-[#1E3A5F] mb-6">Order Summary</h2>

              <div className="flex flex-col gap-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span className="font-semibold text-gray-800">&#8377;{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  {delivery === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-800">&#8377;{delivery}</span>
                  )}
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-orange-500">
                    Add &#8377;{499 - subtotal} more for free delivery!
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between text-base font-black text-[#1E3A5F]">
                  <span>Total</span>
                  <span>&#8377;{total}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 flex w-full justify-center bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 rounded-full transition-colors items-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              {/* Fixed: added block + text-center for correct full-width Link rendering */}
              <Link
                to="/"
                className="mt-3 block text-center border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white font-bold py-3 rounded-full transition-colors text-sm"
              >
                Continue Shopping
              </Link>

              {/* Fixed: trust badges as plain JS array, no emoji encoding issues */}
              <div className="mt-6 flex flex-col gap-2">
                {trustBadges.map((b) => (
                  <span key={b} className="text-xs text-gray-500">{b}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CartPage