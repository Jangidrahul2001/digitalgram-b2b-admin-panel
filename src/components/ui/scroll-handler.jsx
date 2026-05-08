import { useEffect } from "react"
// import { useLenis } from "../../hooks/use-lenis"

export function ScrollHandler() {
  // Use global Lenis scroll removed to prevent conflict with fixed viewport

  useEffect(() => {
    const scrollTimeouts = new WeakMap()

    const handleScroll = (e) => {
      // Existing scroll attribute logic...
      const target = e.target
      if (!target || typeof target.setAttribute !== 'function') return
      target.setAttribute('data-scrolling', 'true')
      if (scrollTimeouts.has(target)) clearTimeout(scrollTimeouts.get(target))
      const timeout = setTimeout(() => {
        target.removeAttribute('data-scrolling')
        scrollTimeouts.delete(target)
      }, 2000)
      scrollTimeouts.set(target, timeout)
    }

    window.addEventListener('scroll', handleScroll, { capture: true })

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [])

  return null
}
