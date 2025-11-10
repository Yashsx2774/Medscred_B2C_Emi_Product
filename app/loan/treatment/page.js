'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputField from '../../components/InputField'
import { getEligibleOffers, getHospitals } from '../../services/apiService'
import { useLoanFlow } from '../../contexts/LoanFlowContext'; // --- 1. Naya hook import karo

const TreatmentDetailsPage = () => {
  const { setFlowDetails } = useLoanFlow();
  const [hospitals, setHospitals] = useState([])
  const [selectedHospitalId, setSelectedHospitalId] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [hospitalIdFromUrl, setHospitalIdFromUrl] = useState(null)
  const [formData, setFormData] = useState({
    treatmentAmount: '',
    loanAmount: '',
    treatmentDescription: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHospitals, setLoadingHospitals] = useState(true)
  const [loadingHospitalDetails, setLoadingHospitalDetails] = useState(false)
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()

  // Step 4: Get hospitalId from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const hospitalId = searchParams.get('hospitalId')
      if (hospitalId) {
        const parsedId = parseInt(hospitalId)
        setHospitalIdFromUrl(parsedId)
        setSelectedHospitalId(parsedId)
      }
    }
  }, [])

  // Check authentication
  useEffect(() => {
    if (!user) {
      const searchParams = new URLSearchParams(window.location.search)
      const hospitalId = searchParams.get('hospitalId') || ''
      router.push(`/login?redirect=/loan/treatment${hospitalId ? `&hospitalId=${hospitalId}` : ''}`)
      return
    }
  }, [user, router])

  // Step 1: Fetch all hospitals on page load (only if no hospitalId in URL)
  useEffect(() => {
    const fetchHospitals = async () => {
      if (!token || hospitalIdFromUrl) return
      
      try {
        setLoadingHospitals(true)
        const data = await getHospitals(token)
        // Handle both array response and { success, hospitals } format
        const hospitalsList = Array.isArray(data) ? data : (data?.hospitals || [])
        setHospitals(hospitalsList)
      } catch (error) {
        console.error('Failed to fetch hospitals:', error)
        setError('Failed to load hospitals. Please refresh the page.')
      } finally {
        setLoadingHospitals(false)
      }
    }

    fetchHospitals()
  }, [token, hospitalIdFromUrl])

  // Step 3: When hospital is selected, fetch its details
  useEffect(() => {
    const fetchSelectedHospitalDetails = async () => {
      if (!selectedHospitalId || !token) return

      try {
        setLoadingHospitalDetails(true)
        
        // If we came from URL, fetch individual hospital
        if (hospitalIdFromUrl) {
          const data = await getHospitals(token, selectedHospitalId)
          // API returns array with single object: [{ id: 400, hospitalName: "Even Hospital" }]
          const hospital = Array.isArray(data) ? data[0] : (data?.hospital || data)
          
          if (hospital) {
            // Normalize the response to match our expected format
            setSelectedHospital({
              id: hospital.id,
              name: hospital.hospitalName || hospital.name,
              location: hospital.location || 'N/A',
              code: hospital.code || `H${hospital.id}`,
              type: hospital.type || 'Hospital'
            })
          }
        } else {
          // If dropdown selection, find from existing list
          const hospitalFromList = hospitals.find(h => h.id === selectedHospitalId)
          if (hospitalFromList) {
            setSelectedHospital({
              id: hospitalFromList.id,
              name: hospitalFromList.hospitalName || hospitalFromList.name,
              location: hospitalFromList.location || 'N/A',
              code: hospitalFromList.code || `H${hospitalFromList.id}`,
              type: hospitalFromList.type || 'Hospital'
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch hospital details:', error)
        setError('Failed to load hospital details.')
      } finally {
        setLoadingHospitalDetails(false)
      }
    }

    fetchSelectedHospitalDetails()
  }, [selectedHospitalId, token, hospitals, hospitalIdFromUrl])

  const handleHospitalSelect = (hospitalId) => {
    setSelectedHospitalId(parseInt(hospitalId))
    setError('') // Clear any previous errors
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
      // Step 5: Store treatment details with selectedHospitalId
      const treatmentData = {
        hospitalId: selectedHospitalId,
        hospitalCode: selectedHospital?.code,
        hospitalName: selectedHospital?.name,
        treatmentAmount: treatmentAmt,
        loanAmount: loanAmt,
        treatmentDescription: formData.treatmentDescription
      }
      localStorage.setItem('treatmentDetails', JSON.stringify(treatmentData))
      
      // Fetch eligible offers for this amount
      console.log("Calling Eligble Offers");
      const resp = await getEligibleOffers(token, loanAmt)
      console.log("Called Eligble Offers");
      console.log("Response", resp);
      const offers = Array.isArray(resp?.offers) ? resp.offers : []

       setFlowDetails({
                hospitalId: selectedHospitalId, // Maan lo aapne yeh state mein rakha hai
                loanAmount: parseFloat(formData.loanAmount)
            });
            
      if (offers.length > 0) {
        router.push(`/loan/nbfc-select?amount=${loanAmt}&hospitalId=${selectedHospitalId}`)
      } else {
        router.push(`/loan/manual?amount=${loanAmt}&hospitalId=${selectedHospitalId}`) // No offers, go to manual
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingHospitals || loadingHospitalDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {loadingHospitalDetails ? 'Loading hospital details...' : 'Loading hospitals...'}
          </p>
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
              {hospitalIdFromUrl ? 'Enter your treatment requirements' : 'Select your hospital and enter treatment requirements'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 2: Hospital Selection Dropdown - Only show if NO hospitalId in URL */}
            {!hospitalIdFromUrl && (
              <div className="mb-6">
                <label htmlFor="hospital-select" className="block text-sm font-medium mb-2">
                  Select Hospital <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={selectedHospitalId?.toString()} 
                  onValueChange={handleHospitalSelect}
                >
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue placeholder="Choose a hospital..." />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{hospital.hospitalName || hospital.name}</span>
                          {hospital.location && (
                            <span className="text-xs text-muted-foreground">{hospital.location}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 3: Show form only when hospital is selected */}
            {selectedHospital && (
              <div className="animate-fade-in-up">
                {/* Hospital Information Card */}
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
                      <div className="font-semibold text-blue-900">{selectedHospital.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-blue-700">Location:</span>
                      <div className="font-semibold text-blue-900">{selectedHospital.location}</div>
                    </div>
                    <div>
                      <span className="text-sm text-blue-700">Code:</span>
                      <div className="font-semibold text-blue-900">{selectedHospital.code}</div>
                    </div>
                    <div>
                      <span className="text-sm text-blue-700">Type:</span>
                      <div className="font-semibold text-blue-900">{selectedHospital.type}</div>
                    </div>
                  </div>
                </div>

                {/* Treatment Details Form */}
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
              </div>
            )}

            {/* Message when no hospital is selected - Only if no URL param */}
            {!selectedHospital && !loadingHospitals && !hospitalIdFromUrl && !loadingHospitalDetails && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-6xl mb-4">🏥</div>
                <p className="text-lg">Please select a hospital to continue</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TreatmentDetailsPage