/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

function TopProgressBar() {
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const location = useLocation()

  useEffect(() => {
    // Start progress bar on route change
    setVisible(true)
    setWidth(0)

    // Fast jump to 30%, then slow crawl to 90%
    const t1 = setTimeout(() => setWidth(30), 50)
    const t2 = setTimeout(() => setWidth(65), 200)
    const t3 = setTimeout(() => setWidth(90), 500)

    // Complete and hide
    const t4 = setTimeout(() => setWidth(100), 700)
    const t5 = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 900)

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [location.pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 z-[99999] h-[3px] transition-all ease-out pointer-events-none"
      style={{
        width: `${width}%`,
        transitionDuration: width === 30 ? '150ms' : width === 100 ? '200ms' : '400ms',
        background: 'linear-gradient(90deg, #F97316, #ff6b00, #ffad60)',
        boxShadow: '0 0 10px #F97316, 0 0 5px #ff6b00',
      }}
    />
  )
}

export default TopProgressBar
