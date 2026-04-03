import { useState, useEffect, useRef } from 'react'
import { X, MessageCircle, Send, Phone, Bot, User, RefreshCw } from 'lucide-react'

// ── Knowledge Base ── //
const BOT_RESPONSES = {
  greeting: ["Hi there! 👋 I'm Neha, your shopping assistant. How can I help you today?", "Hello! Welcome to NehaShop support. What can I help you with?"],
  order: ["You can track your order from the **Orders** page in your profile. 📦 Just click on your order to see real-time status.", "Your order details are available under **My Orders**. If you haven't received a tracking update in 48 hours, please let me know!"],
  return: ["We have a hassle-free **7-day return policy**! 🔄 Just go to My Orders → Select Order → Request Return. No questions asked!", "Returns are super easy! Within 7 days of delivery, visit My Orders and click 'Return Item'. Refund is processed in 3-5 business days."],
  delivery: ["We offer **free delivery on orders above ₹499**! 🚚 Standard delivery takes 3-5 days. Express delivery (1-2 days) is available in select cities.", "Delivery timelines: Standard 3-5 days, Express 1-2 days. Orders placed before 2 PM are dispatched the same day! 📦"],
  payment: ["We accept **UPI, Credit/Debit Cards, NetBanking, PayTM, and Cash on Delivery** (COD)! 💳 All payments are 100% secure with SSL encryption.", "You can pay using UPI, Cards, Wallets, or COD. EMI is also available for orders above ₹999!"],
  discount: ["Use code **NEHA10** for 10% off on your first order! 🎉 Check our homepage for today's flash deals which update daily!", "We run flash sales every day! Look for the countdown timer on our homepage. Also try code NEHA10 for extra savings!"],
  account: ["You can manage your profile, orders, wishlist — everything under your account. Just click your avatar in the top right! 👤", "Your account settings, addresses, and order history are all in the Profile section. Click the user avatar in the Navbar."],
  cancel: ["You can cancel an order within **2 hours** of placing it if it hasn't been shipped yet. Go to My Orders → Select Order → Cancel. 🙁", "Orders can be cancelled before they're shipped! Go to My Orders and click Cancel. After shipping, you'll need to initiate a return."],
  product: ["We have thousands of products across Electronics, Fashion, Grocery, Home, Sports, and Beauty! 🛍️ Use our search or browse by category.", "You can use the search bar or filter by category to find products. We add new arrivals every week!"],
  warranty: ["Most electronics come with a **1-year manufacturer warranty**! 🛡️ For warranty claims, contact us with your order ID.", "Warranty varies by product — check the product page for details. Electronics typically have 1 year warranty."],
  // When user shows signs of needing human help
  human_trigger: [
    "I understand this needs special attention. Let me connect you with our support team.",
    "I can see you need personalized help. Our team would love to assist you directly!",
    "You've raised a valid concern that I want to make sure is handled perfectly by our team."
  ],
  fallback: ["Hmm, I'm not sure about that! Could you rephrase? Or type one of these: **order, return, delivery, payment, discount, cancel** 🤔", "I didn't quite catch that. Try asking about: orders, returns, delivery, payment options, or discounts!"]
}

const HUMAN_TRIGGERS = ['call', 'phone', 'human', 'agent', 'manager', 'person', 'real', 'talk', 'speak', 'urgent', 'emergency', 'please help', 'not working', 'frustrated', 'angry', 'escalate', 'complaint', 'refund not received', 'still waiting', 'where is my', 'no response', 'worst', 'pathetic', 'disappointed']

const TOPICS = {
  order: ['order', 'track', 'tracking', 'status', 'shipped', 'dispatch'],
  return: ['return', 'refund', 'exchange', 'replace', 'replace', 'send back'],
  delivery: ['delivery', 'shipping', 'arrive', 'when will', 'how long', 'days'],
  payment: ['payment', 'pay', 'upi', 'card', 'cod', 'cash', 'net banking'],
  discount: ['discount', 'coupon', 'offer', 'deal', 'promo', 'code', 'off'],
  account: ['account', 'profile', 'login', 'password', 'sign in', 'register'],
  cancel: ['cancel', 'cancellation'],
  product: ['product', 'item', 'search', 'find', 'category', 'electronics', 'fashion'],
  warranty: ['warranty', 'guarantee', 'broken', 'damage', 'defect']
}

