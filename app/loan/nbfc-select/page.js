"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getEligibleOffers, startApplication } from "../../services/apiService";
import { useLoanFlow } from "../../contexts/LoanFlowContext"; // --- 1. Naya hook import karo

const NBFCSelectionContent = () => {
  const [nbfcList, setNbfcList] = useState([]);
  const [selectedNBFCId, setSelectedNBFCId] = useState(""); // Renamed for clarity
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = parseFloat(searchParams.get("amount") || "0");
  const { loanAmount, setFlowDetails, hospitalId } = useLoanFlow();

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }
    if (!amount || amount <= 0) {
      router.push("/loan/treatment");
      return;
    }
    fetchNBFCOptions();
  }, [authLoading, token, user, amount]);

  const fetchNBFCOptions = async () => {
    try {
      const resp = await getEligibleOffers(token, amount);
      console.log("Fetched NBFC options:", resp);
      const offers = Array.isArray(resp?.offers) ? resp.offers : [];

      // --- CHANGE 1: DATA NORMALIZATION (Best Practice) ---
      // Har offer ke liye ek common 'id' field bana lo taaki aage confusion na ho.
      const formattedOffers = offers.map((offer) => ({
        ...offer,
        // Sabke liye ek hi 'id' use karo, chahe woh 'offerId' se aaye ya 'id' se.
        id: offer.offerId?.toString() || offer.id?.toString(),
      }));
      setNbfcList(formattedOffers);
    } catch (error) {
      console.error("Failed to fetch NBFC options:", error);
      setError("Failed to load NBFC options");
    }
  };

  const handleContinue = async () => {
    if (!selectedNBFCId) {
      setError("Please select an NBFC to continue");
      return;
    }

    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const selected = nbfcList.find((n) => n.id === selectedNBFCId);
      const payload = {
        loanOfferId: selected.offerId,
        type: selected.type,
        appliedAmount: amount,
        provider: selected.provider,
        hospitalId: hospitalId,
      };

      const res = await startApplication(token, payload);
      const appId = res?.applicationId;
      if (!appId) {
        throw new Error(
          "Could not create application. No application ID returned."
        );
      }

      setFlowDetails({ applicationId: appId });

      // --- 4. THE MAIN CHANGE: Ab offer ke type ke hisaab se user ko aage bhejo ---
      switch (selected.type) {
        case "PREAPPROVED":
          router.push(
            `/loan/pan-confirm?appId=${appId}&hospitalId=${hospitalId}&amount=${amount}`
          ); // ab URL mein kuch bhejne ki zaroorat nahi
          break;
        case "CREDITCARD":
          router.push(
            `/loan/creditcard?appId=${appId}&hospitalId=${hospitalId}&amount=${amount}`
          ); // ab URL mein kuch bhejne ki zaroorat nahi
          break;
        case "MANUAL":
        default:
          // Manual flow ke liye, EMI selection page par jao
          router.push(
            `/loan/manual/pan-details?appId=${appId}&hospitalId=${hospitalId}&amount=${amount}`
          ); // ab URL mein kuch bhejne ki zaroorat nahi
          break;
      }
    } catch (e) {
      console.error("Failed to start application:", e);
      // Show a more user-friendly error from the API if it exists
      setError(e.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            Select Your Financing Partner
          </CardTitle>
          <CardDescription>
            Choose from the best available options based on your eligibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nbfcList.length === 0 && !error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Loading financing options...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <RadioGroup
                value={selectedNBFCId}
                onValueChange={setSelectedNBFCId}
              >
                {nbfcList.map((nbfc) => (
                  // --- CHANGE 3: CLEANER JSX ---
                  // Ab hum har jagah simple `nbfc.id` use kar sakte hain
                  <Card
                    key={nbfc.id}
                    className={`cursor-pointer transition-all ${
                      selectedNBFCId === nbfc.id
                        ? "border-primary border-2"
                        : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <RadioGroupItem value={nbfc.id} id={nbfc.id} />
                        <Label
                          htmlFor={nbfc.id}
                          className="flex-1 cursor-pointer"
                        >
                          {/* ... (The rest of your card content is perfect) ... */}
                          <h3 className="text-lg font-semibold">
                            {nbfc.provider}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {nbfc.type}
                          </p>
                          {/* ... etc. ... */}
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>

              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-center">
                  {error}
                </div>
              )}

              <Button
                onClick={handleContinue}
                className="w-full"
                size="lg"
                disabled={loading || !selectedNBFCId}
              >
                {loading
                  ? "Starting Application..."
                  : "Continue to EMI Selection"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const NBFCSelectionPage = () => {
  return (
    // --- Suspense se wrap karo ---
    <Suspense fallback={<div>Loading...</div>}>
      <NBFCSelectionContent />
    </Suspense>
  );
};

export default NBFCSelectionPage;
