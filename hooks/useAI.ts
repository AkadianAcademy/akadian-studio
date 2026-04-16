import { useState } from 'react'

interface UseAIOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useAI(endpoint: string, options: UseAIOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function call(body: Record<string, any>, token: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        options.onError?.(data.error)
      } else {
        options.onSuccess?.(data)
      }
      return data
    } catch (e: any) {
      setError(e.message)
      options.onError?.(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { call, loading, error }
}
