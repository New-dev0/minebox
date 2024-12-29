import { useState, useEffect } from 'react'

export function useScrollDirection() {
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY <= 0) {
        setIsHidden(false)
        return
      }

      if (currentScrollY > lastScrollY && !isHidden) { // Scrolling down
        setIsHidden(true)
      } else if (currentScrollY < lastScrollY && isHidden) { // Scrolling up
        setIsHidden(false)
      }

      setLastScrollY(currentScrollY)
    }

    const throttle = (func: Function, limit: number) => {
      let inThrottle: boolean
      return function(this: any, ...args: any[]) {
        if (!inThrottle) {
          func.apply(this, args)
          inThrottle = true
          setTimeout(() => inThrottle = false, limit)
        }
      }
    }

    const throttledControl = throttle(controlNavbar, 100)

    window.addEventListener('scroll', throttledControl)
    return () => window.removeEventListener('scroll', throttledControl)
  }, [lastScrollY, isHidden])

  return isHidden
} 