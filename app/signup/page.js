'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import InputField from '../components/InputField'
import Link from 'next/link'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required'
    if (name.trim().length < 2) return 'Name must be at least 2 characters'
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name should only contain letters'
    return ''
  }

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required'
    // Remove spaces and special characters for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
if (!/^[6-9]\d{9}$/.test(cleanPhone)) return 'Enter a valid 10-digit Indian phone number'
    return ''
  }

  const validateEmail = (email) => {
    if (!email) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Enter a valid email address'
    return ''
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number'
    if (!/(?=.*[@$!%*?&#])/.test(password)) return 'Password must contain at least one special character (@$!%*?&#)'
    return ''
  }

  // Handle field blur for real-time validation
  const handleBlur = (field) => {
    let fieldError = ''
    
    switch(field) {
      case 'name':
        fieldError = validateName(formData.name)
        break
      case 'phone':
        fieldError = validatePhone(formData.phone)
        break
      case 'email':
        fieldError = validateEmail(formData.email)
        break
      case 'password':
        fieldError = validatePassword(formData.password)
        break
    }
    
    setErrors(prev => ({ ...prev, [field]: fieldError }))
  }

  // Handle input change
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name),
      phone: validatePhone(formData.phone),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password)
    }
    
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate all fields before submission
    if (!validateForm()) {
      setError('Please fix all errors before submitting')
      return
    }

    setLoading(true)

    const result = await signup(formData)
    
    if (result.success) {
      // Hard redirect to avoid hydration/race issues
      // window.location.href = '/dashboard'
            router.push(`/signup/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } else {
      setError(result.message || 'Signup failed')
    }
    
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <InputField
                id="name"
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <InputField
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                maxLength={10}
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <InputField
                id="password"
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              {!errors.password && formData.password && (
                <p className="text-xs text-muted-foreground mt-1">
                  Must be 8+ characters with uppercase, lowercase, number & special character
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?
              <Link href="/login" className="text-primary hover:underline">
                {" "}Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignupPage