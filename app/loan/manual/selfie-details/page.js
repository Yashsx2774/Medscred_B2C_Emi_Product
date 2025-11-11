// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2, Camera, RotateCcw } from "lucide-react";
// import { useLoanFlow } from "@/app/contexts/LoanFlowContext";
// import { useAuth } from "@/app/contexts/AuthContext";

// export default function SelfieVerificationPage() {
//   const router = useRouter();
//   const { token } = useAuth();
//   const { applicationId, setFlowDetails } = useLoanFlow();
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [imageCaptured, setImageCaptured] = useState(false);
//   const [imageData, setImageData] = useState(null);
//   const [attemptsLeft, setAttemptsLeft] = useState(5); // ✅ user can capture max 5 times

//   useEffect(() => {
//     if (!token) router.push("/");
//   }, [token, router]);

//   // ✅ start camera on mount
//   useEffect(() => {
//     startCamera();
//     return () => stopCamera();
//   }, []);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) videoRef.current.srcObject = stream;
//     } catch (err) {
//       setError("Unable to access camera. Please allow permission.");
//     }
//   };

//   const stopCamera = () => {
//     const stream = videoRef.current?.srcObject;
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//     }
//   };

//   // ✅ Capture selfie
//   const captureImage = () => {
//     if (attemptsLeft <= 0) {
//       setError(
//         "You’ve used all 5 attempts. Please proceed or refresh the page."
//       );
//       return;
//     }

//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     if (!canvas || !video) return;

//     const context = canvas.getContext("2d");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const image = canvas.toDataURL("image/png");
//     setImageData(image);
//     setImageCaptured(true);
//     stopCamera();
//     setAttemptsLeft((prev) => prev - 1);
//   };

//   // ✅ Retake selfie
//   const retakeSelfie = () => {
//     if (attemptsLeft <= 0) {
//       setError(
//         "You’ve used all 5 attempts. Please proceed or refresh the page."
//       );
//       return;
//     }

//     setImageCaptured(false);
//     setImageData(null);
//     setError("");
//     startCamera();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (attemptsLeft <= 0) {
//       setError("You’ve used all 5 attempts. Application rejected.");
//       return; // ❌ stop further verification
//     }

//     if (!imageData) {
//       setError("Please capture a selfie before continuing.");
//       return;
//     }

//     setLoading(true);

//     // MOCK DATA TESTING
//     try {
//       // Simulated backend verification delay
//       await new Promise((resolve) => setTimeout(resolve, 1500));

//       // Mock verification logic
//       const faceMatch = Math.random() > 0.3; // 70% chance to pass (for testing)
//       const data = {
//         success: faceMatch,
//         message: faceMatch
//           ? "Selfie verified successfully."
//           : "Face mismatch. Please try again.",
//       };

//       if (data.success) {
//         setFlowDetails({
//           applicationId: applicationId || "mock-app-2025",
//           selfieVerified: true,
//         });
//         router.push("/loan/manual/bank-details");
//       } else {
//         setError(data.message);
//         setAttemptsLeft((prev) => prev - 1);

//         // ❌ If all 5 attempts are now used up, reject the process
//         if (attemptsLeft - 1 <= 0) {
//           setError("Maximum attempts reached. Application rejected.");
//           stopCamera();
//           setImageCaptured(false);
//           setImageData(null);
//         }
//       }
//     } catch {
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }

//     // ---------------- REAL API VERIFICATION SECTION ----------------

//     //   try {
//     //   const response = await fetch("/api/loan/verify-selfie", {
//     //     method: "POST",
//     //     headers: {
//     //       "Content-Type": "application/json",
//     //       Authorization: `Bearer ${token}`,
//     //     },
//     //     body: JSON.stringify({
//     //       applicationId,
//     //       selfie: imageData, // ✅ base64 image
//     //     }),
//     //   });

//     //   const data = await response.json();

//     //   if (data.success) {
//     //     // ✅ Verification passed
//     //     setFlowDetails({
//     //       ...data.flowDetails,
//     //       selfieVerified: true,
//     //     });

//     //     router.push("/loan/manual/bank-details");
//     //   } else {
//     //     // ❌ Verification failed
//     //     setError(data.message || "Selfie verification failed.");
//     //     setAttemptsLeft((prev) => prev - 1);

//     //     // ❌ Reject after all 5 attempts
//     //     if (attemptsLeft - 1 <= 0) {
//     //       setError("Maximum attempts reached. Application rejected.");
//     //       stopCamera();
//     //       setImageCaptured(false);
//     //       setImageData(null);

//     //       // OPTIONAL: reject or mark status via API
//     //       try {
//     //         await fetch("/api/loan/reject-application", {
//     //           method: "POST",
//     //           headers: {
//     //             "Content-Type": "application/json",
//     //             Authorization: `Bearer ${token}`,
//     //           },
//     //           body: JSON.stringify({
//     //             applicationId,
//     //             reason: "Selfie verification failed 5 times",
//     //           }),
//     //         });
//     //       } catch (rejectErr) {
//     //         console.error("Error marking rejection:", rejectErr);
//     //       }
//     //     }
//     //   }
//     // } catch (err) {
//     //   setError("Something went wrong during selfie verification.");
//     // } finally {
//     //   setLoading(false);
//     // }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container max-w-2xl py-8">
//         <Card className="mt-6">
//           <CardHeader>
//             <CardTitle>Selfie Verification</CardTitle>
//             <CardDescription>
//               Capture a live selfie for identity verification. You have{" "}
//               <span className="font-semibold">{attemptsLeft}</span> attempt
//               {attemptsLeft !== 1 ? "s" : ""} remaining.
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4 text-center">
//               {!imageCaptured ? (
//                 <>
//                   <div className="flex justify-center">
//                     <video
//                       ref={videoRef}
//                       autoPlay
//                       className="rounded-lg border shadow-md w-full max-w-sm"
//                     />
//                   </div>

