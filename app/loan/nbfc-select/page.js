'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const NBFCSelectionPage = () => {
  const [nbfcList, setNbfcList] = useState([])
  const [selectedNBFC, setSelectedNBFC] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const treatmentDetails = localStorage.getItem('treatmentDetails')
    if (!treatmentDetails) {
      router.push('/loan/treatment')
      return
    }

    fetchNBFCOptions()
  }, [user])

  const fetchNBFCOptions = async () => {
    try {
      const treatmentDetails = JSON.parse(localStorage.getItem('treatmentDetails'))
      const response = await fetch('/api/loan/check-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: user.phone,
          loanAmount: treatmentDetails.loanAmount
        })
      })

      const data = await response.json()
      if (data.success) {
        setNbfcList(data.nbfcOptions || [])
        localStorage.setItem('loanSessionToken', data.sessionToken)
      }
    } catch (error) {
      console.error('Failed to fetch NBFC options:', error)
      setError('Failed to load NBFC options')
    }
  }

  const handleContinue = () => {
    if (!selectedNBFC) {
      setError('Please select an NBFC to continue')
      return
    }

    setLoading(true)
    localStorage.setItem('selectedNBFC', selectedNBFC)
    
    // Route based on NBFC type
    const selected = nbfcList.find(n => n.id === selectedNBFC)
    if (selected) {
      switch (selected.approvalType) {
        case 'pre-approved':
          router.push('/loan/emi-select?type=preapproved')
          break
        case 'credit-card':
          router.push('/loan/emi-select?type=creditcard')
          break
        default:
          router.push('/loan/manual')
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Select Your NBFC Partner</CardTitle>
          <CardDescription>
            Choose from available NBFC options based on your eligibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nbfcList.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading NBFC options...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <RadioGroup value={selectedNBFC} onValueChange={setSelectedNBFC}>
                {nbfcList.map((nbfc) => (
                  <Card key={nbfc.id} className={`cursor-pointer transition-all ${
                    selectedNBFC === nbfc.id ? 'border-primary border-2' : ''
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <RadioGroupItem value={nbfc.id} id={nbfc.id} />
                        <Label htmlFor={nbfc.id} className="flex-1 cursor-pointer">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold">{nbfc.name}</h3>
                                <p className="text-sm text-muted-foreground">{nbfc.description}</p>
                              </div>
                              {nbfc.recommended && (
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Interest Rate</p>
                                <p className="text-sm font-semibold">{nbfc.interestRate}% p.a.</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Processing Fee</p>
                                <p className="text-sm font-semibold">{nbfc.processingFee}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Max Tenure</p>
                                <p className="text-sm font-semibold">{nbfc.maxTenure} months</p>
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleContinue} 
                className="w-full" 
                size="lg" 
                disabled={loading || !selectedNBFC}
              >
                {loading ? 'Processing...' : 'Continue to EMI Selection'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NBFCSelectionPage