'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const HomePage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
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
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-foreground">Welcome to LoanFlow</h1>
        <p className="text-xl text-muted-foreground mb-8">Get instant loan approvals with just a few clicks</p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">Login</Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">⚡</span>
              Instant Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get pre-approved loans instantly based on your profile
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">💳</span>
              Credit Card EMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Convert your purchases to easy EMIs with your credit card
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">📱</span>
              Easy Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Simple mobile-first application process with minimal documentation
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HomePage