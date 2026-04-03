import { Link, useSearchParams } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { ShoppingBag, Truck, Shield, Headphones, ChevronRight, X, ShoppingCart, Check, ChevronLeft, Heart, Eye } from 'lucide-react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

// Framer Motion Import
import { motion } from 'framer-motion'

import QuickViewModal from '../components/product/QuickViewModal'
import CountdownTimer from '../components/common/CountdownTimer'

import bannerImg from '../assets/hero/banner.jpg'
import banner2Img from '../assets/hero/banner2.jpg'
import banner3Img from '../assets/hero/banner3.jpg'
import banner4Img from '../assets/hero/banner4.jpg'
import electronicsImg from '../assets/categories/electronics.jpg'
import fashionImg from '../assets/categories/fashion.jpg'
import groceryImg from '../assets/categories/grocery.jpg'
import homeImg from '../assets/categories/home.jpg'
import sportsImg from '../assets/categories/sports.jpg'
import beautyImg from '../assets/categories/beauty.jpg'

import { useProducts } from '../context/ProductContext'


const categories = [
  { name: 'All', image: bannerImg, color: 'bg-gray-50' },
  { name: 'Electronics', image: electronicsImg, color: 'bg-blue-50' },
  { name: 'Fashion', image: fashionImg, color: 'bg-pink-50' },
  { name: 'Grocery', image: groceryImg, color: 'bg-green-50' },
  { name: 'Home', image: homeImg, color: 'bg-yellow-50' },
  { name: 'Sports', image: sportsImg, color: 'bg-red-50' },
  { name: 'Beauty', image: beautyImg, color: 'bg-purple-50' },
]

// 4 banner slides - add your own images/text per slide
const bannerSlides = [
  {
    image: bannerImg,
    tag: 'Welcome to NehaShop',
    title: 'Shop Smart,',
    highlight: 'Save More!',
    desc: 'Discover thousands of products at unbeatable prices.',
  },
  {
    image: banner2Img,
    tag: '🔥 Hot Deals',
    title: 'Top Electronics,',
    highlight: 'Best Prices!',
    desc: 'Grab the latest gadgets before they run out.',
  },
  {
    image: banner3Img,
    tag: '👗 New Arrivals',
    title: 'Fresh Fashion,',
    highlight: 'Every Day!',
    desc: 'Stay ahead of trends with our newest collection.',
  },
  {
    image: banner4Img,
    tag: '🚚 Free Delivery',
    title: 'Order Above ₹499,',
    highlight: 'Ship Free!',
    desc: 'Fast and free delivery right to your doorstep.',
  },
]

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

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating})</span>
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

