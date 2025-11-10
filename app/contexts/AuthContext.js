'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// --- 1. Naye, correct API functions ko import karo ---
import { login as apiLogin, signup as apiSignup, verifySignupOtp as apiVerifySignup } from '../services/apiService'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // This helper is perfect, no changes needed.
  const extractAuthPayload = (data) => {
    const token = data?.jwtToken || data?.token;
    const user = {
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || "User",
      email: data.email,
    };
    return { token, user };
  }

  // This useEffect is perfect, no changes needed.
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('authUser');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Error parsing auth data:", e);
    } finally {
      setLoading(false);
    }
  }, [])

  // --- FUNCTION 1: Handles Email + Password Login ---
  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials); // Calls POST /auth/login
      const { token: tokenFromApi, user: userFromApi } = extractAuthPayload(data);

      if (!tokenFromApi || !userFromApi?.email) {
        throw new Error("Invalid response from login API.");
      }

      setToken(tokenFromApi);
      setUser(userFromApi);
      localStorage.setItem('authToken', tokenFromApi);
      localStorage.setItem('authUser', JSON.stringify(userFromApi));
      
      return { success: true };
    } catch (error) {
      console.error("Login API Error:", error);
      return { success: false, message: error.message || 'Login failed.' };
    }
  }

  // --- FUNCTION 2: Handles Signup (Step 1 - send details, trigger OTP) ---
  const signup = async (userData) => {
    try {
      // Calls POST /auth/signup
      const response = await apiSignup(userData); 
      // Expects a response like { success: true, message: 'OTP sent...' }
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Signup API Error:", error);
      return { success: false, message: error.message || 'Signup failed.' };
    }
  }
  
  // --- FUNCTION 3: Handles Signup Verification (Step 2 - verify OTP, log in) ---
  const verifySignup = async (email, otp) => {
    try {
      // Calls POST /auth/verify-signup
      const data = await apiVerifySignup(email, otp); 
      const { token: tokenFromApi, user: userFromApi } = extractAuthPayload(data);

      if (!tokenFromApi || !userFromApi?.email) {
        throw new Error("Invalid response from verification API.");
      }

      setToken(tokenFromApi);
      setUser(userFromApi);
      localStorage.setItem('authToken', tokenFromApi);
      localStorage.setItem('authUser', JSON.stringify(userFromApi));

      return { success: true };
    } catch (error) {
      console.error("Verify Signup API Error:", error);
      return { success: false, message: error.message || 'Verification failed.' };
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    router.push('/login')
  }

  return (
    // Provide all three functions to the context
    <AuthContext.Provider value={{ user, token, loading, login, signup, verifySignup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}