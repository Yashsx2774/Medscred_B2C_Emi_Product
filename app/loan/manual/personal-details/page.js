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
import { useLoanFlow } from "@/app/contexts/LoanFlowContext";
import { useAuth } from "@/app/contexts/AuthContext";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { applicationId, setFlowDetails } = useLoanFlow();

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    pincode: "",
    sameAsPermanent: false,
    permanentProof: null,
    currentProof: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) router.push("/");
  }, [token, router]);

  const handleChange = (e) => {
    const { id, type, checked, files, value } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        sameAsPermanent: checked,
        currentProof: checked ? prev.permanentProof : null,
      }));
    } else if (type === "file") {
      const file = files[0];
      if (file) {
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/jpg",
          "image/png",
        ];

        if (!allowedTypes.includes(file.type)) {
          setError("Only PDF, JPEG, JPG, and PNG files are allowed.");
          e.target.value = null; // Reset invalid file input
          return;
        }

        setError("");
        setFormData((prev) => ({
          ...prev,
          [id]: file,
          ...(id === "permanentProof" && prev.sameAsPermanent
            ? { currentProof: file }
            : {}),
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  // ---------- MOCK SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fakeResponse = {
        success: true,
        message: "Personal details submitted successfully.",
        personalDetails: formData,
      };

      if (fakeResponse.success) {
        setFlowDetails((prev) => ({
          ...(prev || {}),
          ...formData,
          applicationId,
        }));

        router.push("/loan/manual/approval");
      } else {
        setError(fakeResponse.message || "Failed to submit details.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //   -----API POST calling
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setError("");
  //     setLoading(true);

  //     try {
  //       const formDataToSend = new FormData();
  //       formDataToSend.append("fullName", formData.fullName);
  //       formDataToSend.append("dob", formData.dob);
  //       formDataToSend.append("gender", formData.gender);
  //       formDataToSend.append("pincode", formData.pincode);
  //       formDataToSend.append("applicationId", applicationId);
  //       formDataToSend.append("sameAsPermanent", formData.sameAsPermanent);

  //       if (formData.permanentProof)
  //         formDataToSend.append("permanentProof", formData.permanentProof);

  //       if (formData.currentProof)
  //         formDataToSend.append("currentProof", formData.currentProof);

  //       const response = await fetch("/api/loan/personal-details", {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: formDataToSend,
  //       });

  //       const data = await response.json();

  //       if (data.success) {
  //         setFlowDetails((prev) => ({
  //           ...(prev || {}),
  //           ...formData,
  //           applicationId,
  //         }));

  //         router.push("/loan/manual/approval");
  //       } else {
  //         setError(data.message || "Failed to submit personal details.");
  //       }
  //     } catch (err) {
  //       console.error("Error submitting details:", err);
  //       setError("Something went wrong. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  // ------------------------------------------------------

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>
              Upload your address proof and personal information.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    placeholder="Male / Female / Other"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    type="number"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Address Proof Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Address Proof</h3>

                {/* Permanent Address Proof */}
                <div>
                  <Label htmlFor="permanentProof">
                    Permanent Address Proof
                  </Label>
                  <Input
                    id="permanentProof"
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png"
                    onChange={handleChange}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    (Accepted formats: PDF, JPEG, JPG, PNG)
                  </p>
                </div>

                {/* Same as Permanent Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    id="sameAsPermanent"
                    type="checkbox"
                    checked={formData.sameAsPermanent}
                    onChange={handleChange}
                  />
                  <Label htmlFor="sameAsPermanent">
                    Current address is same as permanent
                  </Label>
                </div>

                {/* Current Address Proof */}
                {!formData.sameAsPermanent && (
                  <div>
                    <Label htmlFor="currentProof">Current Address Proof</Label>
                    <Input
                      id="currentProof"
                      type="file"
                      accept=".pdf,.jpeg,.jpg,.png"
                      onChange={handleChange}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      (Accepted formats: PDF, JPEG, JPG, PNG)
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit & Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
