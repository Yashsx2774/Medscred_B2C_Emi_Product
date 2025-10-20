'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
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

      // Navigate to financing method selection instead of NBFC directly
      router.push('/loan/financing-method')
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 flex justify-center">
        <Card className="w-full max-w-2xl shadow-xl border-2 animate-fade-in-up">
          <CardHeader>
            <div className="text-center mb-2">
              <div className="inline-block bg-gradient-to-r from-blue-100 to-green-100 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🏥 Step 1 of 5
              </div>
            </div>
            <CardTitle className="text-3xl text-center">Treatment Details</CardTitle>
            <CardDescription className="text-center text-base">
              Enter your treatment and loan requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Hospital Information */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl">
                  🏥
                </div>
                <h3 className="text-lg font-semibold text-blue-900">Hospital Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-blue-700">Name:</span>
                  <div className="font-semibold text-blue-900">{hospitalDetails.name}</div>
                </div>
                <div>
                  <span className="text-sm text-blue-700">Location:</span>
                  <div className="font-semibold text-blue-900">{hospitalDetails.location}</div>
                </div>
                <div>
                  <span className="text-sm text-blue-700">Code:</span>
                  <div className="font-semibold text-blue-900">{hospitalDetails.code}</div>
                </div>
                <div>
                  <span className="text-sm text-blue-700">Type:</span>
                  <div className="font-semibold text-blue-900">{hospitalDetails.type}</div>
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

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Loan amount must be less than or equal to treatment amount. Minimum loan amount is ₹1,000.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg" 
                size="lg" 
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Continue to Financing Options →'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TreatmentDetailsPage