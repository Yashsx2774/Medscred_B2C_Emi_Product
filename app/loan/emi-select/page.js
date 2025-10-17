'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const EMISelectionPage = () => {
  const [emiPlans, setEmiPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [loanDetails, setLoanDetails] = useState(null)
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const loanType = searchParams.get('type')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const treatmentDetails = localStorage.getItem('treatmentDetails')
    const selectedNBFC = localStorage.getItem('selectedNBFC')
    
    if (!treatmentDetails || !selectedNBFC) {
      router.push('/loan/treatment')
      return
    }

    const treatment = JSON.parse(treatmentDetails)
    setLoanDetails(treatment)
    generateEMIPlans(treatment.loanAmount)
  }, [user])

  const generateEMIPlans = (loanAmount) => {
    const amount = parseFloat(loanAmount)
    const plans = [
      {
        id: '6m',
        tenure: 6,
        interestRate: 8.5,
        processingFee: 500
      },
      {
        id: '12m',
        tenure: 12,
        interestRate: 9.5,
        processingFee: 750,
        recommended: true
      },
      {
        id: '18m',
        tenure: 18,
        interestRate: 10.5,
        processingFee: 1000
      },
      {
        id: '24m',
        tenure: 24,
        interestRate: 11.5,
        processingFee: 1250
      }
    ]

    const calculatedPlans = plans.map(plan => {
      const monthlyRate = plan.interestRate / 12 / 100
      const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, plan.tenure)) / 
                  (Math.pow(1 + monthlyRate, plan.tenure) - 1)
      const totalAmount = emi * plan.tenure
      const totalInterest = totalAmount - amount

      const startDate = new Date()
      const firstEMIDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)

      return {
        ...plan,
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        firstEMIDate: firstEMIDate.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })
      }
    })

    setEmiPlans(calculatedPlans)
  }

  const handleSubmit = async () => {
    if (!selectedPlan) {
      return
    }

    setLoading(true)

    try {
      const selectedEMI = emiPlans.find(p => p.id === selectedPlan)
      localStorage.setItem('selectedEMIPlan', JSON.stringify(selectedEMI))

      // Route based on loan type
      if (loanType === 'preapproved') {
        router.push('/loan/pan-confirm')
      } else if (loanType === 'creditcard') {
        router.push('/loan/creditcard')
      } else {
        router.push('/loan/manual')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Select Your EMI Plan</CardTitle>
          <CardDescription>
            Choose a repayment tenure that suits your budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loanDetails && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Treatment Amount</p>
                  <p className="text-lg font-semibold">₹{loanDetails.treatmentAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-semibold text-primary">₹{loanDetails.loanAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {emiPlans.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Calculating EMI plans...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                {emiPlans.map((plan) => (
                  <Card key={plan.id} className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id ? 'border-primary border-2' : ''
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <RadioGroupItem value={plan.id} id={plan.id} />
                        <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold">{plan.tenure} Months Plan</h3>
                                <p className="text-sm text-muted-foreground">
                                  First EMI on {plan.firstEMIDate}
                                </p>
                              </div>
                              {plan.recommended && (
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Monthly EMI</p>
                                <p className="text-lg font-bold text-primary">₹{plan.emi.toLocaleString()}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Interest Rate</p>
                                <p className="text-sm font-semibold">{plan.interestRate}% p.a.</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Total Interest</p>
                                <p className="text-sm font-semibold">₹{plan.totalInterest.toLocaleString()}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Processing Fee</p>
                                <p className="text-sm font-semibold">₹{plan.processingFee}</p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Payable: ₹{plan.totalAmount.toLocaleString()} over {plan.tenure} months
                            </div>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>

              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                size="lg" 
                disabled={loading || !selectedPlan}
              >
                {loading ? 'Processing...' : 'Continue to Verification'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EMISelectionPage