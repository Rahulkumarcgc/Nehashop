import { useState, useEffect } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'

function FloatingButtons() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 350)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-6 right-5 z-[9990] flex flex-col items-center gap-3">

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        title="Back to Top"
        className={`w-11 h-11 bg-[#1E3A5F] hover:bg-[#F97316] text-white rounded-full flex items-center justify-center shadow-lg shadow-black/30 transition-all duration-300 hover:scale-110
          ${showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <ArrowUp size={20} />
      </button>

      {/* WhatsApp Support — always visible */}
      <a
        href="https://wa.me/916205839760?text=Hi%2C%20I%20need%20help%20with%20my%20NehaShop%20order!"
        target="_blank"
        rel="noreferrer"
        title="Chat on WhatsApp"
        className="relative w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full flex items-center justify-center shadow-xl shadow-green-900/30 transition-all duration-300 hover:scale-110"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <MessageCircle size={26} fill="white" className="relative z-10" />
      </a>
    </div>
  )
}

export default FloatingButtons
