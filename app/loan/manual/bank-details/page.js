"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useLoanFlow } from "@/app/contexts/LoanFlowContext";
import { useAuth } from "@/app/contexts/AuthContext";

export default function BankDetailsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { applicationId, setFlowDetails } = useLoanFlow();

  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      // ✅ Temporary mock verification (replace with real API later)
      const fakeResponse = {
        success: true,
        message: "Bank details verified successfully.",
        bankDetails: formData,
      };

      const data = fakeResponse;

      if (data.success) {
        setFlowDetails({
          ...data.bankDetails,
          bankVerified: true,
          applicationId,
        });

        // ✅ Redirect to next step
        router.push("/loan/manual/personal-details");
      } else {
        setError(data.message || "Failed to verify bank details.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

    // APi call
    //     try {
    //   const response = await fetch("/api/loan/verify-bank", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify({
    //       ...formData,        // ✅ includes bank name, IFSC, account number, etc.
    //       applicationId,      // ✅ tie verification to current application
    //     }),
    //   });

    //   const data = await response.json();

    //   if (data.success) {
    //     // ✅ Store verified bank info in context
    //     setFlowDetails({
    //       ...data.bankDetails,
    //       bankVerified: true,
    //       applicationId,
    //     });

    //     // ✅ Proceed to next step
    //     router.push("/loan/manual/kyc-summary");
    //   } else {
    //     setError(data.message || "Failed to verify bank details.");
    //   }
    // } catch (err) {
    //   setError("Something went wrong during bank verification.");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bank Details Verification</CardTitle>
            <CardDescription>
              Please provide your bank account details for verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Account Holder Name
                </label>
                <Input
                  name="accountHolderName"
                  placeholder="Enter your name as per bank"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Account Number</label>
                <Input
                  name="accountNumber"
                  placeholder="Enter your account number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">IFSC Code</label>
                <Input
                  name="ifscCode"
                  placeholder="e.g. HDFC0001234"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bank Name</label>
                <Input
                  name="bankName"
                  placeholder="Enter your bank name"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Bank Details"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
