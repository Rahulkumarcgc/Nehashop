/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import {
  Package, ShoppingBag, ArrowRight, CheckCircle, Circle,
  Truck, Home, ClipboardCheck, PackageCheck, ChevronDown, ChevronUp, MapPin, XCircle, AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// ── Timeline steps ─────────────────────────────────────
const TRACKING_STEPS = [
  { key: 'placed',    label: 'Order Placed',       icon: ClipboardCheck, desc: 'We have received your order and are preparing it.' },
  { key: 'confirmed', label: 'Order Confirmed',     icon: PackageCheck,   desc: 'Your order has been confirmed and sent to the warehouse.' },
  { key: 'shipped',   label: 'Shipped',             icon: Package,        desc: 'Your order is on its way! Our courier partner has picked it up.' },
  { key: 'transit',   label: 'Out for Delivery',    icon: Truck,          desc: 'Your order is out for delivery. Expect it today!' },
  { key: 'delivered', label: 'Delivered',           icon: Home,           desc: 'Your order has been successfully delivered. Enjoy!' },
]

// Given an order status string, decide how many steps are complete
function getActiveStep(status) {
  switch (status?.toLowerCase()) {
    case 'delivered':   return 4
    case 'out for delivery': return 3
    case 'shipped':     return 2
    case 'confirmed':   return 1
    case 'processing':
    default:            return 0
  }
}

// Generate fake timestamps from the order date going forward
function getTimestamps(orderDate, activeStep) {
  const base = orderDate ? new Date(orderDate) : new Date()
  return TRACKING_STEPS.map((_, i) => {
    if (i > activeStep) return null
    const d = new Date(base)
    d.setHours(d.getHours() + i * 18)
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  })
}

function OrderTimeline({ status, orderDate }) {
  const activeStep = getActiveStep(status)
  const timestamps = getTimestamps(orderDate, activeStep)

  return (
    <div className="mt-6 px-2">
      <div className="flex flex-col gap-0">
        {TRACKING_STEPS.map((step, i) => {
          const isCompleted = i <= activeStep
          const isCurrent   = i === activeStep
          const isLast      = i === TRACKING_STEPS.length - 1
          const Icon        = step.icon

          return (
            <div key={step.key} className="flex gap-4">
              {/* Left column: icon + connector */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-sm
                  ${isCompleted
                    ? isCurrent
                      ? 'bg-[#F97316] text-white ring-4 ring-orange-100 scale-110'
                      : 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-300 border-2 border-gray-200'
                  }`}
                >
                  {isCompleted && !isCurrent
                    ? <CheckCircle size={20} strokeWidth={2.5} />
                    : <Icon size={18} />
                  }
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[36px] my-1 rounded-full transition-all duration-500
                    ${i < activeStep ? 'bg-green-400' : 'bg-gray-200'}`}
                  />
                )}
              </div>

              {/* Right column: label + timestamp + desc */}
              <div className={`pb-6 flex-1 ${isLast ? '' : ''}`}>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className={`font-bold text-sm transition-colors
                    ${isCompleted
                      ? isCurrent ? 'text-[#F97316]' : 'text-green-600'
                      : 'text-gray-400'
                    }`}>
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] bg-orange-100 text-[#F97316] px-2 py-0.5 rounded-full font-black animate-pulse uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </p>
                  {timestamps[i] && (
                    <span className="text-[11px] text-gray-400 font-medium">{timestamps[i]}</span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 leading-relaxed ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const activeStep = getActiveStep(order.status)

  const isCancellable = !['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status)
  const isCancelled   = order.status === 'Cancelled'

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden hover:shadow-md transition-shadow duration-300">

      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2d5a8e] px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Order ID</p>
            <p className="text-white font-black text-base">#{order.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs px-3 py-1.5 rounded-full font-black border
            ${isCancelled
              ? 'bg-red-500/20 text-red-300 border-red-500/30'
              : order.status === 'Delivered'
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-[#F97316]/20 text-orange-300 border-orange-500/30'
            }`}>
            {isCancelled ? '❌ Cancelled' : order.status}
          </span>
          <span className="text-white/60 text-xs font-medium">{order.date}</span>
          {/* Cancel Button in header */}
          {isCancellable && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-400/30 px-3 py-1.5 rounded-full font-bold transition-all"
            >
              <XCircle size={13} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-5">
        <div className="flex items-center gap-1 mb-1">
          {TRACKING_STEPS.map((s, i) => (
            <div key={s.key} className={`h-1.5 flex-1 rounded-full transition-all duration-700
              ${i <= activeStep ? (i === activeStep ? 'bg-[#F97316]' : 'bg-green-400') : 'bg-gray-100'}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1 mb-4">
          <span>Placed</span>
          <span>Confirmed</span>
          <span>Shipped</span>
          <span>Delivery</span>
          <span>Done</span>
        </div>
      </div>

      {/* Items collapsed */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#F97316] transition-colors mb-3"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
          {!expanded && (
            <span className="text-gray-400 font-normal ml-1 truncate max-w-[180px]">
              • {order.items?.[0]?.name}
              {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
            </span>
          )}
        </button>

        {expanded && (
          <div className="flex flex-col gap-3 mb-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-white" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                </div>
                <span className="font-black text-[#1E3A5F] text-sm flex-shrink-0">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
            <MapPin size={13} className="text-[#F97316]" />
            <span className="truncate max-w-[200px]">
              {order.shipping?.city || 'N/A'}, {order.shipping?.zip || ''}
            </span>
          </div>
          <span className="font-black text-[#1E3A5F] text-lg">₹{order.total}</span>
        </div>
      </div>

      {/* Track Order Toggle — hide if cancelled */}
      {!isCancelled && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-black text-[#F97316] hover:bg-orange-50 transition-colors"
          >
            <Truck size={16} />
            {showTimeline ? 'Hide Tracking' : 'Track Order'}
            {showTimeline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <div className={`overflow-hidden transition-all duration-400 ${showTimeline ? 'max-h-[600px]' : 'max-h-0'}`}>
            <div className="px-6 pb-4 bg-gray-50/60 border-t border-gray-100">
              <OrderTimeline status={order.status} orderDate={order.date} />
            </div>
          </div>
        </div>
      )}

      {/* Cancelled ribbon */}
      {isCancelled && (
        <div className="border-t border-red-100 bg-red-50 px-6 py-3 flex items-center gap-2 text-red-500 text-sm font-bold">
          <XCircle size={16} /> This order has been cancelled.
        </div>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {confirmCancel && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-800">Cancel Order?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to cancel <span className="font-black text-[#1E3A5F]">Order #{order.id}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 border-2 border-gray-200 text-gray-600 hover:border-gray-300 font-bold py-3 rounded-xl transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={() => {
                  onCancel(order.id)
                  setConfirmCancel(false)
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-red-500/30"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function OrderPage() {
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const cancelOrder = async (orderId) => {
    const target = orders.find(o => o.id === orderId)
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, status: 'Cancelled' } : o
    )
    setOrders(updated)

    toast.success('Order cancelled successfully.', { icon: '🚫', style: { borderRadius: '12px' } })

    // ── Send cancellation email via Web3Forms ──────────────
    if (target) {
      const itemsList = target.items
        ?.map(i => `- ${i.qty}x ${i.name} → ₹${i.price * i.qty}`)
        .join('\n')

      const emailBody = `
❌ ORDER CANCELLATION NOTICE

Order ID  : #${target.id}
Date      : ${target.date}
Status    : CANCELLED

Customer  : ${target.shipping?.name || user.fullName || 'N/A'}
Email     : ${user.primaryEmailAddress?.emailAddress || 'N/A'}
Phone     : +91 ${target.shipping?.phone || 'N/A'}
Address   : ${target.shipping?.address || ''}, ${target.shipping?.city || ''} - ${target.shipping?.zip || ''}

Items in Order:
${itemsList || 'N/A'}

Order Total : ₹${target.total}

— NehaShop System
`
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: '548886d7-0d2a-44b7-9920-1c6eb13b1244',
            subject: `❌ Order #${target.id} Cancelled — NehaShop`,
            from_name: 'NehaShop Orders',
            name: target.shipping?.name || user.fullName || 'Customer',
            email: user.primaryEmailAddress?.emailAddress || 'noreply@nehashop.com',
            message: emailBody
          })
        })
      } catch (err) {
        console.error('Cancellation email failed:', err)
      }
    }
  }


  useEffect(() => {
    if (isSignedIn && user?.id) {
      setLoading(true)
      fetch(`http://localhost:5000/api/orders/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if(!Array.isArray(data)) return;
          const formatted = data.map(o => ({
            id: o.id.slice(-6).toUpperCase(), // Show compact ID
            dbId: o.id,
            date: new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            status: o.status,
            total: o.totalAmount,
            shipping: { city: o.shippingCity, zip: o.shippingZip, phone: o.shippingPhone, address: o.shippingAddress, name: o.shippingName },
            items: o.items.map(i => ({
              id: i.product.dbId || i.product.id,
              name: i.product.name,
              image: i.product.image,
              qty: i.quantity,
              price: i.priceAtTime
            }))
          }))
          setOrders(formatted)
        })
        .catch(e => console.error(e))
        .finally(() => setLoading(false))
    }
  }, [isSignedIn, user])

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <Package size={64} className="text-gray-300" />
        <h2 className="text-2xl font-black text-[#1E3A5F]">Please login to view your orders</h2>
        <button
          onClick={() => openSignIn()}
          className="bg-[#F97316] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
        >
          Login / Sign Up
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1E3A5F]">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Track and manage all your purchases</p>
          </div>
          {orders.length > 0 && (
            <span className="bg-orange-100 text-[#F97316] text-sm font-black px-4 py-1.5 rounded-full">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-16 flex flex-col items-center gap-4 text-center border border-gray-50">
            <div className="bg-gray-100 p-6 rounded-full mb-2">
              <ShoppingBag size={56} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-black text-gray-500">No orders yet!</h2>
            <p className="text-gray-400 text-sm">Looks like you haven't placed any orders yet.</p>
            <Link
              to="/"
              className="bg-[#F97316] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 mt-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center p-20 text-gray-400 font-bold">Loading Orders...</div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onCancel={cancelOrder} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default OrderPage