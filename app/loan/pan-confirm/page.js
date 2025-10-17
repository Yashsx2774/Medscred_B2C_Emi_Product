'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import InputField from '../../components/InputField'

const PANConfirmPage = () => {
  const [panLast4, setPanLast4] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const sessionToken = localStorage.getItem('loanSessionToken')
    if (!sessionToken) {
      router.push('/loan/start')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (panLast4.length !== 4) {
      setError('Please enter exactly 4 digits')
      return
    }

    setLoading(true)

    try {
      const sessionToken = localStorage.getItem('loanSessionToken')
      const response = await fetch('/api/loan/verify-pan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Loan-Session': sessionToken
        },
        body: JSON.stringify({ panLast4 })
      })

      const data = await response.json()

      if (data.success) {
        router.push('/loan/thankyou')
      } else {
        setError(data.message || 'Verification failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">PAN Verification</CardTitle>
          <CardDescription>
            Enter the last 4 digits of your PAN card to confirm your identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="pan"
              label="Last 4 Digits of PAN"
              type="text"
              placeholder="Enter last 4 characters"
              value={panLast4}
              onChange={(e) => setPanLast4(e.target.value.toUpperCase())}
              maxLength="4"
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> If your PAN is ABCDE1234F, enter <strong>1234F</strong>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default PANConfirmPage