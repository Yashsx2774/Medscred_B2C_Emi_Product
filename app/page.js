'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Heart, Users, Shield, TrendingUp } from 'lucide-react'

const HomePage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hospitalCode = searchParams.get('hospital') || 'H001'
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const testimonials = [
    {
      name: 'Priya Sharma',
      treatment: 'Cardiac Surgery',
      text: 'Medscred made my heart surgery affordable. The EMI options were transparent and the approval was instant!',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      treatment: 'Orthopedic Treatment',
      text: 'I got my knee replacement done without worrying about finances. Thank you Medscred for making healthcare accessible.',
      rating: 5
    },
    {
      name: 'Anjali Reddy',
      treatment: 'Dental Implants',
      text: 'Quick approval, easy EMI, and great support. Highly recommended for medical financing!',
      rating: 5
    }
  ]

  const partners = [
    'Apollo Hospitals',
    'Fortis Healthcare',
    'Max Healthcare',
    'Manipal Hospitals',
    'Narayana Health'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    router.push(`/signup?hospital=${hospitalCode}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block bg-gradient-to-r from-blue-100 to-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              🏥 Trusted by 50,000+ Patients
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Finance for the
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Care You Deserve</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Get instant medical loan approval with flexible EMI options. 
              Don't let finances delay your treatment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105" 
                onClick={handleGetStarted}
              >
                Apply for Loan <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href={`/login?hospital=${hospitalCode}`}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 border-2 hover:bg-blue-50 transition-all"
                >
                  Check Eligibility
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24hrs</div>
                <div className="text-sm text-muted-foreground">Quick Approval</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">8.5%</div>
                <div className="text-sm text-muted-foreground">Starting Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">₹10L</div>
                <div className="text-sm text-muted-foreground">Max Loan</div>
              </div>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="relative animate-fade-in-right">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Medical Care</div>
                    <div className="text-sm text-muted-foreground">Instant Financing</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Pre-approved loans available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Flexible EMI options</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>No hidden charges</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  Start Your Journey
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4">Simple 3-Step Process</h2>
            <p className="text-xl text-muted-foreground">Get approved in minutes, not days</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-200 via-green-200 to-blue-200"></div>
            
            {[
              { step: 1, title: 'Apply', desc: 'Fill simple form with treatment details', icon: '📝', color: 'blue' },
              { step: 2, title: 'Get Approved', desc: 'Instant eligibility check & NBFC selection', icon: '✅', color: 'green' },
              { step: 3, title: 'Start Treatment', desc: 'Choose EMI plan and begin your care', icon: '🏥', color: 'blue' }
            ].map((item, idx) => (
              <div key={idx} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-xl transform hover:-translate-y-2 duration-300">
                  <CardContent className="pt-12 pb-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-full flex items-center justify-center text-4xl shadow-lg relative z-10`}>
                      {item.icon}
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-muted-foreground">Real stories from real patients</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 shadow-2xl">
              <CardContent className="pt-12 pb-8">
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                    ))}
                  </div>
                  <p className="text-xl italic text-muted-foreground">
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <div>
                    <div className="font-bold text-lg">{testimonials[activeTestimonial].name}</div>
                    <div className="text-sm text-muted-foreground">{testimonials[activeTestimonial].treatment}</div>
                  </div>
                </div>
                
                {/* Testimonial Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === activeTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partner Hospitals */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Partner Hospitals</h2>
            <p className="text-muted-foreground">Trusted by leading healthcare providers across India</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {partners.map((partner, idx) => (
              <div key={idx} className="text-xl font-semibold text-gray-600 hover:text-blue-600 transition-colors hover:scale-110 transform duration-300">
                🏥 {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of patients who chose Medscred for their healthcare financing</p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-12 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            onClick={handleGetStarted}
          >
            Apply Now - It's Free
          </Button>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <Shield className="w-12 h-12 mx-auto text-blue-600" />
              <div className="font-semibold">Secure & Safe</div>
              <div className="text-sm text-muted-foreground">Bank-level encryption</div>
            </div>
            <div className="space-y-2">
              <Users className="w-12 h-12 mx-auto text-green-600" />
              <div className="font-semibold">50,000+ Users</div>
              <div className="text-sm text-muted-foreground">Trust our service</div>
            </div>
            <div className="space-y-2">
              <Heart className="w-12 h-12 mx-auto text-blue-600" />
              <div className="font-semibold">100+ Hospitals</div>
              <div className="text-sm text-muted-foreground">Pan-India network</div>
            </div>
            <div className="space-y-2">
              <TrendingUp className="w-12 h-12 mx-auto text-green-600" />
              <div className="font-semibold">₹500Cr+</div>
              <div className="text-sm text-muted-foreground">Loans disbursed</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage