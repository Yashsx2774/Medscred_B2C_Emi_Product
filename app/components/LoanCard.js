'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const LoanCard = ({ loan }) => {
  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    completed: 'bg-blue-500'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{loan.type}</CardTitle>
            <CardDescription>Loan ID: {loan.id}</CardDescription>
          </div>
          <Badge className={statusColors[loan.status]}>
            {loan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">₹{loan.amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Next Payment:</span>
            <span className="font-semibold">{loan.nextPayment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-semibold capitalize">{loan.status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanCard