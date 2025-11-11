'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const VerifySignupOtpContent = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { verifySignup } = useAuth(); // Get the new function from context
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    useEffect(() => {
        // If someone lands on this page without an email, send them back to signup.
        if (!email) {
            router.push('/signup');
        }
    }, [email, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.length < 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }

        setLoading(true);
        // Call the verification function from AuthContext
        const result = await verifySignup(email, otp);
        setLoading(false);
        
        if (result.success) {
            // On success, AuthContext has stored the token and user.
            // Redirect to the dashboard.
            router.push('/dashboard');
        } else {
            setError(result.message || 'Verification failed. The OTP may be incorrect or expired.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Activate Your Account</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit code to <strong>{email}</strong> to verify your email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} /> <InputOTPSlot index={1} /> <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} /> <InputOTPSlot index={4} /> <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>

                        {error && <div className="text-red-500 text-center text-sm w-full">{error}</div>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Create Account'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

const VerifySignupOtpPage = () => {
  return (
    // --- Suspense se wrap karo ---
    <Suspense fallback={<div>Loading...</div>}>
      <VerifySignupOtpContent />
    </Suspense>
  )
}

export default VerifySignupOtpPage;