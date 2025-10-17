'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import InputField from '../../components/InputField'

const TreatmentDetailsPage = () => {
  const [hospitalDetails, setHospitalDetails] = useState(null)
  const [formData, setFormData] = useState({
    treatmentAmount: '',
    loanAmount: '',
    treatmentDescription: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hospitalCode = searchParams.get('hospital') || 'H001'

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/loan/treatment&hospital=${hospitalCode}`)
      return
    }
    fetchHospitalDetails()
  }, [user, hospitalCode])

  const fetchHospitalDetails = async () => {
    try {
      const response = await fetch(`/api/hospital/details?code=${hospitalCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setHospitalDetails(data.hospital)
      }
    } catch (error) {
      console.error('Failed to fetch hospital details:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const treatmentAmt = parseFloat(formData.treatmentAmount)
    const loanAmt = parseFloat(formData.loanAmount)

    if (loanAmt > treatmentAmt) {
      setError('Loan amount cannot be more than treatment amount')
      return
    }

    if (loanAmt < 1000) {
      setError('Minimum loan amount is ₹1,000')
      return
    }

    setLoading(true)

    try {
      // Store treatment details in session
      const treatmentData = {
        hospitalCode,
        treatmentAmount: treatmentAmt,
        loanAmount: loanAmt,
        treatmentDescription: formData.treatmentDescription
      }
      localStorage.setItem('treatmentDetails', JSON.stringify(treatmentData))

      // Proceed to eligibility check
      router.push('/loan/nbfc-select')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!hospitalDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading hospital details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Treatment Details</CardTitle>
          <CardDescription>
            Enter your treatment and loan requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Hospital Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">Hospital Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Name:</span>
                <span className="font-semibold text-blue-900">{hospitalDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Location:</span>
                <span className="font-semibold text-blue-900">{hospitalDetails.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Hospital Code:</span>
                <span className="font-semibold text-blue-900">{hospitalDetails.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Type:</span>
                <span className="font-semibold text-blue-900">{hospitalDetails.type}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              id="treatmentDescription"
              label="Treatment Description"
              type="text"
              placeholder="e.g., Cardiac Surgery, Orthopedic Treatment"
              value={formData.treatmentDescription}
              onChange={(e) => setFormData({ ...formData, treatmentDescription: e.target.value })}
              required
            />

            <InputField
              id="treatmentAmount"
              label="Treatment Amount (₹)"
              type="number"
              placeholder="Enter total treatment cost"
              value={formData.treatmentAmount}
              onChange={(e) => setFormData({ ...formData, treatmentAmount: e.target.value })}
              required
              min="1000"
            />

            <InputField
              id="loanAmount"
              label="Loan Amount Required (₹)"
              type="number"
              placeholder="Enter loan amount needed"
              value={formData.loanAmount}
              onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
              required
              min="1000"
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Loan amount must be less than or equal to treatment amount. Minimum loan amount is ₹1,000.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Processing...' : 'Continue to NBFC Selection'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default TreatmentDetailsPage