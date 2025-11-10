'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useLoanFlow } from '../../contexts/LoanFlowContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputField from '../../components/InputField'
import { submitManualApplication } from '../../services/apiService'

const ManualDetailsContent = () => {
    const [formData, setFormData] = useState({
        // Personal Info
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        pan: '',
        pincode: '',
        address: '',
        // Employment Info
        employmentType: '',
        monthlyIncome: '',
        // Bank Info
        bankName: '',
        accountNumber: '',
        ifscCode: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ifscLoading, setIfscLoading] = useState(false);

    const { token, user, loading: authLoading } = useAuth();
    const { applicationId, loanAmount, clearFlowDetails } = useLoanFlow();
    const router = useRouter();

    useEffect(() => {
                if (authLoading) {
            return; // Wait for the auth state to be determined.
        }

        // Auth Guard & Flow Guard
        if (!token || !applicationId) {
            console.error("Auth token or Application ID is missing. Redirecting to login.");
            router.push('/login');
            return;
        }
        // Pre-fill user's name if available from the auth context
        if (user?.name) {
            const nameParts = user.name.split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || ''
            }));
        }
    }, [token, authLoading, applicationId, user, router]);

    const handleIfscBlur = async () => {
        if (formData.ifscCode.length !== 11) {
            if (formData.ifscCode.length > 0) setError('IFSC Code must be 11 characters.');
            return;
        }
        setIfscLoading(true);
        setError('');
        try {
            const response = await fetch(`https://ifsc.razorpay.com/${formData.ifscCode}`);
            if (!response.ok) {
                throw new Error('Invalid IFSC Code');
            }
            const data = await response.json();
            setFormData(prev => ({ ...prev, bankName: data.BANK }));
        } catch (err) {
            console.error("IFSC lookup failed:", err);
            setError('Invalid IFSC Code. Please check and try again.');
            setFormData(prev => ({ ...prev, bankName: '' }));
        } finally {
            setIfscLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Prepare the payload in the structure the backend expects
            const payload = {
                personalInfo: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    gender: formData.gender, // Backend will handle converting to uppercase
                    dob: formData.dob,
                    pan: formData.pan,
                    pinCode: formData.pincode,
                    address: formData.address,
                },
                employmentInfo: {
                    employmentType: formData.employmentType,
                    monthlyIncome: formData.monthlyIncome,
                },
                bankInfo: {
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode,
                },
                amount: loanAmount
            };

            const response = await submitManualApplication(token, applicationId, payload);

            if (response.success) {
                clearFlowDetails(); // Clean up the context after successful submission
                router.push(`/loan/thankyou/${applicationId}`);
            } else {
                throw new Error(response.message || "Application submission failed.");
            }
        } catch (err) {
            console.error('Error submitting manual application:', err);
            setError(err.message || 'An error occurred. Please double-check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Card className="w-full max-w-3xl animate-fade-in-up">
                <CardHeader>
                    <CardTitle className="text-2xl">Complete Your Application</CardTitle>
                    <CardDescription>
                        Please provide the following details to process your loan request.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <InputField id="firstName" label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                                <InputField id="lastName" label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Gender</label>
                                    <Select onValueChange={(value) => setFormData({ ...formData, gender: value })} required>
                                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputField id="dob" label="Date of Birth" type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} required />
                                <InputField id="pan" label="PAN Number" value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })} maxLength="10" required />
                                <InputField id="pincode" label="Pincode" type="number" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} maxLength="6" required />
                                <div className="md:col-span-2">
                                    <InputField id="address" label="Full Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                                </div>
                            </div>
                        </div>

                        {/* Employment Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Employment Information</h3>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Employment Type</label>
                                    <Select onValueChange={(value) => setFormData({ ...formData, employmentType: value })} required>
                                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SALARIED">Salaried</SelectItem>
                                            <SelectItem value="SELF_EMPLOYED">Self Employed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputField id="monthlyIncome" label="Monthly Income (₹)" type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })} required />
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Bank Information (for Loan Disbursement)</h3>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <InputField id="ifscCode" label="IFSC Code" value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })} onBlur={handleIfscBlur} maxLength="11" required />
                                <InputField id="bankName" label="Bank Name" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} required disabled={ifscLoading} placeholder={ifscLoading ? "Fetching bank name..." : "Bank name will appear here"} />
                                <div className="md:col-span-2">
                                    <InputField id="accountNumber" label="Bank Account Number" type="text" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} required />
                                </div>
                            </div>
                        </div>
                        
                        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-center">{error}</div>}
                        <Button type="submit" className="w-full" size="lg" disabled={loading || !applicationId}>
                            {loading ? 'Submitting Application...' : 'Submit Application'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

const ManualDetailsPage = () => {
  return (
    // --- Suspense se wrap karo ---
    <Suspense fallback={<div>Loading...</div>}>
      <ManualDetailsContent />
    </Suspense>
  )
}


export default ManualDetailsPage;
