'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useLoanFlow } from '../../contexts/LoanFlowContext' // --- 1. Backpack ko import karo ---
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import InputField from '../../components/InputField'
import { updateApplicationStep } from '../../services/apiService'

const CreditCardContent = () => {
    const [cardLast4, setCardLast4] = useState(''); // Sirf last 4 digits ke liye state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, user, loading: authLoading } = useAuth();
    const { applicationId, clearFlowDetails } = useLoanFlow(); // --- 2. Backpack se saaman nikalo ---
    const router = useRouter();
    const searchParams = useSearchParams();

    const appId = searchParams.get('appId') || applicationId;
    console.log('====================================');
    console.log(appId);
    console.log('====================================');

    useEffect(() => {
        if (authLoading) return;
        if (!token || !user) {
            router.push('/login');
            return;
        }
        // Agar user direct is page par aa gaya, toh usko waapis bhejo
        if (!appId) {
            console.error("Application ID not found in flow, redirecting.");
            router.push('/loan/treatment');
        }
    }, [authLoading, token, user, appId, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- 3. Validation ko aasan karo ---
        if (!cardLast4 || cardLast4.length !== 4 || !/^\d+$/.test(cardLast4)) {
            setError('Please enter the last 4 digits of your credit card.');
            return;
        }

        setLoading(true);
        try {
            const stepData = {
                creditCardLast4: cardLast4,
                status: 'SUBMITTED' // Credit card flow yahan khatam ho jaata hai
            };
            // --- 4. Backpack se mila hua applicationId use karo ---
            await updateApplicationStep(token, appId, stepData);
            
            // Flow complete ho gaya, backpack khaali kar do taaki naya flow shuru ho sake
            clearFlowDetails(); 
            
            // Direct thank you page par bhejo
            router.push('/loan/thankyou');

        } catch (err) {
            console.error("Error submitting credit card details:", err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Confirm Credit Card</CardTitle>
                    <CardDescription>
                        Enter the last 4 digits of your credit card to complete the process.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* --- 5. UI ko aasan banao --- */}
                        <InputField
                            id="cardLast4"
                            label="Last 4 Digits of Card Number"
                            type="number" // Type 'number' se user aaram se number daal payega
                            placeholder="1234"
                            value={cardLast4}
                            onChange={(e) => setCardLast4(e.target.value)}
                            maxLength="4"
                            required
                        />

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                🔒 For your security, we only require the last 4 digits of your card.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || !appId}>
                            {loading ? 'Processing...' : 'Submit & Complete Loan'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

const CreditCardPage = () => {
  return (
    // --- Suspense se wrap karo ---
    <Suspense fallback={<div>Loading...</div>}>
      <CreditCardContent />
    </Suspense>
  )
}

export default CreditCardPage;
