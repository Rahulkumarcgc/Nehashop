import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Package, LogOut, Mail, Phone, MapPin,
  Edit3, ArrowRight, Heart, Truck, CheckCircle, Clock, X, Save
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// ── Status badge config ─────────────────────
function StatusBadge({ status }) {
  const cfg = {
    Delivered: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    Shipped: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
    Processing: { color: 'bg-orange-100 text-[#F97316] border-orange-200', icon: Clock },
    Confirmed: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle },
  }
  const s = cfg[status] || cfg.Processing
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border ${s.color}`}>
      <Icon size={12} />
      {status}
    </span>
  )
}

// ── Mini progress bar per order ─────────────
const STEP_MAP = { Processing: 0, Confirmed: 1, Shipped: 2, 'Out for Delivery': 3, Delivered: 4 }
function MiniProgress({ status }) {
  const active = STEP_MAP[status] ?? 0
  const steps = ['Placed', 'Confirmed', 'Shipped', 'Delivery', 'Done']
  return (
    <div>
      <div className="flex gap-1 mb-1">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500
            ${i <= active ? (i === active ? 'bg-[#F97316]' : 'bg-green-400') : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
        {steps.map(s => <span key={s}>{s}</span>)}
      </div>
    </div>
  )
}

// ── Edit Modal ──────────────────────────────
function EditModal({ user, currentData, onSave, onClose }) {
  const [form, setForm] = useState({
    phone: currentData.phone || '',
    address: currentData.address || '',
    city: currentData.city || '',
    zip: currentData.zip || '',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = () => {
    if (form.phone && !/^[6-9][0-9]{9}$/.test(form.phone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number.')
      return
    }
    onSave(form)
    toast.success('Profile updated successfully!', { icon: '✅' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-[#1E3A5F]">Edit Account Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Name (read-only from Clerk) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Full Name</label>
          <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 font-medium">
            {user.fullName || '—'} <span className="text-xs text-gray-400">(managed by Clerk)</span>
          </div>
        </div>

        {/* Email (read-only from Clerk) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Email</label>
          <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 font-medium">
            {user.primaryEmailAddress?.emailAddress || '—'} <span className="text-xs text-gray-400">(managed by Clerk)</span>
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Phone Number</label>
          <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:border-[#F97316] transition-colors">
            <span className="bg-gray-100 px-3 flex items-center text-gray-700 font-bold text-sm border-r border-gray-300 select-none">
              🇮🇳 +91
            </span>
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                setForm(prev => ({ ...prev, phone: val }))
              }}
              placeholder="98765 43210"
              className="flex-1 px-3 py-3 text-gray-800 text-sm outline-none bg-white font-medium tracking-wider"
            />
            {form.phone.length === 10 && (
              <span className="pr-3 flex items-center text-green-500">✓</span>
            )}
          </div>
          {form.phone.length > 0 && form.phone.length < 10 && (
            <p className="text-xs text-orange-500 font-medium">{10 - form.phone.length} more digit{10 - form.phone.length !== 1 ? 's' : ''} needed</p>
          )}
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Street Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="123 Main Street, Apt 4"
            className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F97316] transition-colors"
          />
        </div>

        {/* City + ZIP */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Mumbai"
              className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">ZIP Code</label>
            <input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              placeholder="400001"
              className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-200 text-gray-600 hover:border-gray-300 font-bold py-3 rounded-xl transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-[#1E3A5F] hover:bg-[#F97316] text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfilePage() {
  const { user, isSignedIn } = useUser()
  const { openSignIn, signOut } = useClerk()
  const [orders, setOrders] = useState([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [profileData, setProfileData] = useState({
    phone: '',
    address: '',
    city: '',
    zip: '',
  })

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const storedOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`) || '[]')
      setOrders(storedOrders)
      const wl = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]')
      setWishlistCount(wl.length)

      // Load saved profile data
      const saved = JSON.parse(localStorage.getItem(`profile_${user.id}`) || '{}')
      setProfileData({
        phone: saved.phone || '',
        address: saved.address || '',
        city: saved.city || '',
        zip: saved.zip || '',
      })
    }
  }, [isSignedIn, user])

  const handleSaveProfile = (formData) => {
    const updated = { ...formData }
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(updated))
    setProfileData(updated)
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag size={64} className="text-gray-300" />
        <h2 className="text-2xl font-black text-[#1E3A5F]">Please login to view your profile</h2>
        <button
          onClick={() => openSignIn()}
          className="bg-[#F97316] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
        >
          Login / Sign Up
        </button>
      </div>
    )
  }

  const cartItems = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const recentOrders = orders.slice(0, 3)

  const fullAddress = [profileData.address, profileData.city, profileData.zip]
    .filter(Boolean).join(', ') || 'No address saved yet'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* ── Profile Hero Card ── */}
        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2d5a8e] rounded-3xl p-7 flex flex-col sm:flex-row items-center gap-6 text-white shadow-xl shadow-blue-900/20">
          <div className="relative">
            <img
              src={user.imageUrl}
              alt={user.fullName}
              className="w-24 h-24 rounded-2xl ring-4 ring-[#F97316] object-cover shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black">{user.fullName || 'NehaShop User'}</h1>
            <p className="text-gray-300 text-sm mt-1">{user.primaryEmailAddress?.emailAddress}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="bg-[#F97316]/20 text-orange-300 text-xs px-3 py-1 rounded-full font-bold border border-orange-400/30">
                ✅ Verified Account
              </span>
              <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full font-bold border border-white/20">
                Member since {new Date(user.createdAt).getFullYear()}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-400/30 px-5 py-2.5 rounded-full font-bold text-sm transition-all self-start"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Cart Items', value: cartCount, icon: ShoppingBag, color: 'bg-orange-100 text-[#F97316]', path: '/cart' },
            { label: 'Total Orders', value: orders.length, icon: Package, color: 'bg-blue-100 text-blue-600', path: '/orders' },
            { label: 'Wishlist', value: wishlistCount, icon: Heart, color: 'bg-pink-100 text-pink-500', path: '/wishlist' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <Link key={stat.path} to={stat.path}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col gap-2 text-center border border-gray-50"
              >
                <div className={`${stat.color} p-2.5 rounded-xl w-fit mx-auto`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-black text-[#1E3A5F]">{stat.value}</p>
                <p className="text-xs text-gray-400 font-semibold">{stat.label}</p>
              </Link>
            )
          })}
        </div>

        {/* ── MY ORDERS SECTION ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#1E3A5F]">My Orders</h2>
                <p className="text-xs text-gray-400">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
              </div>
            </div>
            {orders.length > 0 && (
              <Link to="/orders" className="flex items-center gap-1 text-[#F97316] text-sm font-bold hover:underline">
                View All <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <div className="bg-gray-100 p-4 rounded-full">
                <Package size={36} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-500">No orders placed yet</p>
              <Link to="/" className="bg-[#F97316] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-600 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50">
              {recentOrders.map(order => (
                <div key={order.id} className="px-6 py-5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Order #{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span className="font-black text-[#1E3A5F] text-sm">₹{order.total}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {order.items?.slice(0, 4).map(item => (
                      <img
                        key={item.id}
                        src={item.image}
                        alt={item.name}
                        title={item.name}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-100 bg-gray-50"
                      />
                    ))}
                    {order.items?.length > 4 && (
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <MiniProgress status={order.status} />
                  <Link
                    to="/orders"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#F97316] font-bold hover:underline"
                  >
                    <Truck size={13} /> View Full Tracking
                  </Link>
                </div>
              ))}

              {orders.length > 3 && (
                <div className="px-6 py-4 bg-gray-50">
                  <Link
                    to="/orders"
                    className="flex items-center justify-center gap-2 text-sm font-bold text-[#1E3A5F] hover:text-[#F97316] transition-colors"
                  >
                    View all {orders.length} orders <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Account Details ── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-[#1E3A5F]">Account Details</h2>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 text-[#F97316] text-sm font-semibold hover:underline"
            >
              <Edit3 size={14} /> Edit
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
              <Mail size={16} className="text-[#F97316] shrink-0" />
              <span>{user.primaryEmailAddress?.emailAddress || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-xl">
              <Phone size={16} className="text-[#F97316] shrink-0" />
              <span className={profileData.phone ? 'text-gray-600' : 'text-gray-400 italic'}>
                {profileData.phone ? `+91 ${profileData.phone}` : 'No phone added'}
              </span>
              {!profileData.phone && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="ml-auto text-xs text-[#F97316] font-bold hover:underline"
                >
                  + Add
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-xl">
              <MapPin size={16} className="text-[#F97316] shrink-0" />
              <span className={fullAddress !== 'No address saved yet' ? 'text-gray-600' : 'text-gray-400 italic'}>
                {fullAddress}
              </span>
              {fullAddress === 'No address saved yet' && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="ml-auto text-xs text-[#F97316] font-bold hover:underline"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-50">
          <h2 className="text-lg font-black text-[#1E3A5F] mb-4">Quick Links</h2>
          <div className="flex flex-col gap-1">
            {[
              { label: '🛒 My Cart', path: '/cart' },
              { label: '📦 All Orders', path: '/orders' },
              { label: '❤️ My Wishlist', path: '/wishlist' },
              { label: '🛍️ Browse Shop', path: '/shop' },
              { label: '🏠 Home', path: '/' },
            ].map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-orange-50 hover:text-[#F97316] transition-all text-sm font-semibold text-gray-700 group"
              >
                <span>{link.label}</span>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-[#F97316] transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditModal
          user={user}
          currentData={profileData}
          onSave={handleSaveProfile}
          onClose={() => setShowEditModal(false)}
        />
      )}

    </div>
  )
}

export default ProfilePage