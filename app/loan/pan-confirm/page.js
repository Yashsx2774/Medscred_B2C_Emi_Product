'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useLoanFlow } from '../../contexts/LoanFlowContext' // --- 1. Backpack ko import karo ---
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import InputField from '../../components/InputField' // Assuming you have this custom component
import { updateApplicationStep } from '../../services/apiService'

const PANConfirmPage = () => {
    const [pan, setPan] = useState(''); // State ka naam 'pan' rakho, 'panLast4' nahi
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, user, loading: authLoading } = useAuth();
    const { applicationId, hospitalId, loanAmount } = useLoanFlow(); // --- 2. Backpack se applicationId nikalo ---
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!token || !user) {
            router.push('/login');
            return;
        }
        // Agar user direct is page par aa gaya aur backpack mein appId nahi hai, toh waapis bhejo
        if (!applicationId) {
            console.error("Application ID not found in flow, redirecting.");
            router.push('/loan/treatment'); // Flow ke start mein bhejo
        }
    }, [authLoading, token, user, applicationId, router]); // applicationId ko dependency mein daalo

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- 3. Poore 10-digit PAN ki validation karo ---
        const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
        if (!pan || !panRegex.test(pan.toUpperCase())) {
            setError('Please enter a valid 10-character PAN (e.g., ABCDE1234F)');
            return;
        }

        setLoading(true);
        try {
            const stepData = { 
                pan: pan.toUpperCase(), 
                status: 'PAN_ENTERED' 
            };
            // --- 4. Backpack se mila hua applicationId use karo ---
            await updateApplicationStep(token, applicationId, stepData);
            
            // PAN update karne ke baad, EMI selection page par jao.
            // Ab URL mein kuch bhejne ki zaroorat nahi hai.
            router.push(`/loan/emi-select?applicationId=${applicationId}&hospitalId=${hospitalId}&amount=${loanAmount}`);

        } catch (err) {
            console.error("Error updating PAN:", err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">PAN Verification</CardTitle>
                    <CardDescription>
                        Please enter your 10-character PAN to proceed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputField
                            id="pan"
                            label="PAN Number"
                            type="text"
                            placeholder="e.g., ABCDE1234F"
                            value={pan}
                            onChange={(e) => setPan(e.target.value.toUpperCase())}
                            maxLength="10"
                            required
                        />

                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || !applicationId}>
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PANConfirmPage;