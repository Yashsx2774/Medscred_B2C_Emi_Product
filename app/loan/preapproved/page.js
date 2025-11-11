'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const PreApprovedPage = () => {
  const [loanDetails, setLoanDetails] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const sessionToken = localStorage.getItem('loanSessionToken')
    if (!sessionToken) {
      router.push('/loan/start')
      return
    }

    // Mock loan details - would come from API in production
    setLoanDetails({
      amount: 500000,
      tenure: 24,
      interestRate: 9.5,
      emi: 23000
    })
  }, [router])

  if (!loanDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl text-green-600">Congratulations!</CardTitle>
            <CardDescription className="text-lg mt-2">
              You have been pre-approved for a loan
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-center">Your Loan Offer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-2xl font-bold text-primary">₹{loanDetails.amount.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground">Tenure</p>
                <p className="text-2xl font-bold text-primary">{loanDetails.tenure} Months</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-2xl font-bold text-primary">{loanDetails.interestRate}%</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                <p className="text-2xl font-bold text-primary">₹{loanDetails.emi.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Next Step:</strong> Please verify your PAN details to proceed with the loan
            </p>
          </div>

          <Link href="/loan/pan-confirm">
            <Button className="w-full" size="lg">
              Proceed to PAN Verification
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default PreApprovedPage