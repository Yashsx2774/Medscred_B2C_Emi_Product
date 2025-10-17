'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import LoanCard from '../components/LoanCard'
import Link from 'next/link'

const DashboardPage = () => {
  const { user, token, loading } = useAuth()
  const [loans, setLoans] = useState([])
  const [loadingLoans, setLoadingLoans] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && token) {
      fetchLoans()
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
        <p className="text-muted-foreground">Manage your loans and apply for new ones</p>
      </div>

      {/* Quick Action Card */}
      <Card className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Need a Loan?</h2>
              <p className="text-white/90">Start your application process in just a few minutes</p>
            </div>
            <Link href="/loan/start">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Loan Application
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Ongoing Loans Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Loans</h2>
        
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
              <div className="text-6xl mb-4">📋</div>
              <CardTitle className="mb-2">No Active Loans</CardTitle>
              <CardDescription className="mb-4">
                You don't have any active loans at the moment
              </CardDescription>
              <Link href="/loan/start">
                <Button>Apply for a Loan</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DashboardPage