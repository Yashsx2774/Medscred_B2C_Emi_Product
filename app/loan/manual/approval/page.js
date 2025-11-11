"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useLoanFlow } from "@/app/contexts/LoanFlowContext";
import { useAuth } from "@/app/contexts/AuthContext";

export default function LoanApprovalPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { flowDetails } = useLoanFlow();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Temporary mock OTP check
      const fakeOtp = "000000";
      const data =
        otp === fakeOtp
          ? {
              success: true,
              message: "Loan approved successfully!",
            }
          : { success: false, message: "Invalid OTP. Please try again." };

      if (data.success) {
        // ✅ Proceed to next page (loan summary)
        router.push("/loan/thankyou");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong during approval.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Loan Approval Verification</CardTitle>
            <CardDescription>
              Enter the OTP sent to your registered mobile number to approve
              your loan.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Enter OTP
                </label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  className="mt-1"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
