"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useNavigation() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateWithLoading = useCallback(async (href: string, delay = 300) => {
    setIsNavigating(true)
    
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Prefetch the route for faster navigation
      router.prefetch(href)
      
      // Navigate to the route
      router.push(href)
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      // Reset loading state after navigation
      setTimeout(() => setIsNavigating(false), 500)
    }
  }, [router])

  return {
    isNavigating,
    navigateWithLoading
  }
}
