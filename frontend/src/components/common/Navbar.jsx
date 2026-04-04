import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, ShoppingBag, SlidersHorizontal, Heart, MapPin, LocateFixed, Loader2, ChevronDown, Sun, Moon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { SignedIn, SignedOut, UserButton, SignInButton, useUser, useClerk } from '@clerk/clerk-react'
import { useTheme } from '../../context/ThemeContext'
import { useProducts } from '../../context/ProductContext'

// GSAP Imports
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const categories = [
  { name: 'All', icon: '🛍️' },
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Grocery', icon: '🛒' },
  { name: 'Home', icon: '🏠' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Beauty', icon: '💄' },
]

function Navbar({ onCartClick }) {
  const { products } = useProducts()
  const [isScrolled, setIsScrolled] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  // Autocomplete state
  const [searchResults, setSearchResults] = useState([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const searchRef = useRef(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    setRecentSearches(saved)
  }, [])

  const saveRecentSearch = (term) => {
    if (!term.trim()) return
    const updated = [term.trim(), ...recentSearches.filter(q => q.toLowerCase() !== term.trim().toLowerCase())].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Location State
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState(localStorage.getItem('deliveryLocation') || 'Select Location')
  const [tempPincode, setTempPincode] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const navigate = useNavigate()
  const filterRef = useRef(null)
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()

  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'All'

  const navRef = useRef(null)

  useGSAP(() => {
    gsap.from(navRef.current, { y: -100, opacity: 0, duration: 0.8, ease: 'power3.out' })
  }, { scope: navRef })

  // Load wishlist count
  useEffect(() => {
    const updateWishlistCount = () => {
      if (isSignedIn && user?.id) {
        const wish = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]')
        setWishlistCount(wish.length)
      } else {
        setWishlistCount(0)
      }
    }
    updateWishlistCount()
    window.addEventListener('wishlistUpdated', updateWishlistCount)
    return () => window.removeEventListener('wishlistUpdated', updateWishlistCount)
  }, [isSignedIn, user])

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      if (isSignedIn && user?.id) {
        const cart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
        const count = cart.reduce((sum, item) => sum + item.qty, 0)
        setCartCount(count)
      } else {
        setCartCount(0)
      }
    }

    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [isSignedIn, user])

  // Close filter dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Live Autocomplete Effect
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase()
      const results = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      ).sort((a, b) => b.rating - a.rating).slice(0, 5) // sort by rating, show top 5
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, products])

  // Handle cart click - open login if not signed in
  const handleCartClick = (e) => {
    if (!isSignedIn) {
      e.preventDefault()
      openSignIn()
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    const cat = selectedCategory !== 'All' ? `&category=${selectedCategory}` : ''
    if (query) {
      saveRecentSearch(query)
      setIsSearchFocused(false)
      navigate(`/shop?q=${query}${cat}`)
    } else if (selectedCategory !== 'All') {
      setIsSearchFocused(false)
      navigate(`/shop?category=${selectedCategory}`)
    }
    setFilterOpen(false)
  }

  const handleSuggestionClick = (term) => {
    setSearchQuery(term)
    saveRecentSearch(term)
    setIsSearchFocused(false)
    navigate(`/shop?q=${term}`)
  }

  const handleUpdateLocation = (e) => {
    e.preventDefault()
    if (tempPincode.trim()) {
      setDeliveryLocation(tempPincode)
      localStorage.setItem('deliveryLocation', tempPincode)
      setLocationModalOpen(false)
      setTempPincode('')
    }
  }

  const handleSelectCity = (city) => {
    setDeliveryLocation(city)
    localStorage.setItem('deliveryLocation', city)
    setLocationModalOpen(false)
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.', { icon: '🚫' })
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          // OpenStreetMap Nominatim API for highly accurate reverse geocoding including Pincodes
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()

          const address = data.address || {}
          const cityArea = address.city || address.town || address.village || address.state_district || address.state || 'Current Location'
          const postcode = address.postcode || ''

          const locationStr = postcode ? `${cityArea} ${postcode}` : cityArea

          setDeliveryLocation(locationStr)
          localStorage.setItem('deliveryLocation', locationStr)
          setLocationModalOpen(false)
          toast.success(`Location set successfully!`, { icon: '📍' })
        } catch (error) {
          console.error('Error fetching location details:', error)
          toast.error('Could not fetch location details.', { icon: '❌' })
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error('Geolocation Error:', error)
        toast.error('Please allow location access in your browser settings to use this feature.', { icon: '🔒' })
        setIsLocating(false)
      }
    )
  }

  const handleCategorySelect = (cat) => {
    setFilterOpen(false)
    if (cat !== 'All') {
      navigate(`/?category=${cat}`)
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <nav ref={navRef} className="bg-[#1E3A5F] text-white shadow-xl sticky top-0 z-50">

        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 min-w-fit hover:scale-105 transition-transform">
            <div className="bg-[#F97316] p-2 rounded-lg">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <div className="flex flex-col leading-tight pr-2">
              <span className="text-xl font-black tracking-wide text-white">Neha</span>
              <span className="text-xs font-semibold text-[#F97316] -mt-1 tracking-widest uppercase">Shop</span>
            </div>
          </Link>

          {/* Location Pin */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className="hidden lg:flex items-end gap-1 hover:ring-1 hover:ring-white p-1.5 rounded-lg transition-all text-left mr-2"
          >
            <MapPin size={18} className="text-white mb-0.5" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-gray-300 font-medium ml-0.5">Deliver to</span>
              <span className="text-sm font-bold text-white tracking-wide truncate max-w-[120px]">{deliveryLocation}</span>
            </div>
          </button>

          {/* Search Bar + Filter - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4" ref={searchRef}>
            <div className="flex w-full relative">

              {/* Category Filter Button - outside pill so dropdown isn't clipped */}
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#F97316] border-r-0 rounded-l-full text-gray-700 text-sm font-bold transition-all duration-200 min-w-fit group hover:bg-orange-50 flex-shrink-0 shadow-md"
              >
                <span className="text-base">{categories.find(c => c.name === selectedCategory)?.icon || '🛍️'}</span>
                <span className="hidden lg:block text-[13px] text-gray-700 group-hover:text-[#F97316] transition-colors max-w-[90px] truncate">
                  {selectedCategory === 'All' ? 'All' : selectedCategory}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-gray-400 group-hover:text-[#F97316] transition-all duration-200 flex-shrink-0 ${filterOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Slide-down dropdown */}
              <div
                className={`absolute top-[calc(100%+8px)] left-0 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] py-1.5
                transition-all duration-200 ease-out origin-top
                ${filterOpen
                    ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                  }`}
              >
                <p className="text-[10px] font-black text-gray-400 px-4 pt-2 pb-1.5 uppercase tracking-[0.15em]">Browse by</p>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150
                    ${selectedCategory === cat.name
                        ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 text-[#F97316] font-bold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                      }`}
                  >
                    <span className="text-base w-6 text-center">{cat.icon}</span>
                    <span className="flex-1 text-left">{cat.name === 'All' ? 'All Categories' : cat.name}</span>
                    {selectedCategory === cat.name && (
                      <span className="w-2 h-2 rounded-full bg-[#F97316] flex-shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Input + Button pill */}
              <div className="flex flex-1 rounded-r-full overflow-hidden border-2 border-[#F97316] shadow-md bg-white relative">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${selectedCategory === 'All' ? 'products' : selectedCategory}...`}
                  className="flex-1 px-4 py-2 text-gray-800 text-sm outline-none bg-white w-full"
                />
                <button
                  type="submit"
                  className="bg-[#F97316] hover:bg-orange-600 transition-colors px-5 flex items-center flex-shrink-0"
                >
                  <Search size={18} className="text-white" />
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {isSearchFocused && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] p-3 flex flex-col gap-2">
                  
                  {/* Empty Search: Recent / Trending */}
                  {searchQuery.length === 0 && (
                    <div className="px-2 py-1">
                      {recentSearches.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Searches</p>
                            <button onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches') }} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 hover:text-red-500">Clear</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {recentSearches.map(term => (
                              <button key={term} onClick={() => handleSuggestionClick(term)} className="text-xs bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-[#F97316] border border-gray-100 hover:border-orange-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 shadow-sm">
                                <Search size={10} /> {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                         <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">🔥 Trending Categories</p>
                         <div className="grid grid-cols-2 gap-2">
                           {categories.filter(c=>c.name!=='All').slice(0, 4).map(cat => (
                             <button key={cat.name} onClick={() => handleCategorySelect(cat.name)} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 hover:bg-orange-50 px-3 py-2 rounded-xl transition-colors text-left border border-gray-50 hover:border-orange-100">
                               {cat.icon} <span className="font-semibold">{cat.name}</span>
                             </button>
                           ))}
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Active Search Results */}
                  {searchQuery.length > 0 && (
                    searchResults.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-2 py-1">Products</p>
                        {searchResults.map(product => (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            onClick={() => {
                              setIsSearchFocused(false)
                              saveRecentSearch(searchQuery)
                              setSearchQuery('')
                            }}
                            className="flex items-center gap-4 p-2 hover:bg-orange-50/50 rounded-2xl transition-all group border border-transparent hover:border-orange-100"
                          >
                            <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                              <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm font-black text-[#1E3A5F] group-hover:text-[#F97316] transition-colors truncate">{product.name}</span>
                              <div className="flex items-center gap-2 text-xs mt-1">
                                <span className="text-[#F97316] font-black text-sm">₹{product.price}</span>
                                {product.brand && <span className="text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-bold">{product.brand}</span>}
                                <span className="hidden sm:inline text-yellow-500 font-bold ml-auto flex items-center gap-0.5">★ {product.rating}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                        <button
                          type="submit"
                          onClick={handleSearch}
                          className="mt-2 w-full py-2.5 bg-[#1E3A5F] hover:bg-[#F97316] text-white text-xs font-bold rounded-xl transition-all shadow-md group border border-[#1E3A5F] hover:border-[#F97316]"
                        >
                          View all results for "<span className="text-orange-200 group-hover:text-white">{searchQuery}</span>"
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center">
                        <Search size={40} className="text-gray-200 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">
                          No matches for "<span className="text-[#F97316] font-bold">{searchQuery}</span>"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Try checking your spelling or use more general terms</p>
                      </div>
                    )
                  )}
                </div>
              )}

            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-7">

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`relative flex items-center w-14 h-7 rounded-full transition-all duration-300 focus:outline-none shadow-inner
              ${isDark ? 'bg-[#F97316]' : 'bg-white/20'}`}
            >
              <span className={`absolute transition-all duration-300 flex items-center justify-center w-5 h-5 rounded-full shadow-md
              ${isDark ? 'translate-x-8 bg-[#1a1a26]' : 'translate-x-1 bg-white'}`}
              >
                {isDark
                  ? <Moon size={11} className="text-[#F97316]" />
                  : <Sun size={11} className="text-[#F97316]" />}
              </span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              onClick={handleCartClick}
              className="relative group flex flex-col items-center"
            >
              <div className="relative overflow-visible">
                <Heart size={24} className="group-hover:text-[#F97316] transition-colors" />
                {isSignedIn && wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F97316] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-xs hidden md:block mt-0.5 text-gray-300">Wishlist</span>
            </Link>

            {/* Cart - opens slide-over drawer */}
            <button
              onClick={() => {
                if (!isSignedIn) { openSignIn(); return }
                onCartClick && onCartClick()
              }}
              className="relative group flex flex-col items-center"
            >
              <div className="relative">
                <ShoppingCart size={24} className="group-hover:text-[#F97316] transition-colors" />
                {isSignedIn && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F97316] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
                {!isSignedIn && (
                  <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                    🔒
                  </span>
                )}
              </div>
              <span className="text-xs hidden md:block mt-0.5 text-gray-300">Cart</span>
            </button>

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-white/20"></div>

            {/* Auth */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex flex-col items-center group">
                  <div className="bg-[#F97316] hover:bg-orange-600 transition-colors px-4 py-1.5 rounded-full text-sm font-bold">
                    Login
                  </div>
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col items-center gap-0.5">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 ring-2 ring-[#F97316] ring-offset-1 ring-offset-[#1E3A5F]'
                    }
                  }}
                />
                <Link to="/profile" className="text-xs hidden md:block text-gray-300 hover:text-[#F97316]">Profile</Link>
              </div>
            </SignedIn>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search + Filter */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div className="flex rounded-full overflow-hidden border-2 border-[#F97316] bg-white">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="text-gray-700 text-xs px-2 py-2 outline-none bg-gray-100 border-r border-gray-300"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-3 py-2 text-gray-800 text-sm outline-none"
              />
              <button type="submit" className="bg-[#F97316] px-4">
                <Search size={16} className="text-white" />
              </button>
            </div>
          </form>
        </div>

        {/* Nav Links */}
        <div className="bg-[#162d4a] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="hidden md:flex gap-1 py-1">
              {[
                { label: 'Home', to: '/' },
                { label: 'All Products', to: '/shop' },
                { label: 'Electronics', to: '/shop?category=Electronics' },
                { label: 'Fashion', to: '/shop?category=Fashion' },
                { label: 'TV', to: '/shop?category=TV' },
                { label: 'Sports', to: '/shop?category=Sports' },
                { label: 'Computers', to: '/shop?category=Computers' },
                { label: 'Footwear', to: '/shop?category=Footwear' },
                { label: 'Clothing', to: '/shop?category=Clothing' },
                { label: 'Beauty', to: '/shop?category=Beauty' },
                { label: 'Kitchen', to: '/shop?category=Kitchen' },
                { label: '🔥 Offers', to: '/shop?category=All' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm px-4 py-2 rounded hover:bg-[#F97316] hover:text-white transition-all duration-200 block font-medium text-gray-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#162d4a] border-t border-white/10 px-4 py-3">
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'All Products', to: '/shop' },
                { label: 'Electronics', to: '/shop?category=Electronics' },
                { label: 'Fashion', to: '/shop?category=Fashion' },
                { label: 'Grocery', to: '/shop?category=Grocery' },
                { label: '🔥 Offers', to: '/shop?category=All' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm px-4 py-2 rounded hover:bg-[#F97316] transition-all duration-200 block font-medium text-gray-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

      </nav>

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transition-all">
            <div className="bg-gray-100 px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-black text-[#1E3A5F] text-lg">Choose your location</h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Delivery options and delivery speeds may vary for different locations. Please provide your pincode or city.
              </p>

              {/* Auto Detect Location Button */}
              <button
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold mb-5 transition-all shadow-sm
                  ${isLocating ? 'bg-orange-100 text-[#F97316] opacity-70 cursor-not-allowed' : 'bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white border border-orange-200 hover:border-[#F97316]'}`}
              >
                {isLocating ? (
                  <><Loader2 size={18} className="animate-spin" /> Fetching GPS Data...</>
                ) : (
                  <><LocateFixed size={18} /> Use Current Real-time Location</>
                )}
              </button>

              <div className="flex items-center gap-4 mb-5">
                <hr className="flex-1 border-gray-200" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or manually set</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              <form onSubmit={handleUpdateLocation} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value)}
                  placeholder="Enter a pincode (e.g., 110001)"
                  className="border-2 border-gray-200 focus:border-[#F97316] rounded-xl px-4 py-2.5 text-sm flex-1 outline-none text-gray-800 font-medium transition-colors"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="bg-[#1E3A5F] hover:bg-[#F97316] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md"
                >
                  Apply
                </button>
              </form>

              <div className="flex items-center gap-4 mb-5">
                <hr className="flex-1 border-gray-200" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or select major city</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              <div className="flex flex-wrap gap-2.5">
                {['Mumbai 400001', 'Bengaluru 560001', 'Delhi 110001', 'Kolkata 700001', 'Chennai 600001', 'Pune 411001'].map(city => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className="text-xs bg-orange-50 text-[#F97316] px-4 py-2 rounded-full font-bold border border-orange-100 hover:bg-[#F97316] hover:text-white transition-all shadow-sm hover:shadow-md"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar