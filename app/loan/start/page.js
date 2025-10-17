'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import InputField from '../../components/InputField'

const LoanStartPage = () => {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { token } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/loan/check-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (data.success) {
        // Create session token for this loan application
        localStorage.setItem('loanSessionToken', data.sessionToken)
        localStorage.setItem('loanPhone', phone)

        // Route based on loan type
        switch (data.loanType) {
          case 'pre-approved':
            router.push('/loan/preapproved')
            break
          case 'credit-card':
            router.push('/loan/creditcard')
            break
          case 'manual':
          default:
            router.push('/loan/manual')
            break
        }
      } else {
        setError(data.message || 'Failed to check eligibility')
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
          <CardTitle className="text-2xl">Start Your Loan Application</CardTitle>
          <CardDescription>
            Enter your mobile number to check your loan eligibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="phone"
              label="Mobile Number"
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength="10"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Checking Eligibility...' : 'Continue'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> We'll check your eligibility and show you the best loan options available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoanStartPage