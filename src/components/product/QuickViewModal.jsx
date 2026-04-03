import { useState } from 'react'
import { X, ShoppingCart, Check, Star, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating})</span>
    </div>
  )
}

function QuickViewModal({ product, onClose }) {
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const [isAdded, setIsAdded] = useState(false)
  const [qty, setQty] = useState(1)

  if (!product) return null

  const handleAddToCart = () => {
    if (!isSignedIn) { openSignIn(); return }

    const cartKey = `cart_${user.id}`
    const existing = JSON.parse(localStorage.getItem(cartKey) || '[]')
    const found = existing.find(item => item.id === product.id)
    let updatedCart

    if (found) {
      updatedCart = existing.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + qty } : item
      )
    } else {
      updatedCart = [...existing, { ...product, qty }]
    }

    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)

    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#1E3A5F', color: '#fff' }
    })
    window.dispatchEvent(new Event('cartUpdated'))
    window.dispatchEvent(new Event('openCartDrawer'))
  }

  const discount = Math.round((1 - product.price / product.oldPrice) * 100)

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="bg-gray-50 p-10 flex items-center justify-center min-h-[260px]">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[220px] object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Info */}
          <div className="p-7 flex flex-col">
            <span className="text-xs bg-orange-100 text-[#F97316] px-3 py-1 rounded-full font-bold w-max mb-3 uppercase tracking-wide">
              {product.category}
            </span>

            <h2 className="text-xl font-black text-[#1E3A5F] mb-3 leading-tight">{product.name}</h2>

            <StarRating rating={product.rating} />

            <div className="flex items-end gap-3 my-4">
              <span className="text-3xl font-black text-[#1E3A5F]">₹{product.price}</span>
              <span className="text-gray-400 line-through mb-1">₹{product.oldPrice}</span>
              <span className="text-sm text-green-600 font-bold mb-1 bg-green-50 px-2 py-0.5 rounded-lg">{discount}% OFF</span>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
              {product.description || 'Experience premium quality with this outstanding product. Designed to bring you the best value and performance.'}
            </p>

            {/* Qty Selector */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 text-gray-500 hover:text-[#F97316] font-bold text-lg transition-colors">-</button>
                <span className="px-3 font-black text-gray-800">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-2.5 text-gray-500 hover:text-[#F97316] font-bold text-lg transition-colors">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md
                  ${isAdded ? 'bg-green-500 shadow-green-500/30' : 'bg-[#F97316] hover:bg-orange-600 shadow-orange-500/30'}`}
              >
                {isAdded ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
            </div>

            <Link
              to={`/products/${product.id}`}
              onClick={onClose}
              className="text-sm text-[#1E3A5F] hover:text-[#F97316] font-bold flex items-center gap-1 transition-colors"
            >
              View Full Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal
