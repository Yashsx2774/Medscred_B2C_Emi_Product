'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const ThankYouContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appId = searchParams.get('appId')
  const { token, user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!token || !user) {
      router.push('/login')
      return
    }
  }, [loading, token, user, router])

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-center mb-4">
            <div className="text-8xl mb-6">✅</div>
            <CardTitle className="text-3xl text-green-600 mb-2">Thank You!</CardTitle>
            <CardDescription className="text-lg">
              Your loan application has been submitted successfully
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2 text-blue-900">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-2 text-left">
              <li>• Our team will review your application</li>
              <li>• You'll receive a confirmation via SMS and email</li>
              <li>• Processing typically takes 24-48 hours</li>
              <li>• Check your dashboard for updates</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full" size="lg">
                Go to Dashboard
              </Button>
            </Link>
            
            <Link href="/loan/treatment" className="block">
              <Button variant="outline" className="w-full">
                Apply for Another Loan
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a href="tel:1800-123-4567" className="text-primary hover:underline">
                1800-123-4567
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const ThankYouPage = () => {
  return (
    // --- Suspense se wrap karo ---
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}

export default ThankYouPage