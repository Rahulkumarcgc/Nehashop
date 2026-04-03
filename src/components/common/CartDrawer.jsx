import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

function CartDrawer({ isOpen, onClose }) {
  const { user, isSignedIn } = useUser()
  const [cart, setCart] = useState([])

  useEffect(() => {
    const loadCart = () => {
      if (isSignedIn && user?.id) {
        const stored = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
        setCart(stored)
      } else {
        setCart([])
      }
    }
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [isSignedIn, user])

  const saveCart = (updated) => {
    if (!user?.id) return
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updated))
    setCart(updated)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const increaseQty = (id) => saveCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item))
  const decreaseQty = (id) => saveCart(cart.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item).filter(item => item.qty > 0))

  const removeItem = (id) => {
    const removed = cart.find(item => item.id === id)
    const updated = cart.filter(item => item.id !== id)
    saveCart(updated)

    // Undo Toast
    toast((t) => (
      <span className="flex items-center gap-3">
        <span>Item removed</span>
        <button
          onClick={() => {
            const current = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
            const restored = [...current, removed]
            localStorage.setItem(`cart_${user.id}`, JSON.stringify(restored))
            window.dispatchEvent(new Event('cartUpdated'))
            toast.dismiss(t.id)
          }}
          className="bg-[#F97316] text-white text-xs px-3 py-1 rounded-full font-bold hover:bg-orange-600 transition-colors"
        >
          Undo
        </button>
      </span>
    ), { icon: '🗑️', duration: 4000 })
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = subtotal >= 499 ? 0 : 49
  const total = subtotal + delivery

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[9999] shadow-2xl flex flex-col"
          >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
          <div className="flex items-center gap-3">
            <ShoppingCart size={22} />
            <h2 className="text-lg font-black">My Cart</h2>
            {cart.length > 0 && (
              <span className="bg-[#F97316] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {!isSignedIn ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
              <div className="bg-gray-100 p-5 rounded-full">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
              <h3 className="font-black text-[#1E3A5F] text-xl">Sign in to view cart</h3>
              <p className="text-gray-500 text-sm">Your cart items are saved after you login.</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
              <div className="bg-gray-100 p-5 rounded-full">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
              <h3 className="font-black text-[#1E3A5F] text-xl">Your cart is empty!</h3>
              <p className="text-gray-500 text-sm">Add some awesome products to get started.</p>
              <button
                onClick={onClose}
                className="bg-[#F97316] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-600 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow group">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-contain mix-blend-multiply rounded-xl bg-gray-50 flex-shrink-0 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] bg-orange-50 text-[#F97316] px-2 py-0.5 rounded-full font-bold">{item.category}</span>
                    <h4 className="font-bold text-gray-800 text-sm mt-1.5 line-clamp-2 leading-tight">{item.name}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-black text-[#1E3A5F]">₹{item.price * item.qty}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2.5 py-1">
                          <button onClick={() => decreaseQty(item.id)} className="text-gray-500 hover:text-[#F97316] transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-black w-4 text-center text-gray-800">{item.qty}</span>
                          <button onClick={() => increaseQty(item.id)} className="text-gray-500 hover:text-[#F97316] transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isSignedIn && cart.length > 0 && (
          <div className="border-t border-gray-100 bg-white p-5">
            <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                {delivery === 0
                  ? <span className="text-green-600 font-bold">FREE</span>
                  : <span className="font-semibold text-gray-800">₹{delivery}</span>
                }
              </div>
              {delivery > 0 && (
                <p className="text-xs text-[#F97316] font-medium">
                  Add ₹{499 - subtotal} more for free delivery!
                </p>
              )}
              <div className="flex justify-between border-t pt-3 font-black text-[#1E3A5F] text-base">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="mt-2.5 w-full flex items-center justify-center gap-2 border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </motion.div>
      </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
