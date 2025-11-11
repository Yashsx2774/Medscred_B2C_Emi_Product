"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useLoanFlow } from "@/app/contexts/LoanFlowContext"; // ✅ Correct import for your context
import { useAuth } from "@/app/contexts/AuthContext";

export default function PANDetailsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { applicationId, setFlowDetails } = useLoanFlow(); // ✅ Using context here

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    pan: "",
    dob: "",
    fullName: "",
  });

  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePAN(formData.pan)) {
      setError("Invalid PAN format. Format: XXXXX9999X");
      return;
    }

    if (!formData.dob || !formData.fullName) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const data = {
        success: true,
        applicationId: "CLZPJ2422W", // fake ID for testing
      };

      if (data.success) {
        setFlowDetails({ applicationId: data.applicationId });
        router.push("/loan/manual/adhar-details");
      } else {
        setError("PAN verification failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

    // ---------------------------in this it was POST and Response JSON from Backend side
    // try {
    //   const response = await fetch("/api/loan/verify-pan", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify({
    //       ...formData,
    //       applicationId, // ✅ Added applicationId from context
    //     }),
    //   });

    //   const data = await response.json();

    //   if (data.success) {
    //     // ✅ Optionally store name or any details in the context
    //     setFlowDetails({ applicationId: data.applicationId || applicationId });

    //     router.push("/loan/manual/adhar-details"); // 👈 change as per your structure
    //   } else {
    //     setError(data.message || "PAN verification failed");
    //   }
    // } catch (err) {
    //   setError("Something went wrong. Please try again.");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>PAN & Date of Birth</CardTitle>
            <CardDescription>
              Enter your PAN details for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <div className="space-y-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  placeholder="XXXXX9999X"
                  value={formData.pan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pan: e.target.value.toUpperCase(),
                    })
                  }
                  maxLength={10}
                  className="uppercase"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Format: 5 letters, 4 digits, 1 letter
                </p>
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  placeholder="XXXXX9999X"
                  value={formData.pan}
                  onChange={(e) => {
                    const input = e.target.value.toUpperCase();
                    setFormData({ ...formData, pan: input });

                    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                    const partialRegex = /^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/;

                    // ✅ Validate at every step
                    if (!partialRegex.test(input)) {
                      setError(
                        "PAN must be 5 letters, 4 digits, then 1 letter (e.g., ABCDE1234F)"
                      );
                    } else if (input.length === 10 && !panRegex.test(input)) {
                      setError("Invalid PAN format. Must match XXXXX9999X");
                    } else {
                      setError("");
                    }
                  }}
                  maxLength={10}
                  className="uppercase"
                  required
                />

                <p className="text-xs text-muted-foreground">
                  Format: 5 letters, 4 digits, 1 letter
                </p>

                {/* ✅ Show red alert instantly if invalid */}
                {formData.pan.length > 0 && error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="As per PAN card"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Name will be auto-populated after PAN verification
                </p>
              </div>

              {/* {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )} */}

              <Button type="submit" className="w-full" disabled={loading}>
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
