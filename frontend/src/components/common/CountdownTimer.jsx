import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

function getTimeLeft() {
  const now = new Date()
  // Reset every 24 hours from midnight
  const midnight = new Date()
  midnight.setHours(23, 59, 59, 0)
  const diff = Math.max(0, midnight - now)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { h, m, s }
}

function Digit({ value }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-b from-[#1E3A5F] to-[#162d4a] text-white font-black text-xl min-w-[42px] h-[42px] rounded-lg flex items-center justify-center shadow-lg border border-white/10 tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
    </div>
  )
}

function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-r from-[#F97316] to-orange-600 rounded-3xl px-6 py-5 flex items-center justify-between gap-6 shadow-xl shadow-orange-500/20 mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2.5 rounded-xl">
          <Zap size={24} className="text-white fill-white" />
        </div>
        <div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Limited Time Offer</p>
          <p className="text-white font-black text-xl leading-tight">Today's Flash Deals End In</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Digit value={time.h} />
        <span className="text-white font-black text-2xl -mt-1">:</span>
        <Digit value={time.m} />
        <span className="text-white font-black text-2xl -mt-1">:</span>
        <Digit value={time.s} />
      </div>
    </div>
  )
}

export default CountdownTimer
