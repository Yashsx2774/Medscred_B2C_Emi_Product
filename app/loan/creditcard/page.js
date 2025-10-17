'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import InputField from '../../components/InputField'

const CreditCardPage = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })
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
    setLoading(true)

    try {
      const sessionToken = localStorage.getItem('loanSessionToken')
      const response = await fetch('/api/loan/map-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Loan-Session': sessionToken
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        router.push('/loan/thankyou')
      } else {
        setError(data.message || 'Card mapping failed')
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
          <CardTitle className="text-2xl">Credit Card Details</CardTitle>
          <CardDescription>
            Enter your credit card details to process instant EMI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="cardNumber"
              label="Card Number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              maxLength="16"
              required
            />

            <InputField
              id="cardHolderName"
              label="Card Holder Name"
              type="text"
              placeholder="Name as on card"
              value={formData.cardHolderName}
              onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="expiryMonth"
                label="Expiry Month"
                type="text"
                placeholder="MM"
                value={formData.expiryMonth}
                onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                maxLength="2"
                required
              />

              <InputField
                id="expiryYear"
                label="Expiry Year"
                type="text"
                placeholder="YY"
                value={formData.expiryYear}
                onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                maxLength="2"
                required
              />
            </div>

            <InputField
              id="cvv"
              label="CVV"
              type="password"
              placeholder="123"
              value={formData.cvv}
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
              maxLength="3"
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🔒 Your card details are encrypted and secure
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : 'Map Card & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreditCardPage