// Navigation optimization utilities

export const preloadRoutes = (routes: string[]) => {
  if (typeof window !== 'undefined') {
    routes.forEach(route => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = route
      document.head.appendChild(link)
    })
  }
}

export const optimizeImages = () => {
  if (typeof window !== 'undefined') {
    // Add loading="lazy" to images that are not in viewport
    const images = document.querySelectorAll('img:not([loading])')
    images.forEach((img: HTMLImageElement) => {
      img.loading = 'lazy'
      img.decoding = 'async'
    })
  }
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