function getBotReply(input) {
  const lower = input.toLowerCase()

  // Check for human trigger
  const wantsHuman = HUMAN_TRIGGERS.some(t => lower.includes(t))
  if (wantsHuman) return { type: 'human', text: BOT_RESPONSES.human_trigger[Math.floor(Math.random() * BOT_RESPONSES.human_trigger.length)] }

  // Match topics
  for (const [topic, keywords] of Object.entries(TOPICS)) {
    if (keywords.some(k => lower.includes(k))) {
      const replies = BOT_RESPONSES[topic]
      return { type: 'normal', text: replies[Math.floor(Math.random() * replies.length)] }
    }
  }

  // Greetings
  if (['hi', 'hello', 'hey', 'good morning', 'good evening', 'namaste'].some(g => lower.includes(g))) {
    return { type: 'normal', text: BOT_RESPONSES.greeting[Math.floor(Math.random() * BOT_RESPONSES.greeting.length)] }
  }

  return { type: 'normal', text: BOT_RESPONSES.fallback[Math.floor(Math.random() * BOT_RESPONSES.fallback.length)] }
}

// Quick suggestion chips
const QUICK_CHIPS = ['Track my order', 'Return an item', 'Delivery time', 'Payment options', 'Discounts & offers', 'Cancel order']

function formatText(text) {
  // Bold **text**
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

function SupportChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! 👋 I'm **Neha Bot**, your 24/7 shopping assistant! How can I help you today?", time: new Date() }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [humanReveal, setHumanReveal] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, typing])

  const sendMessage = (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return

    setMessages(prev => [...prev, { from: 'user', text: userMsg, time: new Date() }])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const reply = getBotReply(userMsg)
      setTyping(false)
      setMessages(prev => [...prev, { from: 'bot', text: reply.text, time: new Date() }])

      if (reply.type === 'human') {
        // After 1.5s, reveal phone number
        setTimeout(() => {
          setHumanReveal(true)
          setMessages(prev => [...prev, {
            from: 'bot',
            text: '📞 Our support executive will call you shortly. Or you can call us directly:',
            time: new Date(),
            isPhone: true
          }])
        }, 1500)
      }
    }, 1000 + Math.random() * 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetChat = () => {
    setMessages([{ from: 'bot', text: "Hi! 👋 I'm **Neha Bot**, your 24/7 shopping assistant! How can I help you today?", time: new Date() }])
    setHumanReveal(false)
    setInput('')
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        title="24/7 Support"
        className={`fixed bottom-24 right-5 z-[9990] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110
          ${open ? 'bg-gray-700 rotate-0' : 'bg-gradient-to-br from-[#1E3A5F] to-[#2d6aad]'}`}
      >
        {open
          ? <X size={22} className="text-white" />
          : <>
              <MessageCircle size={26} className="text-white" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full animate-pulse" />
            </>
        }
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-40 right-5 z-[9989] w-[340px] max-h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100
        transition-all duration-300 origin-bottom-right
        ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2d6aad] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center shadow-md">
                <Bot size={20} className="text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="text-white font-black text-[15px] leading-tight">Neha Bot</p>
              <p className="text-green-300 text-xs font-medium">● Online • 24/7 Support</p>
            </div>
          </div>
          <button onClick={resetChat} title="Reset Chat" className="text-white/60 hover:text-white transition-colors p-1">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/60" style={{ maxHeight: '320px' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-black shadow-sm
                ${msg.from === 'bot' ? 'bg-[#F97316]' : 'bg-[#1E3A5F]'}`}>
                {msg.from === 'bot' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className={`max-w-[80%] flex flex-col gap-1 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.from === 'user'
                    ? 'bg-[#1E3A5F] text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
                {msg.isPhone && (
                  <a
                    href="tel:+916205839760"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 mt-1"
                  >
                    <Phone size={16} fill="white" /> +91 6205839760
                  </a>
                )}
                <span className="text-[10px] text-gray-400">
                  {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-full bg-[#F97316] flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100 bg-white">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="flex-shrink-0 text-xs bg-orange-50 text-[#F97316] border border-orange-200 px-3 py-1.5 rounded-full font-bold hover:bg-[#F97316] hover:text-white transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-100 px-4 py-3 flex gap-2 items-end bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] text-gray-800 resize-none transition-colors"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="w-10 h-10 bg-[#F97316] hover:bg-orange-600 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:cursor-not-allowed hover:scale-105"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  )
}

export default SupportChat
