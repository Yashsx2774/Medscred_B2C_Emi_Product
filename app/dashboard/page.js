'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LoanCard from '../components/LoanCard'
import Link from 'next/link'

const DashboardPage = () => {
  const { user, token, loading } = useAuth()
  const [loans, setLoans] = useState([])
  const [eligibility, setEligibility] = useState(null)
  const [loadingLoans, setLoadingLoans] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const hospitalCode = searchParams.get('hospital') || 'H001'

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && token) {
      fetchLoans()
      checkEligibility()
    }
  }, [user, token])

  const fetchLoans = async () => {
    try {
      const response = await fetch('/api/loan/ongoing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setLoans(data.loans)
      }
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    } finally {
      setLoadingLoans(false)
    }
  }

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
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error)
    }
  }

  const handleStartApplication = () => {
    router.push(`/loan/treatment?hospital=${hospitalCode}`)
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Manage your medical loans and apply for new ones</p>
      </div>

      {/* Eligibility Status Cards */}
      {eligibility && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className={`border-2 ${
            eligibility.hasPreApproved ? 'border-green-300 bg-green-50' : 'border-gray-200'
          }`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">⚡</div>
                  <div>
                    <h3 className="text-lg font-semibold">Pre-Approved Loans</h3>
                    <p className="text-sm text-muted-foreground">Instant medical loan approval</p>
                  </div>
                </div>
                {eligibility.hasPreApproved && (
                  <Badge className="bg-green-500">Available</Badge>
                )}
                {!eligibility.hasPreApproved && (
                  <Badge variant="secondary">Not Available</Badge>
                )}
              </div>
              {eligibility.hasPreApproved && (
                <div className="bg-white rounded p-3 mb-3">
                  <p className="text-xs text-muted-foreground">Pre-approved Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{eligibility.preApprovedAmount?.toLocaleString()}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {eligibility.hasPreApproved 
                  ? 'Start application to avail instant approval' 
                  : 'Complete profile to check eligibility'}
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 ${
            eligibility.hasCreditCard ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
          }`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">💳</div>
                  <div>
                    <h3 className="text-lg font-semibold">Credit Card EMI</h3>
                    <p className="text-sm text-muted-foreground">Convert treatment to easy EMIs</p>
                  </div>
                </div>
                {eligibility.hasCreditCard && (
                  <Badge className="bg-blue-500">Available</Badge>
                )}
                {!eligibility.hasCreditCard && (
                  <Badge variant="secondary">Not Available</Badge>
                )}
              </div>
              {eligibility.hasCreditCard && (
                <div className="bg-white rounded p-3 mb-3">
                  <p className="text-xs text-muted-foreground">Available Limit</p>
                  <p className="text-xl font-bold text-blue-600">₹{eligibility.creditCardLimit?.toLocaleString()}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {eligibility.hasCreditCard 
                  ? 'Use your credit card for instant EMI' 
                  : 'Apply for credit card to unlock this feature'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Action Card */}
      <Card className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Need Medical Financing?</h2>
              <p className="text-white/90">Start your medical loan application in just a few minutes</p>
            </div>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8"
              onClick={handleStartApplication}
            >
              Start Application
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ongoing Loans Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Medical Loans</h2>
        
        {loadingLoans ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading loans...</p>
          </div>
        ) : loans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🏥</div>
              <CardTitle className="mb-2">No Active Loans</CardTitle>
              <CardDescription className="mb-4">
                You don't have any active medical loans at the moment
              </CardDescription>
              <Button onClick={handleStartApplication}>
                Apply for Medical Loan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DashboardPage