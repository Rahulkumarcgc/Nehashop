import { Link } from 'react-router-dom'
import { ShoppingBag, Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'

function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-[#1E3A5F] text-white mt-16">

      {/* Newsletter Banner */}
      <div className="bg-[#F97316] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white">🎉 Subscribe & Get 10% OFF!</h3>
            <p className="text-orange-100 text-sm mt-1">Join 50,000+ happy shoppers. Get deals in your inbox!</p>
          </div>
          {subscribed ? (
            <div className="bg-white text-[#F97316] px-6 py-3 rounded-full font-bold text-sm">
              ✅ Subscribed Successfully!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="flex-1 md:w-72 px-5 py-3 rounded-l-full text-gray-800 outline-none text-sm"
                required
              />
              <button
                type="submit"
                className="bg-[#1E3A5F] hover:bg-[#162d4a] px-6 py-3 rounded-r-full font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Send size={16} /> Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-[#F97316] p-2 rounded-lg">
                <ShoppingBag size={22} className="text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-black text-white">Neha</span>
                <span className="text-xs font-semibold text-[#F97316] -mt-1 tracking-widest uppercase">Shop</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Your one-stop destination for the best deals on electronics, fashion, grocery & more. Shop smart, save more! 🛍️
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {['✅ 100% Genuine', '🔒 Secure Pay', '🚚 Fast Delivery', '↩️ Easy Returns'].map((badge) => (
                <span key={badge} className="bg-white/10 text-xs px-3 py-1 rounded-full text-gray-300 border border-white/20">
                  {badge}
                </span>
              ))}
            </div>

            {/* Social Media */}
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl hover:scale-110 transition-transform flex items-center justify-center w-9 h-9">
                <span className="text-white text-lg">📸</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"
                className="bg-blue-600 rounded-xl hover:scale-110 transition-transform flex items-center justify-center w-9 h-9">
                <span className="text-white font-black text-base">f</span>
              </a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer"
                className="bg-green-500 rounded-xl hover:scale-110 transition-transform flex items-center justify-center w-9 h-9">
                <span className="text-white text-lg">💬</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-white relative">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#F97316]"></span>
            </h4>
            <ul className="space-y-3 mt-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'All Products', path: '/products' },
                { name: 'Electronics', path: '/category/electronics' },
                { name: 'Fashion', path: '/category/fashion' },
                { name: 'Grocery', path: '/category/grocery' },
                { name: "Today's Deals", path: '/offers' },
                { name: 'My Orders', path: '/orders' },
                { name: 'My Profile', path: '/profile' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path}
                    className="text-gray-400 hover:text-[#F97316] text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-white relative">
              Customer Service
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#F97316]"></span>
            </h4>
            <ul className="space-y-3 mt-4">
              {[
                { name: 'Help Center', path: '/help' },
                { name: 'Track Your Order', path: '/orders' },
                { name: 'Return & Refund', path: '/returns' },
                { name: 'Shipping Policy', path: '/shipping' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms & Conditions', path: '/terms' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact Us', path: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path}
                    className="text-gray-400 hover:text-[#F97316] text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-white relative">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#F97316]"></span>
            </h4>
            <ul className="space-y-4 mt-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#F97316] mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">123 Shop Street, Delhi, India - 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#F97316] shrink-0" />
                <a href="tel:+919999999999" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">
                  +91 6205839760
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={18} className="text-[#F97316] shrink-0" />
                <a href="https://wa.me/916205839760" target="_blank" rel="noreferrer"
                  className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">
                  WhatsApp Support
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#F97316] shrink-0" />
                <a href="mailto:support@nehashop.com"
                  className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">
                  rahulkumar12345678f90@gmail.com
                </a>
              </li>
            </ul>

            {/* App Download */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-white mb-3">📱 Download Our App</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 transition-colors">
                  <span className="text-2xl">🍎</span>
                  <div>
                    <p className="text-xs text-gray-400">Download on the</p>
                    <p className="text-sm font-bold text-white">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 transition-colors">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="text-xs text-gray-400">Get it on</p>
                    <p className="text-sm font-bold text-white">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Payment Icons */}
      <div className="border-t border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-gray-400 text-sm font-semibold">We Accept:</span>
            {['💳 Visa', '💳 Mastercard', '📱 UPI', '💰 PayTM', '🏦 Net Banking', '💵 COD'].map((pay) => (
              <span key={pay} className="bg-white/10 text-xs px-3 py-1.5 rounded-lg text-gray-300 border border-white/20 font-medium">
                {pay}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <span>🔒 SSL Secured</span>
            <span>•</span>
            <span>100% Safe Checkout</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#162d4a] py-4 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 <span className="text-[#F97316] font-bold">NehaShop</span>. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Made with ❤️ in India 🇮🇳
          </p>
        </div>
      </div>

    </footer>
  )
}

export default Footer