//                   <Button
//                     type="button"
//                     onClick={captureImage}
//                     className="w-full flex items-center justify-center"
//                   >
//                     <Camera className="mr-2 h-4 w-4" /> Capture Selfie
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <div className="flex justify-center">
//                     <img
//                       src={imageData}
//                       alt="Captured selfie"
//                       className="rounded-lg border shadow-md w-full max-w-sm"
//                     />
//                   </div>

//                   <div className="flex gap-3">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={retakeSelfie}
//                       disabled={attemptsLeft <= 0}
//                       className="w-1/2"
//                     >
//                       <RotateCcw className="mr-2 h-4 w-4" /> Retake
//                     </Button>

//                     <Button
//                       type="submit"
//                       className="w-1/2"
//                       disabled={loading || attemptsLeft <= 0}
//                     >
//                       {loading ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           Verifying...
//                         </>
//                       ) : (
//                         "Verify & Continue"
//                       )}
//                     </Button>
//                   </div>
//                 </>
//               )}
//               <canvas ref={canvasRef} hidden />
//               {error && (
//                 <Alert variant="destructive" className="mt-4">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera, RotateCcw } from "lucide-react";
import { useLoanFlow } from "@/app/contexts/LoanFlowContext";
import { useAuth } from "@/app/contexts/AuthContext";

export default function SelfieVerificationPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { applicationId, setFlowDetails } = useLoanFlow();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageCaptured, setImageCaptured] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  // Camera state
  const [cameraAvailable, setCameraAvailable] = useState(true);

  // ✅ Check token only once properly
  useEffect(() => {
    if (token === null) return; // wait until token is loaded
    if (!token) router.push("/");
  }, [token, router]);

  // ✅ Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // ✅ Handle camera setup and fallback gracefully
  const startCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((device) => device.kind === "videoinput");

      if (!hasCamera) {
        setCameraAvailable(false);
        setError("No camera found on this device.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      setCameraAvailable(true);
      setError("");
    } catch (err) {
      console.warn("Camera access error:", err);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setCameraAvailable(false);
        setError("Camera permission denied. Please upload your photo instead.");
      } else {
        setCameraAvailable(false);
        setError("Unable to access camera. You can upload a photo instead.");
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // ✅ Capture selfie
  const captureImage = () => {
    if (attemptsLeft <= 0) {
      setError("You’ve used all 5 attempts. Please refresh the page.");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");
    setImageData(image);
    setImageCaptured(true);
    stopCamera();
    setAttemptsLeft((prev) => prev - 1);
  };

  // ✅ Retake selfie or re-upload
  const retakeSelfie = () => {
    if (attemptsLeft <= 0) {
      setError("You’ve used all 5 attempts. Please refresh the page.");
      return;
    }
    setImageCaptured(false);
    setImageData(null);
    setError("");
    if (cameraAvailable) startCamera();
  };

  // ✅ Handle verify logic (mock)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (attemptsLeft <= 0) {
      setError("You’ve used all 5 attempts. Application rejected.");
      return;
    }

    if (!imageData) {
      setError("Please capture or upload a selfie before continuing.");
      return;
    }

    setLoading(true);

    try {
      // Mock verification delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Fake verification result (70% success)
      const faceMatch = Math.random() > 0.3;
      const data = {
        success: faceMatch,
        message: faceMatch
          ? "Selfie verified successfully."
          : "Face mismatch. Please try again.",
      };

      if (data.success) {
        setFlowDetails({
          applicationId: applicationId || "mock-app-2025",
          selfieVerified: true,
        });
        router.push("/loan/manual/bank-details");
      } else {
        setError(data.message);
        setAttemptsLeft((prev) => prev - 1);

        if (attemptsLeft - 1 <= 0) {
          setError("Maximum attempts reached. Application rejected.");
          stopCamera();
          setImageCaptured(false);
          setImageData(null);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Selfie Verification</CardTitle>
            <CardDescription>
              Capture a live selfie for identity verification. You have{" "}
              <span className="font-semibold">{attemptsLeft}</span> attempt
              {attemptsLeft !== 1 ? "s" : ""} remaining.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 text-center">
              {!imageCaptured ? (
                <>
                  {cameraAvailable ? (
                    <>
                      <div className="flex justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          className="rounded-lg border shadow-md w-full max-w-sm"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={captureImage}
                        className="w-full flex items-center justify-center"
                      >
                        <Camera className="mr-2 h-4 w-4" /> Capture Selfie
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        No camera detected or permission denied. Please upload a
                        recent photo for verification.
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setImageData(reader.result);
                              setImageCaptured(true);
                              setError("");
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                      />

                      <Button
                        type="button"
                        onClick={startCamera}
                        variant="outline"
                        className="mt-3"
                      >
                        Try Enabling Camera Again
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <img
                      src={imageData}
                      alt="Captured selfie"
                      className="rounded-lg border shadow-md w-full max-w-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={retakeSelfie}
                      disabled={attemptsLeft <= 0}
                      className="w-1/2"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Retake
                    </Button>

                    <Button
                      type="submit"
                      className="w-1/2"
                      disabled={loading || attemptsLeft <= 0}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Continue"
                      )}
                    </Button>
                  </div>
                </>
              )}

              <canvas ref={canvasRef} hidden />

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
