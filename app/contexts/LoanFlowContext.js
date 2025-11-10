'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the context (the empty backpack)
const LoanFlowContext = createContext(null);

// 2. Create the Provider component (the backpack itself, with its items and functions)
export const LoanFlowProvider = ({ children }) => {
    const [hospitalId, setHospitalId] = useState(null);
    const [loanAmount, setLoanAmount] = useState(null);
    const [applicationId, setApplicationId] = useState(null);

    // This effect runs only once when the app loads
    // It checks if we have any saved data in Local Storage from a previous session
    useEffect(() => {
        const savedData = localStorage.getItem('loanFlowDetails');
        if (savedData) {
            const { hospitalId, loanAmount, applicationId } = JSON.parse(savedData);
            setHospitalId(hospitalId);
            setLoanAmount(loanAmount);
            setApplicationId(applicationId);
        }
    }, []);

    // A helper function to update and save the state
    const setFlowDetails = (details) => {
        const newDetails = { hospitalId, loanAmount, applicationId, ...details };
        
        // Update the state
        if (details.hospitalId !== undefined) setHospitalId(details.hospitalId);
        if (details.loanAmount !== undefined) setLoanAmount(details.loanAmount);
        if (details.applicationId !== undefined) setApplicationId(details.applicationId);

        // Save the updated details to Local Storage so it persists on refresh
        localStorage.setItem('loanFlowDetails', JSON.stringify(newDetails));
    };
    
    // A function to clear the flow, e.g., after loan is complete
    const clearFlowDetails = () => {
        setHospitalId(null);
        setLoanAmount(null);
        setApplicationId(null);
        localStorage.removeItem('loanFlowDetails');
    };

    const value = {
        hospitalId,
        loanAmount,
        applicationId,
        setFlowDetails,
        clearFlowDetails
    };

    return (
        <LoanFlowContext.Provider value={value}>
            {children}
        </LoanFlowContext.Provider>
    );
};

// 3. Create a custom hook to easily use the context (the way to get things from the backpack)
export const useLoanFlow = () => {
    const context = useContext(LoanFlowContext);
    if (!context) {
        throw new Error('useLoanFlow must be used within a LoanFlowProvider');
    }
    return context;
};