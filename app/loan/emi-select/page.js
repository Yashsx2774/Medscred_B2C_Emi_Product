'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, TrendingUp, Calendar, Percent, IndianRupee } from 'lucide-react'
import { selectEmiForApplication, getEmiPlans } from '../../services/apiService'
import { useLoanFlow } from '../../contexts/LoanFlowContext'; // --- 1. Naya hook import karo


const EMISelectionContent = () => {
    const [emiPlans, setEmiPlans] = useState([])
    const [selectedPlanId, setSelectedPlanId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [customTenure, setCustomTenure] = useState(12)
    
    const { user, token, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
        const { hospitalId, loanAmount, applicationId } = useLoanFlow();
    
    // Get all necessary parameters from the URL
    const appId = searchParams.get('appId') || applicationId;
    // const loanAmount = parseFloat(searchParams.get('amount') || '0')
    // const hospitalId = searchParams.get('hospitalId')

    // Helper function for EMI calculation
    const calculateEMI = (principal, rate, tenure) => {
        if (!principal || !tenure) return 0;
        const monthlyRate = rate / 12 / 100;
        if (monthlyRate === 0) {
            return Math.round(principal / tenure);
        }
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                    (Math.pow(1 + monthlyRate, tenure) - 1);
        return Math.round(emi);
    };

    useEffect(() => {
        if (authLoading) return;
        
        if (!token || !user) {
            router.push('/login');
            return;
        }

        // Validate that all required parameters are present in the URL
        if (!appId || !loanAmount || !hospitalId) {
            setError("Important information is missing from the URL. Please start the process again.");
            console.error("Missing required URL params: appId, amount, or hospitalId");
            setIsPageLoading(false);
            return;
        }

        const fetchAndCalculatePlans = async () => {
            setIsPageLoading(true);
            try {
                // Pass the hospitalId to the API call to get specific plans
                const masterPlans = await getEmiPlans(token, appId); 
                
                if (!Array.isArray(masterPlans) || masterPlans.length === 0) {
                    throw new Error("No EMI plans are available for this hospital at the moment.");
                }

                // Calculate display details for each plan on the frontend
                const calculatedPlans = masterPlans.map(plan => {
                    const emi = calculateEMI(loanAmount, plan.interest, plan.months);
                    const totalAmount = emi * plan.months;
                    const totalInterest = totalAmount - loanAmount;
                    return {
                        ...plan,
                        emi,
                        totalAmount: Math.round(totalAmount),
                        totalInterest: Math.round(totalInterest),
                    };
                });
                setEmiPlans(calculatedPlans);

            } catch (err) {
                console.error("Failed to fetch or calculate EMI plans:", err);
                setError(err.message || "Could not load EMI plans. Please refresh the page or try again later.");
            } finally {
                setIsPageLoading(false);
            }
        };

        fetchAndCalculatePlans();
    }, [authLoading, user, token, appId, loanAmount, hospitalId, router]); // Added hospitalId to dependency array

    const handleSubmit = async () => {
        if (!selectedPlanId) {
            setError("Please select an EMI plan to continue.");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await selectEmiForApplication(token, appId, selectedPlanId);
            if (response && response.applicationId) {
                router.push(`/loan/thankyou?appId=${appId}`);
            } else {
                throw new Error("Failed to save the selected EMI plan.");
            }
        } catch (err) {
            console.error('Error submitting EMI plan:', err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const customEMI = calculateEMI(loanAmount, 0, customTenure);

    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Calculating personalized EMI plans for your hospital...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 animate-fade-in-up">
                    <h1 className="text-4xl font-bold mb-3 gradient-text">Choose Your EMI Plan</h1>
                    <p className="text-lg text-muted-foreground">For a loan of <span className="font-bold text-primary">₹{loanAmount.toLocaleString()}</span>, select a plan that fits your budget.</p>
                </div>

                {/* The rest of the UI (Calculator and Plan Cards) remains the same */}
                <Card className="mb-8 bg-gradient-to-br from-blue-50 to-green-50 border-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">Quick EMI Calculator</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Tenure (Months)</span>
                                    <span className="text-sm font-semibold">{customTenure} months</span>
                                </div>
                                <Slider 
                                    value={[customTenure]} 
                                    onValueChange={(val) => setCustomTenure(val[0])}
                                    min={3}
                                    max={18}
                                    step={3}
                                    className="mb-2"
                                />
                            </div>
                            <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-muted-foreground">Estimated Monthly EMI</div>
                                    <div className="text-3xl font-bold text-blue-600">₹{customEMI.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Total Payable</div>
                                    <div className="text-xl font-semibold text-green-600">₹{(customEMI * customTenure).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {emiPlans.map((plan, idx) => (
                        <Card 
                            key={plan.planId}
                            onClick={() => setSelectedPlanId(plan.planId)}
                            className={`cursor-pointer transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 animate-fade-in-up ${
                                selectedPlanId === plan.planId 
                                ? 'border-4 border-blue-500 shadow-xl scale-105' 
                                : 'border-2 hover:border-blue-300'
                            }`}
                            style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                        >
                            <CardContent className="pt-6 relative">
                                {selectedPlanId === plan.planId && (
                                    <div className="absolute top-4 left-4"><CheckCircle className="w-6 h-6 text-blue-600 fill-blue-600" /></div>
                                )}
                                <div className="space-y-4">
                                    <div className="text-center pb-4 border-b">
                                        <h3 className="text-2xl font-bold mb-1">{plan.months} Months Plan</h3>
                                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Repay in {plan.months} months
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-4 text-center">
                                        <div className="text-sm opacity-90 mb-1">Monthly Payment</div>
                                        <div className="text-4xl font-bold flex items-center justify-center gap-1">
                                            <IndianRupee className="w-8 h-8" />
                                            {plan.estimatedMonthlyEmi.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {error && <p className="text-center text-red-600 mb-4">{error}</p>}

                <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                    <Button 
                        onClick={handleSubmit} 
                        size="lg"
                        disabled={loading || !selectedPlanId || emiPlans.length === 0}
                        className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                    >
                        {loading ? 'Saving Plan...' : 'Confirm and Continue →'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

const EMISelectionPage = () => {
  return (
    // --- Suspense se wrap karo ---
    <Suspense fallback={<div>Loading...</div>}>
      <EMISelectionContent />
    </Suspense>
  )
}

export default EMISelectionPage;