import { useEffect, useRef } from 'react'

const messages = [
  '🔥 FLASH SALE — Up to 70% OFF on Electronics!',
  '🚚 FREE Delivery on orders above ₹499',
  '🎉 New Arrivals Every Week — Stay Tuned!',
  '🏷️ Use Code NEHA10 for Extra 10% off',
  '⭐ Rated #1 Shopping App by 50,000+ Customers',
  '↩️ 7-Day Easy Returns — No Questions Asked',
  '💳 EMI Available on Orders above ₹999',
  '📦 Same-Day Delivery in Select Cities!',
]

function AnnouncementBar() {
  const trackRef = useRef(null)

  return (
    <div className="bg-gradient-to-r from-[#1E3A5F] via-[#0f2540] to-[#1E3A5F] text-white py-2 overflow-hidden relative border-b border-white/10">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#1E3A5F] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#1E3A5F] to-transparent z-10 pointer-events-none" />

      <div
        ref={trackRef}
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 35s linear infinite' }}
      >
        {/* Duplicate for seamless loop */}
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-[12px] font-semibold text-gray-200 px-8">
            {msg}
            <span className="text-[#F97316] mx-2 text-lg leading-none">•</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee:hover { animation-play-state: paused; }
      `}</style>
    </div>
  )
}

export default AnnouncementBar