function HomePage() {
  const container = useRef(null)
  const { products } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'All'
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [addedItems, setAddedItems] = useState({})

  const [wishlist, setWishlist] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // --- Products & Categories Filter ---
  let filteredProducts = []
  if (categoryParam === 'All') {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)))
    uniqueCategories.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat)
      filteredProducts.push(...catProducts.slice(0, 2))
    })
  } else {
    filteredProducts = products.filter(p => p.category.toLowerCase() === categoryParam.toLowerCase())
  }


  const handleNewsletterSubmit = async () => {
    const email = newsletterEmail.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.')
      return
    }
    setNewsletterLoading(true)
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          to_name: email.split('@')[0],
          coupon_code: 'RAHA100',
          discount: '₹100',
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      toast.success('🎉 Coupon RAHA100 sent to your email!', {
        style: { borderRadius: '12px', background: '#1E3A5F', color: '#fff' },
        duration: 4000,
      })
      setNewsletterEmail('')
    } catch (err) {
      console.error('EmailJS error:', err)
      toast.error('Could not send email. Please try again.')
    } finally {
      setNewsletterLoading(false)
    }
  }

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
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [categoryParam])

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

  // --- Slider State ---
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef(null)

  const startAutoPlay = () => {
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 4000)
  }

  const stopAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  useEffect(() => {
    startAutoPlay()
    return () => stopAutoPlay()
  }, [])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    stopAutoPlay()
    startAutoPlay() // reset timer on manual click
  }

  const goPrev = () => {
    goToSlide((currentSlide - 1 + bannerSlides.length) % bannerSlides.length)
  }

  const goNext = () => {
    goToSlide((currentSlide + 1) % bannerSlides.length)
  }


  const features = [
    { icon: <Truck size={28} />, title: 'Free Delivery', desc: 'On orders above ₹499' },
    { icon: <Shield size={28} />, title: 'Secure Payment', desc: '100% safe transactions' },
    { icon: <Headphones size={28} />, title: '24/7 Support', desc: 'Always here to help' },
    { icon: <ShoppingBag size={28} />, title: 'Easy Returns', desc: '7 day return policy' },
  ]

  const handleCategoryClick = (catName) => {
    if (catName === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ category: catName })
    }
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
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }))
    }, 1500)

    toast.success(`${product.name} added to cart!`, {
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
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero Slider ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-[420px] md:h-[500px] overflow-hidden group"
      >

        {/* Slides */}
        {bannerSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out
              ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/90 to-[#1E3A5F]/20 flex items-center">
              <div className="px-8 md:px-16 max-w-2xl slide-content">
                <p className="text-[#F97316] font-semibold mb-2 tracking-widest uppercase text-sm">
                  {slide.tag}
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  {slide.title} <br />
                  <span className="text-[#F97316]">{slide.highlight}</span>
                </h1>
                <p className="text-gray-300 mb-8 text-lg">{slide.desc}</p>
                <div className="flex gap-4 flex-wrap">
                  <Link
                    to="/products"
                    className="bg-[#F97316] hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-all duration-200 shadow-lg hover:scale-105"
                  >
                    Shop Now
                  </Link>
                  <button
                    onClick={() => handleCategoryClick('All')}
                    className="border-2 border-white text-white hover:bg-white hover:text-[#1E3A5F] px-8 py-3 rounded-full font-bold transition-all duration-200"
                  >
                    View Deals
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Left Arrow */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Right Arrow */}
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={28} />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300
                ${index === currentSlide
                  ? 'bg-[#F97316] w-6 h-3'
                  : 'bg-white/50 w-3 h-3 hover:bg-white'
                }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Features Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 feature-container">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-2 feature-item">
              <div className="text-[#F97316]">{f.icon}</div>
              <div>
                <p className="font-bold text-[#1E3A5F] text-sm">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1E3A5F]">Shop by Category</h2>
          <button
            onClick={() => handleCategoryClick('All')}
            className="text-[#F97316] hover:underline text-sm font-semibold flex items-center gap-1"
          >
            View All <ChevronRight size={16} />
          </button>
        </div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-3 md:grid-cols-7 gap-3"
        >
          {categories.map((cat) => (
            <motion.button
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`category-btn ${cat.color} rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105
                ${categoryParam === cat.name ? 'ring-2 ring-[#F97316] ring-offset-2 scale-105' : ''}`}
            >
              {cat.name !== 'All' ? (
                <img src={cat.image} alt={cat.name} className="w-full h-20 object-cover" />
              ) : (
                <div className="w-full h-20 bg-gradient-to-br from-[#1E3A5F] to-[#2d5a8e] flex items-center justify-center">
                  <span className="text-3xl">🛍️</span>
                </div>
              )}
              <p className={`text-xs font-bold text-center py-2
                ${categoryParam === cat.name ? 'text-[#F97316]' : 'text-gray-700'}`}>
                {cat.name}
              </p>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1E3A5F]">
            {categoryParam === 'All' ? 'Featured Products' : `${categoryParam} Products`}
            <span className="text-sm font-normal text-gray-500 ml-2">({filteredProducts.length} items)</span>
          </h2>
          {categoryParam !== 'All' && (
            <button
              onClick={() => handleCategoryClick('All')}
              className="text-[#F97316] hover:underline text-sm font-semibold flex items-center gap-1"
            >
              Clear Filter <X size={14} />
            </button>
          )}
        </div>

        {/* Countdown Timer */}
        <CountdownTimer />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 products-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <ProductSkeleton key={n} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl font-bold text-gray-600">No products found!</p>
            <button
              onClick={() => handleCategoryClick('All')}
              className="mt-4 bg-[#F97316] text-white px-6 py-2 rounded-full font-bold"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {filteredProducts.map((product) => (
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
                key={product.id}
                className="product-card relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group hover:-translate-y-1"
              >
                {/* Ribbon Badge */}
                {(() => {
                  const badge = getProductBadge(product)
                  return badge ? (
                    <div className={`absolute top-0 left-0 z-20 ${badge.color} text-white text-[10px] font-black px-2.5 py-1 rounded-br-xl rounded-tl-2xl shadow-md tracking-wide`}>
                      {badge.label}
                    </div>
                  ) : null
                })()}

                {/* Heart Icon Overlay */}
                <button
                  onClick={(e) => handleToggleWishlist(e, product)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-all hover:scale-110 opacity-0 md:opacity-100 group-hover:opacity-100"
                >
                  <Heart
                    size={18}
                    className={wishlist[product.id] ? "fill-[#F97316] text-[#F97316]" : "text-gray-400"}
                  />
                </button>

                <Link to={`/products/${product.id}`}>
                  <div className="overflow-hidden h-48 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product) }}
                        className="opacity-0 group-hover:opacity-100 bg-white text-[#1E3A5F] hover:bg-[#F97316] hover:text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 -translate-y-2 group-hover:translate-y-0"
                      >
                        <Eye size={14} /> Quick View
                      </button>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <span className="text-xs bg-orange-100 text-[#F97316] px-2 py-0.5 rounded-full font-semibold">
                    {product.category}
                  </span>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 mt-1 truncate">{product.name}</h3>
                  <StarRating rating={product.rating} />
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-lg font-black text-[#1E3A5F]">₹{product.price}</span>
                    <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
                    <span className="text-xs text-green-600 font-semibold">
                      {Math.round((1 - product.price / product.oldPrice) * 100)}% off
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`mt-3 w-full text-white text-sm py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                      ${addedItems[product.id]
                        ? 'bg-green-500'
                        : 'bg-[#1E3A5F] hover:bg-[#F97316]'
                      }`}
                  >
                    {addedItems[product.id] ? (
                      <><Check size={16} /> Added!</>
                    ) : (
                      <><ShoppingCart size={16} /> Add to Cart</>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── TRUSTED BRANDS STRIP ── */}
      <div className="mt-14 brands-section">
        <p className="text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Trusted Brands We Carry</p>
        <div className="flex flex-wrap justify-center gap-6">
          {['Samsung', 'Apple', 'Nike', 'Adidas', 'Sony', 'LG', 'Boat', 'Puma', 'Philips', 'Lakme'].map(brand => (
            <div key={brand}
              className="brand-pill bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 rounded-2xl px-6 py-3 text-sm font-black text-gray-500 hover:text-[#F97316] cursor-pointer hover:-translate-y-0.5"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>

      {/* ── TOP DEALS DOUBLE BANNER ── */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 top-deals-section">
        <div className="top-deal-card relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2d6aad] p-8 flex flex-col justify-between min-h-[180px]">
          <div>
            <span className="text-xs bg-[#F97316] text-white px-3 py-1 rounded-full font-black">⚡ Flash Deal</span>
            <h3 className="text-white text-2xl font-black mt-3 leading-tight">Up to 60% off<br />on Electronics</h3>
            <p className="text-blue-200 text-sm mt-2">Limited stock — grab yours now!</p>
          </div>
          <Link to="/shop?category=Electronics"
            className="mt-5 self-start bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-lg"
          >
            Shop Now →
          </Link>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10">📱</div>
        </div>
        <div className="top-deal-card relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 p-8 flex flex-col justify-between min-h-[180px]">
          <div>
            <span className="text-xs bg-white text-pink-600 px-3 py-1 rounded-full font-black">👗 New Season</span>
            <h3 className="text-white text-2xl font-black mt-3 leading-tight">Fresh Fashion<br />Arrivals Daily</h3>
            <p className="text-pink-100 text-sm mt-2">Trending styles for every occasion</p>
          </div>
          <Link to="/shop?category=Fashion"
            className="mt-5 self-start bg-white hover:bg-gray-100 text-pink-600 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-lg"
          >
            Explore →
          </Link>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10">👗</div>
        </div>
      </div>

      {/* ── WHY CHOOSE US ── */}
      <div className="mt-14">
        <h2 className="text-2xl font-black text-[#1E3A5F] text-center mb-2">Why Shop with NehaShop?</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Millions of happy customers trust us</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 why-choose-us-section">
          {[
            { icon: '🚚', title: 'Free Delivery', desc: 'On all orders above ₹499 across India' },
            { icon: '🔁', title: '7-Day Returns', desc: 'Hassle-free returns with full refund' },
            { icon: '🔒', title: '100% Secure', desc: 'SSL encrypted safe payments' },
            { icon: '🏆', title: 'Top Quality', desc: 'Only certified & genuine products' },
            { icon: '💬', title: '24/7 Support', desc: 'Chat with our AI bot anytime' },
            { icon: '🎁', title: 'Daily Offers', desc: 'New coupons & deals every day' },
            { icon: '⚡', title: 'Fast Checkout', desc: 'One-click ordering for saved users' },
            { icon: '📦', title: 'Live Tracking', desc: 'Real-time order status updates' },
          ].map(f => (
            <div key={f.title} className="why-choose-us-card bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-50 hover:border-orange-100 transition-all hover:-translate-y-0.5 text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <p className="font-black text-[#1E3A5F] text-sm">{f.title}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS + NEWSLETTER (side by side) ── */}
      <div className="mt-14 mb-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch testimonials-section">

        {/* LEFT — Compact Reviews */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-black text-[#1E3A5F]">What Our Customers Say</h2>
            <p className="text-gray-400 text-xs mt-1">Real reviews from real shoppers ⭐</p>
          </div>
          {[
            { name: 'Priya S.', city: 'Mumbai', review: 'Amazing! Got my order in 2 days, perfectly packed. NehaShop is now my go-to!', rating: 5, avatar: '👩' },
            { name: 'Rahul M.', city: 'Delhi', review: 'Unbeatable prices. Used NEHA16 coupon and saved ₹400. Will shop again!', rating: 5, avatar: '👨' },
            { name: 'Anjali K.', city: 'Bangalore', review: 'Support chat is super helpful! Return processed within 24 hours. Impressed!', rating: 4, avatar: '👩‍💼' },
          ].map(t => (
            <div key={t.name} className="testimonial-card bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-50 flex gap-4 items-start hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">{t.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div>
                    <p className="font-black text-[#1E3A5F] text-sm leading-none">{t.name}</p>
                    <p className="text-[11px] text-gray-400">{t.city}</p>
                  </div>
                  <span className="text-yellow-400 text-sm">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
                </div>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed italic">"{t.review}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — Newsletter */}
        <div className="newsletter-card bg-gradient-to-br from-[#1E3A5F] via-[#2d5a8e] to-[#1E3A5F] rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 text-[120px] flex items-center justify-center select-none pointer-events-none">✉️</div>
          <span className="text-[11px] bg-[#F97316] text-white px-3 py-0.5 rounded-full font-black uppercase tracking-wider w-fit">🎁 Exclusive Deal</span>
          <h2 className="text-white text-xl font-black mt-3 mb-1 leading-tight">Get ₹100 Off<br />Your Next Order!</h2>
          <p className="text-blue-200 text-xs mb-4 leading-relaxed">Subscribe and instantly receive coupon code <strong className="text-white">RAHA100</strong> in your inbox.</p>
          <div className="flex flex-col gap-2.5">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm text-gray-800 font-medium shadow-md focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={handleNewsletterSubmit}
              disabled={newsletterLoading}
              className="w-full bg-[#F97316] hover:bg-orange-500 disabled:bg-orange-300 text-white px-6 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02] shadow-lg"
            >
              {newsletterLoading ? '✉️ Sending...' : '🎁 Subscribe & Get ₹100 Off'}
            </button>
          </div>
          <p className="text-blue-300 text-[10px] mt-3 text-center">No spam, ever. Unsubscribe anytime.</p>
        </div>

      </div>


      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}

    </div>
  )
}

export default HomePage