import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'
import { ShoppingCart, Check, Star, ArrowLeft, Truck, Shield, RotateCcw, Heart, MessageSquare } from 'lucide-react'
import { useProducts } from '../context/ProductContext'
import RecentlyViewed from '../components/common/RecentlyViewed'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          <Star size={16} fill={star <= Math.round(rating) ? 'currentColor' : 'none'} />
        </span>
      ))}
      <span className="text-sm font-semibold text-gray-600 ml-2">{rating} Rating</span>
    </div>
  )
}

function InteractiveStarRating({ rating, setRating }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => setRating(star)}
          className={`transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
        </button>
      ))}
      <span className="text-sm font-semibold text-gray-600 ml-2">{rating} out of 5</span>
    </div>
  )
}

function ProductDetailPage() {
  const { products } = useProducts()
  const { id } = useParams()
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  
  const product = products.find(p => p.id === parseInt(id))
  
  const [qty, setQty] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  const [wishlist, setWishlist] = useState({})
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState('')
  const [newRating, setNewRating] = useState(5)

  useEffect(() => {
    // Initial mock reviews data
    // Load reviews from backend
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${product?.numericId}/reviews`)
        const data = await res.json()
        if (Array.isArray(data)) {
          const formatted = data.map(r => ({
            id: r.id,
            user: r.user?.firstName ? `${r.user.firstName} ${r.user.lastName || ''}` : 'Anonymous',
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.createdAt).toLocaleDateString()
          }))
          setReviews(formatted)
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error)
      }
    }
    
    if (product?.numericId) {
      fetchReviews()
    }

    if (isSignedIn && user?.id) {
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]')
      const wishObj = {}
      storedWishlist.forEach(item => { wishObj[item.id] = true })
      setWishlist(wishObj)
    } else {
      setWishlist({})
    }
  }, [isSignedIn, user, id])

  const handleToggleWishlist = () => {
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

  const handleAddReview = async (e) => {
    e.preventDefault()
    if (!isSignedIn) {
      openSignIn()
      return
    }
    if (!newReview.trim()) return

    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId: user.id,
          productId: product.numericId,
          rating: newRating,
          comment: newReview
        })
      });
      const data = await res.json();
      
      if (data.success) {
        const r = data.review;
        const reviewObj = {
          id: r.id,
          user: r.user?.firstName ? `${r.user.firstName} ${r.user.lastName || ''}` : user.fullName || 'Anonymous',
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.createdAt).toLocaleDateString()
        };

        setReviews([reviewObj, ...reviews]);
        setNewReview('');
        setNewRating(5);
        toast.success('Review submitted successfully!', { icon: '⭐' });
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error submitting review');
    }
  }

  useEffect(() => {
    setActiveImageIndex(0)
  }, [product?.id])

  // Track recently viewed
  useEffect(() => {
    if (!product) return
    const key = 'recentlyViewed'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const filtered = existing.filter(p => p.id !== product.id)
    const updated = [product, ...filtered].slice(0, 10)
    localStorage.setItem(key, JSON.stringify(updated))
  }, [product?.id])

  const gallery = product ? [product.image, product.image, product.image, product.image] : []

  const getTransformClass = (idx) => {
    switch(idx) {
      case 1: return 'scale-125'
      case 2: return '-scale-x-100'
      case 3: return 'rotate-6'
      default: return ''
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-black text-[#1E3A5F] mb-4">Product Not Found</h2>
        <Link to="/" className="text-[#F97316] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
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
        item.id === product.id ? { ...item, qty: item.qty + qty } : item
      )
    } else {
      updatedCart = [...existing, { ...product, qty }]
    }

    localStorage.setItem(cartKey, JSON.stringify(updatedCart))

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)

    toast.success(`${qty} ${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '12px',
        background: '#1E3A5F',
        color: '#fff',
        fontWeight: 'bold',
      },
    })

    window.dispatchEvent(new Event('cartUpdated'))
    window.dispatchEvent(new Event('openCartDrawer'))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-gray-500 hover:text-[#F97316] mb-6 flex items-center gap-2 font-medium w-max transition-colors">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Image Gallery */}
            <div className="flex flex-col gap-4">
              {/* Main Image */}
              <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center min-h-[350px] md:min-h-[400px] overflow-hidden">
                <img 
                  src={gallery[activeImageIndex]} 
                  alt={product.name} 
                  className={`w-full max-h-[400px] object-contain rounded-xl mix-blend-multiply transition-transform duration-500 hover:scale-110 ${getTransformClass(activeImageIndex)}`}
                />
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl flex items-center justify-center transition-all overflow-hidden ${
                      activeImageIndex === idx 
                        ? 'border-2 border-[#F97316] shadow-md ring-2 ring-orange-100' 
                        : 'border-2 border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-full p-2 flex items-center justify-center">
                      <img 
                        src={img} 
                        alt={`${product.name} angle ${idx + 1}`} 
                        className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-300 ${getTransformClass(idx)}`} 
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <span className="text-sm bg-orange-100 text-[#F97316] px-3 py-1 rounded-full font-bold w-max mb-4">
                {product.category}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="mb-6">
                <StarRating rating={product.rating} />
              </div>

              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-black text-[#1E3A5F]">₹{product.price}</span>
                <span className="text-xl text-gray-400 line-through mb-1">₹{product.oldPrice}</span>
                <span className="text-sm text-green-600 font-bold mb-2 ml-2 bg-green-100 px-2 py-1 rounded-lg">
                  {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                </span>
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                {product.description || 'Experience premium quality with this outstanding product. Designed to bring you the best value and performance.'}
              </p>

              <hr className="border-gray-100 mb-8" />

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                {/* Quantity Selector */}
                <div className="flex items-center border-2 border-gray-200 rounded-xl h-14 w-full sm:w-32 bg-gray-50">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 text-gray-500 hover:text-[#F97316] transition-colors font-bold text-xl"
                  >-</button>
                  <span className="flex-1 text-center font-bold text-gray-800">{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="px-4 text-gray-500 hover:text-[#F97316] transition-colors font-bold text-xl"
                  >+</button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 rounded-xl font-bold text-lg text-white transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3
                    ${isAdded ? 'bg-green-500 shadow-green-500/30' : 'bg-[#F97316] hover:bg-orange-600 hover:-translate-y-1'}`}
                >
                  {isAdded ? (
                    <><Check size={24} /> Added</>
                  ) : (
                    <><ShoppingCart size={24} /> Add to Cart</>
                  )}
                </button>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  className={`h-14 w-14 flex items-center justify-center rounded-xl border-2 transition-all hover:scale-105 shrink-0 shadow-sm
                    ${wishlist[product.id] ? 'bg-orange-50 border-[#F97316] text-[#F97316]' : 'bg-white border-gray-200 text-gray-400 hover:border-[#F97316] hover:text-[#F97316]'}`}
                >
                  <Heart size={24} className={wishlist[product.id] ? "fill-[#F97316]" : ""} />
                </button>
              </div>

              {/* Badges/Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1E3A5F]">Free Delivery</p>
                    <p className="text-xs text-gray-500">Orders &gt; ₹499</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-50 p-2 rounded-full text-orange-600">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1E3A5F]">Easy Returns</p>
                    <p className="text-xs text-gray-500">7 Days Return</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-full text-green-600">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1E3A5F]">1 Year Warranty</p>
                    <p className="text-xs text-gray-500">100% Original</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-3xl shadow-sm p-6 md:p-10 border border-gray-50">
           <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <MessageSquare size={28} className="text-[#F97316]" />
              <h2 className="text-2xl font-black text-[#1E3A5F]">Customer Reviews</h2>
              <span className="bg-gray-100 text-[#1E3A5F] px-4 py-1.5 rounded-full text-sm font-bold ml-2">
                {reviews.length}
              </span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Review Form */}
              <div className="md:col-span-1 bg-gray-50 p-6 rounded-2xl border border-gray-100 h-fit">
                <h3 className="font-bold text-[#1E3A5F] mb-4 text-lg">Write a Review</h3>
                <form onSubmit={handleAddReview} className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Rating</label>
                    <InteractiveStarRating rating={newRating} setRating={setNewRating} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Your Thoughts</label>
                    <textarea 
                      required
                      rows={4} 
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="What did you like or dislike?"
                      className="w-full text-sm p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#F97316] resize-none transition-colors"
                    />
                  </div>
                  <button type="submit" className="bg-[#1E3A5F] hover:bg-[#F97316] text-white py-3.5 rounded-xl font-bold transition-all duration-300 w-full mt-2 shadow-md hover:shadow-lg hover:-translate-y-1">
                    Submit Review
                  </button>
                </form>
              </div>
              
              {/* Review List */}
              <div className="md:col-span-2 flex flex-col gap-6">
                 {reviews.length === 0 ? (
                   <div className="bg-orange-50/50 p-8 rounded-2xl text-center border border-orange-100">
                     <p className="text-gray-500 font-medium">No reviews yet. Be the first to review this product!</p>
                   </div>
                 ) : reviews.map(review => (
                   <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 text-[#F97316] rounded-full flex items-center justify-center font-black text-xl shadow-sm border border-orange-200">
                            {review.user.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#1E3A5F] text-base leading-tight mb-1">{review.user}</p>
                            <p className="text-xs text-gray-400 font-medium">{review.date}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                     </div>
                     <p className="text-gray-600 text-[15px] mt-3 ml-16 leading-relaxed bg-gray-50 p-4 rounded-xl rounded-tl-none border border-gray-100">{review.comment}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Recently Viewed Carousel */}
        <RecentlyViewed currentProductId={product.id} />

      </div>
    </div>
  )
}

export default ProductDetailPage
