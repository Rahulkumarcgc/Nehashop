/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ShoppingCart, Check, Star, Filter, Heart, Eye } from 'lucide-react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'
import { useProducts } from '../context/ProductContext'
import QuickViewModal from '../components/product/QuickViewModal'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-sm ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating})</span>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse">
      <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
      <div className="bg-gray-200 h-4 w-1/3 rounded mb-2"></div>
      <div className="bg-gray-200 h-5 w-3/4 rounded mb-3"></div>
      <div className="bg-gray-200 h-4 w-1/4 rounded mb-4"></div>
      <div className="bg-gray-200 h-10 w-full rounded-xl"></div>
    </div>
  )
}

function getProductBadge(product) {
  const discount = Math.round((1 - product.price / product.oldPrice) * 100)
  if (discount >= 50) return { label: '🔥 HOT', color: 'bg-red-500' }
  if (product.id % 5 === 0) return { label: '✨ NEW', color: 'bg-purple-500' }
  if (product.id % 3 === 0) return { label: '📈 TRENDING', color: 'bg-blue-500' }
  if (discount >= 30) return { label: '🏷️ SALE', color: 'bg-green-500' }
  return null
}

function ShopPage() {
  const { products } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()

  const query = searchParams.get('q') || ''
  const categoryParam = searchParams.get('category') || 'All'

  const [loading, setLoading] = useState(true)
  const [maxPrice, setMaxPrice] = useState(50000)
  const [sortBy, setSortBy] = useState('featured')
  const [minRating, setMinRating] = useState(0)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [addedItems, setAddedItems] = useState({})
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [wishlist, setWishlist] = useState({})

  const allBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort()

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const stored = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]')
      const wishObj = {}
      stored.forEach(item => { wishObj[item.id] = true })
      setWishlist(wishObj)
    } else {
      setWishlist({})
    }
  }, [isSignedIn, user])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [query, categoryParam])

  let filtered = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.description?.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = categoryParam === 'All' || p.category.toLowerCase() === categoryParam.toLowerCase()
    const matchesPrice = p.price <= maxPrice
    const matchesRating = p.rating >= minRating
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand)
    return matchesQuery && matchesCategory && matchesPrice && matchesRating && matchesBrand
  })

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price)
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price)
  }

  const handleAddToCart = (product) => {
    if (!isSignedIn) {
      openSignIn()
      return
    }

    const cartKey = `cart_${user.id}`
    const existing = JSON.parse(localStorage.getItem(cartKey) || '[]')
    const found = existing.find(item => item.id === product.id)
    let updatedCart

    if (found) {
      updatedCart = existing.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      )
    } else {
      updatedCart = [...existing, { ...product, qty: 1 }]
    }

    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
    setAddedItems(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => { setAddedItems(prev => ({ ...prev, [product.id]: false })) }, 1500)
    toast.success(`${product.name} added to cart!`, { icon: '🛒', style: { borderRadius: '12px', background: '#1E3A5F', color: '#fff' } })
    window.dispatchEvent(new Event('cartUpdated'))
    window.dispatchEvent(new Event('openCartDrawer'))
  }

  const handleToggleWishlist = (e, product) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isSignedIn) {
      openSignIn()
      return
    }

    const wishKey = `wishlist_${user.id}`
    let currentWishlist = JSON.parse(localStorage.getItem(wishKey) || '[]')
    const isAdding = !wishlist[product.id]

    if (isAdding) {
      currentWishlist.push(product)
      toast.success('Added to Wishlist!', { icon: '❤️' })
    } else {
      currentWishlist = currentWishlist.filter(item => item.id !== product.id)
      toast('Removed from Wishlist', { icon: '💔' })
    }

    localStorage.setItem(wishKey, JSON.stringify(currentWishlist))
    setWishlist(prev => ({ ...prev, [product.id]: isAdding }))
    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
            <h3 className="text-lg font-black text-[#1E3A5F] flex items-center gap-2 mb-6">
              <Filter size={20} className="text-[#F97316]" /> Filters
            </h3>

            {/* Price Filter */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 block mb-3">Max Price: ₹{maxPrice}</label>
              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F97316]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>₹100</span>
                <span>₹50,000</span>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 block mb-3">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#F97316] text-[#1E3A5F] font-semibold transition-colors"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 block mb-3">Brands</label>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {allBrands.map(brand => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#F97316] transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 block mb-3">Customer Rating</label>
              <div className="flex flex-col gap-2">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                      className="w-4 h-4 border-gray-300 text-[#F97316] focus:ring-[#F97316]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#F97316] transition-colors">
                      {rating}★ & above
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {(query || categoryParam !== 'All' || maxPrice < 50000 || sortBy !== 'featured' || minRating > 0 || selectedBrands.length > 0) && (
              <button
                onClick={() => {
                  setSearchParams({})
                  setMaxPrice(50000)
                  setSortBy('featured')
                  setMinRating(0)
                  setSelectedBrands([])
                }}
                className="mt-2 w-full py-3 bg-gray-100 rounded-xl text-sm text-gray-700 hover:bg-gray-200 hover:text-[#F97316] font-bold transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-black text-[#1E3A5F] flex items-center gap-2">
              {query
                ? <>Search results for <span className="text-[#F97316]">"{query}"</span></>
                : categoryParam !== 'All'
                  ? `${categoryParam} Products`
                  : 'All Products'}
            </h1>
            <span className="text-gray-500 font-medium bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
              {filtered.length} products found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map(n => <ProductSkeleton key={n} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center min-h-[400px] flex flex-col items-center justify-center border border-gray-100">
              <Search size={64} className="text-gray-300 mb-6" />
              <h2 className="text-2xl font-black text-[#1E3A5F] mb-3">No products matched your search!</h2>
              <p className="text-gray-500 mb-8 max-w-md">Try adjusting your filters, expanding your price range, or searching for a different term.</p>
              <button
                onClick={() => { setSearchParams({}); setMaxPrice(50000) }}
                className="bg-[#1E3A5F] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#F97316] transition-all hover:shadow-lg hover:-translate-y-1"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <div key={product.id} className="relative bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden group hover:-translate-y-1 border border-gray-50">

                  {/* Ribbon Badge */}
                  {(() => {
                    const badge = getProductBadge(product)
                    return badge ? (
                      <div className={`absolute top-0 left-0 z-20 ${badge.color} text-white text-[10px] font-black px-2.5 py-1 rounded-br-xl rounded-tl-3xl shadow-md tracking-wide`}>
                        {badge.label}
                      </div>
                    ) : null
                  })()}

                  {/* Heart Icon */}
                  <button
                    onClick={(e) => handleToggleWishlist(e, product)}
                    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all hover:scale-110 group-hover:opacity-100 opacity-0 md:opacity-100"
                  >
                    <Heart
                      size={18}
                      className={wishlist[product.id] ? "fill-[#F97316] text-[#F97316]" : "text-gray-400"}
                    />
                  </button>

                  <Link to={`/products/${product.id}`}>
                    <div className="overflow-hidden h-56 bg-gray-50/50 p-6 flex justify-center items-center relative">
                      <div className="absolute inset-0 bg-[#F97316]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-3xl transform scale-150"></div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 relative z-10"
                      />
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-end justify-center pb-4 z-20">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product) }}
                          className="opacity-0 group-hover:opacity-100 bg-white text-[#1E3A5F] hover:bg-[#F97316] hover:text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 translate-y-2 group-hover:translate-y-0"
                        >
                          <Eye size={14} /> Quick View
                        </button>
                      </div>
                    </div>
                  </Link>

                  <div className="p-5">
                    <span className="text-xs bg-orange-100 text-[#F97316] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-bold text-[#1E3A5F] text-[15px] mb-2 mt-3 line-clamp-2 min-h-[44px] hover:text-[#F97316] transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    <StarRating rating={product.rating} />
                    <div className="flex items-end gap-2 mt-3 mb-1">
                      <span className="text-xl font-black text-[#1E3A5F]">₹{product.price}</span>
                      <span className="text-xs text-gray-400 line-through mb-1">₹{product.oldPrice}</span>
                      <span className="text-xs text-green-600 font-bold mb-1 ml-auto">
                        {Math.round((1 - product.price / product.oldPrice) * 100)}% off
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`mt-4 w-full text-white text-sm py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md
                        ${addedItems[product.id]
                          ? 'bg-green-500 shadow-green-500/30'
                          : 'bg-[#1E3A5F] hover:bg-[#F97316] shadow-[#1E3A5F]/20 hover:shadow-[#F97316]/30'
                        }`}
                    >
                      {addedItems[product.id]
                        ? <><Check size={18} /> Added to Cart</>
                        : <><ShoppingCart size={18} /> Add to Cart</>
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  )
}

export default ShopPage