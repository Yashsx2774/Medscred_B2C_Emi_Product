// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2 } from "lucide-react";
// import { useLoanFlow } from "@/app/contexts/LoanFlowContext"; // ✅ Current context
// import { useAuth } from "@/app/contexts/AuthContext";

// export default function AadhaarDetailsPage() {
//   const router = useRouter();
//   const { token } = useAuth();
//   const { applicationId, setFlowDetails } = useLoanFlow();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [aadhaar, setAadhaar] = useState("");
//   const [consent, setConsent] = useState(false);

//   // ✅ Redirect to login if token missing
//   useEffect(() => {
//     if (!token) router.push("/");
//   }, [token, router]);

//   // ✅ Format Aadhaar number (12 digits only)
//   const formatAadhaar = (value) => value.replace(/\D/g, "").slice(0, 12);

//   // ✅ Handle Aadhaar verification + OTP initiation
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (aadhaar.length !== 12) {
//       setError("Aadhaar number must be 12 digits");
//       return;
//     }

//     if (!consent) {
//       setError("Please provide consent to proceed");
//       return;
//     }

//     setLoading(true);

//     // Mock Code use to check process remove and uncomment the api code
//     try {
//       const fakeAadhaar = "123412341234";
//       const fakeOtp = "000000";
//       // pretend we verified the OTP locally
//       const shouldSucceed = fakeOtp === "000000"; // simple rule - adjust as needed

//       // Simulated response object (same shape your code expects)
//       const data = shouldSucceed
//         ? { success: true, applicationId: "fake-app-1234" }
//         : { success: false, message: "Invalid OTP (mock)" };

//       if (data.success) {
//         setFlowDetails({
//           aadhaar: fakeAadhaar,
//           applicationId: data.applicationId,
//         });
//         router.push("/loan/manual/selfie-details");
//       } else {
//         setError(data.message || "Failed to verify Aadhaar (mock).");
//       }
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }

// // try {
// //   const response = await fetch("/api/loan/initiate-aadhaar-otp", {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //       Authorization: `Bearer ${token}`,
// //     },
// //     body: JSON.stringify({
// //       aadhaar,
// //       applicationId, // ✅ send current app ID
// //     }),
// //   });

// //   const data = await response.json();

// //   if (data.success) {
// //     // ✅ Save Aadhaar in flow context
// //     setFlowDetails({
// //       aadhaar,
// //       applicationId: data.applicationId || applicationId,
// //     });

// //         // ✅ Go to next step (bank details)
// //         router.push("/loan/manual/selfie-details");
// //       } else {
// //         setError(data.message || "Failed to verify Aadhaar");
// //       }
// //     } catch (err) {
// //       setError("Something went wrong. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container max-w-2xl py-8">
//         <Card className="mt-6">
//           <CardHeader>
//             <CardTitle>Aadhaar Verification</CardTitle>
//             <CardDescription>
//               Enter your Aadhaar number for verification and OTP confirmation
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="aadhaar">Aadhaar Number</Label>
//                 <Input
//                   id="aadhaar"
//                   placeholder="XXXX XXXX XXXX"
//                   value={aadhaar}
//                   onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
//                   maxLength={12}
//                   inputMode="numeric"
//                   required
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Enter your 12-digit Aadhaar number
//                 </p>
//               </div>

//               <div className="flex items-start space-x-2">
//                 <Checkbox
//                   id="consent"
//                   checked={consent}
//                   onCheckedChange={setConsent}
//                 />
//                 <label
//                   htmlFor="consent"
//                   className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                 >
//                   I consent to use my Aadhaar for KYC verification and authorize
//                   verification through OTP.
//                 </label>
//               </div>

//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={loading || !consent}
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Verifying Aadhaar...
//                   </>
//                 ) : (
//                   "Verify & Continue"
//                 )}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useLoanFlow } from "@/app/contexts/LoanFlowContext"; // ✅ Current context
import { useAuth } from "@/app/contexts/AuthContext";

export default function AadhaarDetailsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { applicationId, setFlowDetails } = useLoanFlow();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [consent, setConsent] = useState(false);

  // ✅ Added states for OTP process
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // ✅ Redirect to login if token missing
  useEffect(() => {
    if (!token) router.push("/");
  }, [token, router]);

  // ✅ Format Aadhaar number (12 digits only)
  const formatAadhaar = (value) => value.replace(/\D/g, "").slice(0, 12);

  // ✅ Step 1: Handle Aadhaar submission and OTP initiation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (aadhaar.length !== 12) {
      setError("Aadhaar number must be 12 digits");
      return;
    }

    if (!consent) {
      setError("Please provide consent to proceed");
      return;
    }

    setLoading(true);

    // ✅ Mock flow for checking process (no API)
    try {
      // If OTP not yet sent → send OTP first
      if (!otpSent) {
        // Simulate sending OTP
        setTimeout(() => {
          setOtpSent(true);
          setLoading(false);
        }, 1000);
        return;
      }

      // If OTP is being entered → verify it
      const fakeOtp = "000000";
      const shouldSucceed = otp === fakeOtp;

      const data = shouldSucceed
        ? { success: true, applicationId: "fake-app-1234" }
        : { success: false, message: "Invalid OTP" };

      if (data.success) {
        setFlowDetails({
          aadhaar,
          applicationId: data.applicationId,
        });
        router.push("/loan/manual/selfie-details");
      } else {
        setError(data.message || "OTP verification failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

    // -----------------------Same AS PAN , POST to JSON Response
    // try {
    //   const response = await fetch("/api/loan/initiate-aadhaar-otp", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify({
    //       aadhaar,
    //       applicationId, // ✅ send current app ID
    //     }),
    //   });

    //   const data = await response.json();

    //   if (data.success) {
    //     // ✅ Save Aadhaar in flow context
    //     setFlowDetails({
    //       aadhaar,
    //       applicationId: data.applicationId || applicationId,
    //     });

    //     // ✅ Go to next step (bank details)
    //     router.push("/loan/manual/selfie-details");
    //   } else {
    //     setError(data.message || "Failed to verify Aadhaar");
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
            <CardTitle>Aadhaar Verification</CardTitle>
            <CardDescription>
              Enter your Aadhaar number for verification and OTP confirmation
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Aadhaar Field */}
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  placeholder="XXXX XXXX XXXX"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                  maxLength={12}
                  inputMode="numeric"
                  required
                  disabled={otpSent} // disable once OTP sent
                />
                <p className="text-xs text-muted-foreground">
                  Enter your 12-digit Aadhaar number
                </p>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={setConsent}
                  disabled={otpSent} // disable once OTP sent
                />
                <label
                  htmlFor="consent"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I consent to use my Aadhaar for KYC verification and authorize
                  verification through OTP.
                </label>
              </div>

              {/* OTP Input (visible only after sending OTP) */}
              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    maxLength={6}
                    inputMode="numeric"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the OTP received on your registered mobile number
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Dynamic Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !consent}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {otpSent ? "Verifying OTP..." : "Sending OTP..."}
                  </>
                ) : otpSent ? (
                  "Verify OTP & Continue"
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
