'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const HomePage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hospitalCode = searchParams.get('hospital') || 'H001'

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGetStarted = () => {
    router.push(`/signup?hospital=${hospitalCode}`)
  }

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🏥 Medical Financing Made Easy
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Medscred <span className="text-primary">MediAssist</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Healthcare Loans at Your Fingertips</p>
          <p className="text-sm text-muted-foreground mb-8">Powered by Empower Fintech Pvt Ltd</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" onClick={handleGetStarted}>
              Get Started
            </Button>
            <Link href={`/login?hospital=${hospitalCode}`}>
              <Button size="lg" variant="outline" className="text-lg px-8">Login</Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="border-2 hover:border-primary transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-4xl">⚡</span>
                Instant Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get pre-approved medical loans within minutes. Quick eligibility check and instant decisions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-4xl">🏥</span>
                Hospital Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Seamless integration with leading hospitals. Direct payment to healthcare providers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-4xl">💳</span>
                Flexible EMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Choose from multiple EMI plans. Affordable monthly payments with competitive interest rates.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">Scan the QR code at hospital reception desk</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Enter Details</h3>
              <p className="text-sm text-muted-foreground">Provide treatment and loan amount required</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Choose NBFC</h3>
              <p className="text-sm text-muted-foreground">Select from available financing partners</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Get Approved</h3>
              <p className="text-sm text-muted-foreground">Instant approval and quick disbursal</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-20 bg-primary/5 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose MediAssist?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-semibold mb-1">No Hidden Charges</h3>
                <p className="text-sm text-muted-foreground">Transparent pricing with clear EMI breakdown</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-semibold mb-1">Quick Processing</h3>
                <p className="text-sm text-muted-foreground">Get approval within 24-48 hours</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-semibold mb-1">Multiple NBFC Partners</h3>
                <p className="text-sm text-muted-foreground">Choose from trusted financial institutions</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Safe</h3>
                <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage