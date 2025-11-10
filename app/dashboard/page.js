'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import LoanCard from '../components/LoanCard'
import { Zap, CreditCard, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { checkEligibilityAndGetOffers, getOngoingLoans } from '../services/apiService'

const DashboardContent = () => {
  const { user, token, loading } = useAuth()
  const [loans, setLoans] = useState([])
  const [eligibility, setEligibility] = useState(null)
  const [loadingLoans, setLoadingLoans] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  // Changed from 'hospital' to 'hospitalId' for consistency
  const hospitalId = searchParams.get('hospitalId') || searchParams.get('hospital') || null

  // Toggle to force dashboard to use mock data
  const USE_DASHBOARD_MOCK = false
  const isMock = USE_DASHBOARD_MOCK

  // Mock data for dashboard view
  const MOCK_ELIGIBILITY = {
    hasPreApproved: true,
    preApprovedAmount: 150000,
    hasCreditCard: true,
    creditCardLimit: 80000,
  }

  const MOCK_LOANS = [
    {
      id: 'mock-loan-1',
      type: 'Pre-Approved Loan',
      amount: 120000,
      status: 'active',
      nextPayment: '15 Nov 2025',
      tenure: 18,
      interestRate: 10.5,
    },
    {
      id: 'mock-loan-2',
      type: 'Credit Card EMI',
      amount: 45000,
      status: 'pending',
      nextPayment: '10 Nov 2025',
      tenure: 12,
      interestRate: 12.0,
    },
  ]

  const MOCK_USER = {
    id: 'mock-user-1',
    name: 'Medscred User',
    email: 'user@example.com',
    phoneNumber: '9876543210',
  }

  const currentUser = isMock ? (user || MOCK_USER) : user

  useEffect(() => {
    if (isMock) return
    if (loading) return
    // Avoid false redirect during rehydration if data is present in localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
    const hasStoredSession = !!storedToken && !!storedUser
    if (!token && !user && !hasStoredSession) {
      router.push('/login')
    }
  }, [isMock, user, token, loading, router])

  useEffect(() => {
    if (isMock || (user && token)) {
      fetchLoans()
      checkEligibility()
    }
  }, [isMock, user, token])

  const fetchLoans = async () => {
    if (USE_DASHBOARD_MOCK) {
      // Simulate brief network delay for nicer UX
      setTimeout(() => {
        setLoans(MOCK_LOANS)
        setLoadingLoans(false)
      }, 250)
      return
    }

    try {
      const data = await getOngoingLoans(token)
      setLoans(Array.isArray(data.loans) ? data.loans : [])
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    } finally {
      setLoadingLoans(false)
    }
  }

  const checkEligibility = async () => {
    if (USE_DASHBOARD_MOCK) {
      setTimeout(() => setEligibility(MOCK_ELIGIBILITY), 150)
      return
    }

    try {
      console.log('Checking eligibility with token:', token)
      console.log('Requesting eligibility for amount: 50000')
      const data = await checkEligibilityAndGetOffers(token, 50000)
      setEligibility(data.eligibilityStatus || null)
    } catch (error) {
      console.error('Failed to check eligibility:', error)
    }
  }

  const handleStartApplication = () => {
    // If hospitalId is present in URL, pass it to treatment page
    // Otherwise, user will select from dropdown
    if (hospitalId) {
      router.push(`/loan/treatment?hospitalId=${hospitalId}`)
    } else {
      router.push(`/loan/treatment`)
    }
  }

  if (!isMock && (loading || !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section with Animation */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {getGreeting()}, <span className="gradient-text">{currentUser.name}</span>! 👋
          </h1>
          <p className="text-lg text-muted-foreground">Let's take care of your healthcare financing needs</p>
        </div>

        {/* Eligibility Cards - Enhanced Design */}
        {eligibility && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Pre-Approved Card */}
            <div 
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                eligibility.hasPreApproved 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
              style={{ animationDelay: '100ms' }}
            >
              {eligibility.hasPreApproved && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      eligibility.hasPreApproved ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Pre-Approved Loans</h3>
                      <p className="text-sm text-muted-foreground">Instant approval</p>
                    </div>
                  </div>
                  <Badge className={eligibility.hasPreApproved ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'}>
                    {eligibility.hasPreApproved ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                
                {eligibility.hasPreApproved ? (
                  <>
                    <div className="bg-white/80 backdrop-blur rounded-xl p-4 mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Pre-approved Amount</p>
                      <p className="text-3xl font-bold text-green-600">₹{eligibility.preApprovedAmount?.toLocaleString()}</p>
                      <Progress value={75} className="mt-2 h-2" />
                    </div>
                    <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Ready to use - Apply now!
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to unlock pre-approved offers
                  </p>
                )}
              </div>
            </div>

            {/* Credit Card EMI Card */}
            <div 
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 animate-fade-in-up ${
                eligibility.hasCreditCard 
                  ? 'bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-300 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
              style={{ animationDelay: '200ms' }}
            >
              {eligibility.hasCreditCard && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      eligibility.hasCreditCard ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Credit Card EMI</h3>
                      <p className="text-sm text-muted-foreground">Instant EMI</p>
                    </div>
                  </div>
                  <Badge className={eligibility.hasCreditCard ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'}>
                    {eligibility.hasCreditCard ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                
                {eligibility.hasCreditCard ? (
                  <>
                    <div className="bg-white/80 backdrop-blur rounded-xl p-4 mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Available Limit</p>
                      <p className="text-3xl font-bold text-blue-600">₹{eligibility.creditCardLimit?.toLocaleString()}</p>
                      <Progress value={60} className="mt-2 h-2" />
                    </div>
                    <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Convert to easy EMI options
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Apply for credit card to unlock instant EMI
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA Card - Redesigned */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="pt-8 pb-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1">
                <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm mb-3">
                  🎉 Quick & Easy Process
                </div>
                <h2 className="text-3xl font-bold mb-2">Need Medical Financing?</h2>
                <p className="text-white/90 text-lg">Get approved in minutes with flexible EMI options tailored for you</p>
              </div>
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                onClick={handleStartApplication}
              >
                Start Application <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Loans Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Your Medical Loans
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Track and manage your active loans</p>
            </div>
          </div>
          
          {loadingLoans ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : loans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.map((loan, idx) => (
                <div key={loan.id} className="animate-fade-in-up" style={{ animationDelay: `${(idx + 5) * 100}ms` }}>
                  <LoanCard loan={loan} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏥</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No Active Loans</h3>
                <p className="text-muted-foreground mb-6">
                  Start your first medical loan application today
                </p>
                <Button onClick={handleStartApplication} className="bg-gradient-to-r from-blue-600 to-green-600">
                  Apply for Medical Loan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

const DashboardPage = () => {
  return (
    // --- Suspense se wrap karo ---
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

export default DashboardPage
