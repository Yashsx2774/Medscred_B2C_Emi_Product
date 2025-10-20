'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, CreditCard, FileText, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

const FinancingMethodPage = () => {
  const [eligibility, setEligibility] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

    checkEligibility()
  }, [user])

  const checkEligibility = async () => {
    try {
      const response = await fetch('/api/loan/check-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: user.phone })
      })

      const data = await response.json()
      if (data.success) {
        setEligibility(data.eligibilityStatus)
        localStorage.setItem('loanSessionToken', data.sessionToken)
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (!selectedMethod) return

    setSubmitting(true)
    localStorage.setItem('selectedFinancingMethod', selectedMethod)
    
    // Navigate to NBFC selection with the chosen method
    router.push(`/loan/nbfc-select?method=${selectedMethod}`)
  }

  const financingMethods = [
    {
      id: 'pre-approved',
      title: 'Pre-Approved Loan',
      description: 'Instant approval with pre-verified limit',
      icon: Zap,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100',
      available: eligibility?.hasPreApproved || false,
      amount: eligibility?.preApprovedAmount,
      features: [
        'Instant approval',
        'No additional documents',
        'Lowest interest rates',
        'Quick disbursal'
      ],
      badge: 'Fastest',
      processingTime: '2-4 hours'
    },
    {
      id: 'credit-card',
      title: 'Credit Card EMI',
      description: 'Convert your treatment to easy EMIs',
      icon: CreditCard,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-100',
      available: eligibility?.hasCreditCard || false,
      amount: eligibility?.creditCardLimit,
      features: [
        'Use existing credit card',
        'No extra paperwork',
        'Flexible tenure options',
        'Same day approval'
      ],
      badge: 'Convenient',
      processingTime: '4-6 hours'
    },
    {
      id: 'manual',
      title: 'Standard Loan Application',
      description: 'Complete application for customized financing',
      icon: FileText,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-100',
      available: true, // Always available
      amount: null,
      features: [
        'Higher loan amounts',
        'Customized terms',
        'Multiple NBFC options',
        'Competitive rates'
      ],
      badge: 'Flexible',
      processingTime: '24-48 hours'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking your eligibility...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-block bg-gradient-to-r from-blue-100 to-green-100 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            💳 Step 2 of 5
          </div>
          <h1 className="text-4xl font-bold mb-3 gradient-text">Choose Your Financing Method</h1>
          <p className="text-lg text-muted-foreground">Select the option that works best for you</p>
        </div>

        {/* Financing Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
          {financingMethods.map((method, idx) => (
            <Card
              key={method.id}
              onClick={() => method.available && setSelectedMethod(method.id)}
              className={`relative overflow-hidden transition-all duration-300 cursor-pointer animate-fade-in-up ${
                !method.available 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-2xl hover:-translate-y-2'
              } ${
                selectedMethod === method.id
                  ? 'border-4 border-blue-500 shadow-2xl scale-105'
                  : 'border-2 hover:border-blue-300'
              }`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <CardContent className="pt-6 pb-8 relative">
                {/* Background Gradient Blob */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${method.bgGradient} rounded-full -mr-16 -mt-16 blur-3xl opacity-50`}></div>

                {/* Badge */}
                {method.available && (
                  <div className="absolute top-4 right-4">
                    <Badge className={`bg-gradient-to-r ${method.gradient} text-white border-0`}>
                      {method.badge}
                    </Badge>
                  </div>
                )}

                {!method.available && method.id !== 'manual' && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">Not Available</Badge>
                  </div>
                )}

                {/* Selected Check */}
                {selectedMethod === method.id && (
                  <div className="absolute top-4 left-4">
                    <CheckCircle className="w-8 h-8 text-blue-600 fill-blue-600" />
                  </div>
                )}

                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title & Description */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>

                  {/* Amount (if available) */}
                  {method.available && method.amount && (
                    <div className={`bg-gradient-to-r ${method.bgGradient} rounded-xl p-4 text-center`}>
                      <div className="text-xs text-muted-foreground mb-1">Available Amount</div>
                      <div className={`text-2xl font-bold text-${method.color}-600`}>
                        ₹{method.amount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-2 pt-2">
                    {method.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 mt-0.5 text-${method.color}-600 flex-shrink-0`} />
                        <span className={!method.available && method.id !== 'manual' ? 'text-gray-400' : ''}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Processing Time */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span>Processing: {method.processingTime}</span>
                    </div>
                  </div>

                  {/* Select Button */}
                  {method.available ? (
                    <Button
                      className={`w-full bg-gradient-to-r ${method.gradient} hover:opacity-90 text-white`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMethod(method.id)
                      }}
                    >
                      {selectedMethod === method.id ? 'Selected' : 'Select This Option'}
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled className="w-full">
                      Not Eligible
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="max-w-3xl mx-auto mb-8 border-2 border-blue-200 bg-blue-50 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Choose the Best Option for You</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Pre-Approved:</strong> Fastest option with pre-verified eligibility</li>
                  <li>• <strong>Credit Card EMI:</strong> Use your existing card for instant approval</li>
                  <li>• <strong>Standard Application:</strong> Best for larger amounts with customized terms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={!selectedMethod || submitting}
            className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                Continue to NBFC Selection <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FinancingMethodPage