import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'

function WishlistPage() {
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const stored = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]')
      setWishlist(stored)
    }
  }, [isSignedIn, user])

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(item => item.id !== id)
    setWishlist(updated)
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updated))
    window.dispatchEvent(new Event('wishlistUpdated'))
    toast('Removed from Wishlist', { icon: '💔' })
  }

  const moveToCart = (product) => {
    const cartKey = `cart_${user.id}`
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    const found = existingCart.find(item => item.id === product.id)
    
    let updatedCart
    if (found) {
      updatedCart = existingCart.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      )
    } else {
      updatedCart = [...existingCart, { ...product, qty: 1 }]
    }

    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Remove from wishlist
    removeFromWishlist(product.id)

    toast.success(`${product.name} moved to cart!`, { icon: '🛒', style: { borderRadius: '12px', background: '#1E3A5F', color: '#fff' } })
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <Heart size={64} className="text-[#F97316]" />
        <h2 className="text-2xl font-black text-[#1E3A5F]">Sign in to view your wishlist</h2>
        <button
          onClick={() => openSignIn()}
          className="bg-[#F97316] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
        >
          Login / Sign Up
        </button>
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
           <Heart size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-[#1E3A5F]">Your wishlist is empty</h2>
        <p className="text-gray-500 max-w-sm text-center mb-4">Save items you love here and purchase them later when you're ready.</p>
        <Link to="/shop" className="bg-[#1E3A5F] hover:bg-[#F97316] text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg hover:-translate-y-1">Start Browsing</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
           <Heart size={36} className="text-[#F97316] fill-[#F97316]" />
           <h1 className="text-3xl font-black text-[#1E3A5F]">My Wishlist</h1>
           <span className="bg-gray-200 text-[#1E3A5F] px-4 py-1.5 rounded-full text-sm font-bold ml-2 shadow-sm border border-gray-100">
             {wishlist.length} Items
           </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div key={product.id} className="relative bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 p-5 group flex flex-col border border-gray-100 hover:-translate-y-1">
              <button 
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white hover:scale-110 shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>
              
              <Link to={`/products/${product.id}`} className="block h-44 bg-gray-50 rounded-2xl mb-5 overflow-hidden relative p-4 flex items-center justify-center group/img">
                {/* Subtle hover glow behind product */}
                <div className="absolute inset-0 bg-[#F97316]/5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-full blur-3xl transform scale-150"></div>
                <img src={product.image} alt={product.name} className="max-h-full object-contain mix-blend-multiply group-hover/img:scale-110 group-hover/img:-rotate-3 transition-transform duration-500 relative z-10" />
              </Link>
              
              <h3 className="font-bold text-[#1E3A5F] text-[15px] mb-3 line-clamp-2 leading-tight flex-1 hover:text-[#F97316] transition-colors">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between mb-5 mt-auto bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                   <span className="text-xl font-black text-[#1E3A5F] block leading-none">₹{product.price}</span>
                   <span className="text-xs text-gray-400 line-through mt-1">₹{product.oldPrice}</span>
                </div>
                <span className="text-xs bg-orange-100 text-[#F97316] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              
              <button 
                onClick={() => moveToCart(product)}
                className="w-full bg-[#1E3A5F] hover:bg-[#F97316] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#1E3A5F]/20 hover:shadow-lg"
              >
                <ShoppingCart size={18} /> Move to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WishlistPage
