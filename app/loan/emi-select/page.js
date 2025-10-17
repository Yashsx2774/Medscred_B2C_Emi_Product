'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, TrendingUp, Calendar, Percent, IndianRupee } from 'lucide-react'

const EMISelectionPage = () => {
  const [emiPlans, setEmiPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [loanDetails, setLoanDetails] = useState(null)
  const [customTenure, setCustomTenure] = useState(12)
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

  const calculateEMI = (principal, rate, tenure) => {
    const monthlyRate = rate / 12 / 100
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1)
    return Math.round(emi)
  }

  const generateEMIPlans = (loanAmount) => {
    const amount = parseFloat(loanAmount)
    const plans = [
      { id: '6m', tenure: 6, interestRate: 8.5, processingFee: 500 },
      { id: '12m', tenure: 12, interestRate: 9.5, processingFee: 750, recommended: true },
      { id: '18m', tenure: 18, interestRate: 10.5, processingFee: 1000 },
      { id: '24m', tenure: 24, interestRate: 11.5, processingFee: 1250 }
    ]

    const calculatedPlans = plans.map(plan => {
      const emi = calculateEMI(amount, plan.interestRate, plan.tenure)
      const totalAmount = emi * plan.tenure
      const totalInterest = totalAmount - amount

      const startDate = new Date()
      const firstEMIDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)

      return {
        ...plan,
        emi,
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        firstEMIDate: firstEMIDate.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        monthlySavings: plan.tenure > 6 ? Math.round((calculateEMI(amount, 8.5, 6) - emi)) : 0
      }
    })

    setEmiPlans(calculatedPlans)
  }

  const handleSubmit = async () => {
    if (!selectedPlan) return

    setLoading(true)

    try {
      const selectedEMI = emiPlans.find(p => p.id === selectedPlan)
      localStorage.setItem('selectedEMIPlan', JSON.stringify(selectedEMI))

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

  const customEMI = loanDetails ? calculateEMI(loanDetails.loanAmount, 9.5, customTenure) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Choose Your EMI Plan</h1>
          <p className="text-lg text-muted-foreground">Select a repayment plan that fits your budget perfectly</p>
        </div>

        {/* Loan Summary Card */}
        {loanDetails && (
          <Card className="mb-8 border-2 border-blue-200 shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Treatment Amount</div>
                  <div className="text-2xl font-bold text-blue-600">₹{loanDetails.treatmentAmount?.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Loan Amount</div>
                  <div className="text-2xl font-bold text-green-600">₹{loanDetails.loanAmount?.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Down Payment</div>
                  <div className="text-2xl font-bold text-gray-600">
                    ₹{(loanDetails.treatmentAmount - loanDetails.loanAmount).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Treatment</div>
                  <div className="text-lg font-semibold text-gray-700">{loanDetails.treatmentDescription}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* EMI Calculator Widget */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-green-50 border-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Quick EMI Calculator</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tenure (Months)</span>
                  <span className="text-sm font-semibold">{customTenure} months</span>
                </div>
                <Slider 
                  value={[customTenure]} 
                  onValueChange={(val) => setCustomTenure(val[0])}
                  min={6}
                  max={36}
                  step={6}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6 months</span>
                  <span>36 months</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Estimated Monthly EMI</div>
                  <div className="text-3xl font-bold text-blue-600">₹{customEMI.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total Payable</div>
                  <div className="text-xl font-semibold text-green-600">
                    ₹{(customEMI * customTenure).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMI Plans Grid */}
        {emiPlans.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Calculating your personalized EMI plans...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {emiPlans.map((plan, idx) => (
              <Card 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`cursor-pointer transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 animate-fade-in-up ${
                  selectedPlan === plan.id 
                    ? 'border-4 border-blue-500 shadow-xl scale-105' 
                    : 'border-2 hover:border-blue-300'
                } ${plan.recommended ? 'ring-4 ring-green-200' : ''}`}
                style={{ animationDelay: `${(idx + 3) * 100}ms` }}
              >
                <CardContent className="pt-6 relative">
                  {/* Recommended Badge */}
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 shadow-lg">
                        ⭐ Recommended
                      </Badge>
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {selectedPlan === plan.id && (
                    <div className="absolute top-4 left-4">
                      <CheckCircle className="w-6 h-6 text-blue-600 fill-blue-600" />
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Plan Header */}
                    <div className="text-center pb-4 border-b">
                      <h3 className="text-2xl font-bold mb-1">{plan.tenure} Months Plan</h3>
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Calendar className="w-4 h-4" />
                        First EMI: {plan.firstEMIDate}
                      </p>
                    </div>

                    {/* Monthly EMI - Highlight */}
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-4 text-center">
                      <div className="text-sm opacity-90 mb-1">Monthly Payment</div>
                      <div className="text-4xl font-bold flex items-center justify-center gap-1">
                        <IndianRupee className="w-8 h-8" />
                        {plan.emi.toLocaleString()}
                      </div>
                      <div className="text-xs opacity-75 mt-1">per month</div>
                    </div>

                    {/* Plan Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          <Percent className="w-3 h-3" />
                          Interest Rate
                        </div>
                        <div className="text-lg font-bold text-blue-600">{plan.interestRate}%</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Total Interest</div>
                        <div className="text-lg font-bold text-green-600">₹{plan.totalInterest.toLocaleString()}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Processing Fee</div>
                        <div className="text-lg font-bold text-purple-600">₹{plan.processingFee}</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Total Payable</div>
                        <div className="text-lg font-bold text-orange-600">₹{plan.totalAmount.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Savings Badge */}
                    {plan.monthlySavings > 0 && (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-700">
                          Save ₹{plan.monthlySavings.toLocaleString()}/month vs 6-month plan
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <Button 
            onClick={handleSubmit} 
            size="lg"
            disabled={loading || !selectedPlan}
            className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Continue to Verification →'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EMISelectionPage