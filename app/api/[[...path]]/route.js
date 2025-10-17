import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

const DB_NAME = 'loanflow'

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(DB_NAME)
    console.log('Connected to MongoDB')
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Loan-Session')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Generate JWT token (mock implementation)
function generateToken(user) {
  return Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString('base64')
}

// Verify JWT token (mock implementation)
function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
    return decoded
  } catch {
    return null
  }
}

// Auth middleware
function getAuthUser(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  return verifyToken(token)
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const database = await connectToMongo()

    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/root' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Hello World" }))
    }
    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Hello World" }))
    }

    // ============ AUTH ENDPOINTS ============
    
    // POST /api/auth/signup
    if (route === '/auth/signup' && method === 'POST') {
      const body = await request.json()
      const { name, phone, email, password } = body
      
      const users = database.collection('users')
      
      // Check if user already exists
      const existingUser = await users.findOne({ $or: [{ phone }, { email }] })
      if (existingUser) {
        return handleCORS(NextResponse.json({ 
          success: false, 
          message: 'User already exists with this phone or email' 
        }, { status: 400 }))
      }
      
      // Create new user
      const newUser = {
        id: uuidv4(),
        name,
        phone,
        email,
        password,
        createdAt: new Date()
      }
      
      await users.insertOne(newUser)
      
      const token = generateToken(newUser)
      
      return handleCORS(NextResponse.json({
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email
        }
      }))
    }

    // POST /api/auth/login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const { phone, password } = body
      
      const users = database.collection('users')
      
      // Find user
      const user = await users.findOne({ phone, password })
      
      if (!user) {
        return handleCORS(NextResponse.json({ 
          success: false, 
          message: 'Invalid phone number or password' 
        }, { status: 401 }))
      }
      
      const token = generateToken(user)
      
      return handleCORS(NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email
        }
      }))
    }

    // ============ LOAN ENDPOINTS ============
    
    // POST /api/loan/check-eligibility
    if (route === '/loan/check-eligibility' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser) {
        return handleCORS(NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }))
      }
      
      const body = await request.json()
      const { phone, loanAmount } = body
      
      // Generate session token for this loan application
      const sessionToken = uuidv4()
      
      // Mock eligibility check - determine user's eligibility
      const lastDigit = parseInt(phone.slice(-1))
      
      // Determine eligibility status
      const eligibilityStatus = {
        hasPreApproved: lastDigit <= 5,
        preApprovedAmount: lastDigit <= 5 ? 500000 : 0,
        hasCreditCard: lastDigit >= 3 && lastDigit <= 7,
        creditCardLimit: lastDigit >= 3 && lastDigit <= 7 ? 250000 : 0
      }
      
      // Mock NBFC options based on eligibility
      const nbfcOptions = []
      
      if (eligibilityStatus.hasPreApproved) {
        nbfcOptions.push({
          id: 'nbfc1',
          name: 'HealthFin Financial Services',
          description: 'Leading healthcare financing partner with quick approvals',
          interestRate: 9.5,
          processingFee: '1% + GST',
          maxTenure: 24,
          recommended: true,
          approvalType: 'pre-approved'
        })
      }
      
      if (eligibilityStatus.hasCreditCard) {
        nbfcOptions.push({
          id: 'nbfc2',
          name: 'MediCard EMI Solutions',
          description: 'Instant EMI on your existing credit card',
          interestRate: 11.5,
          processingFee: '2% + GST',
          maxTenure: 18,
          recommended: false,
          approvalType: 'credit-card'
        })
      }
      
      // Always add manual option
      nbfcOptions.push({
        id: 'nbfc3',
        name: 'CareCredit NBFC',
        description: 'Flexible medical loans for all healthcare needs',
        interestRate: 12.5,
        processingFee: '1.5% + GST',
        maxTenure: 36,
        recommended: !eligibilityStatus.hasPreApproved && !eligibilityStatus.hasCreditCard,
        approvalType: 'manual'
      })
      
      return handleCORS(NextResponse.json({
        success: true,
        sessionToken,
        eligibilityStatus,
        nbfcOptions,
        message: `Eligibility checked for ${phone}`
      }))
    }

    // GET /api/hospital/details
    if (route === '/hospital/details' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser) {
        return handleCORS(NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }))
      }
      
      const url = new URL(request.url)
      const hospitalCode = url.searchParams.get('code') || 'H001'
      
      // Mock hospital data
      const hospitals = {
        'H001': {
          code: 'H001',
          name: 'Apollo Hospitals',
          location: 'Chennai, Tamil Nadu',
          type: 'Multi-Specialty Hospital'
        },
        'H002': {
          code: 'H002',
          name: 'Fortis Healthcare',
          location: 'Mumbai, Maharashtra',
          type: 'Super Specialty Hospital'
        },
        'H003': {
          code: 'H003',
          name: 'Max Healthcare',
          location: 'Delhi NCR',
          type: 'Multi-Specialty Hospital'
        }
      }
      
      const hospital = hospitals[hospitalCode] || hospitals['H001']
      
      return handleCORS(NextResponse.json({
        success: true,
        hospital
      }))
    }

    // POST /api/loan/verify-pan
    if (route === '/loan/verify-pan' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser) {
        return handleCORS(NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }))
      }
      
      const body = await request.json()
      const { panLast4 } = body
      const sessionToken = request.headers.get('X-Loan-Session')
      
      if (!sessionToken) {
        return handleCORS(NextResponse.json({ success: false, message: 'Invalid session' }, { status: 400 }))
      }
      
      const loans = database.collection('loans')
      
      // Create loan record
      const newLoan = {
        id: uuidv4(),
        userId: authUser.userId,
        type: 'Pre-Approved Loan',
        amount: 500000,
        status: 'pending',
        sessionToken,
        panLast4,
        createdAt: new Date(),
        nextPayment: '15 Jul 2025',
        tenure: 24,
        interestRate: 9.5
      }
      
      await loans.insertOne(newLoan)
      
      return handleCORS(NextResponse.json({
        success: true,
        message: 'PAN verified successfully',
        loanId: newLoan.id
      }))
    }

    // POST /api/loan/map-card
    if (route === '/loan/map-card' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser) {
        return handleCORS(NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }))
      }
      
      const body = await request.json()
      const sessionToken = request.headers.get('X-Loan-Session')
      
      if (!sessionToken) {
        return handleCORS(NextResponse.json({ success: false, message: 'Invalid session' }, { status: 400 }))
      }
      
      const loans = database.collection('loans')
      
      // Create loan record
      const newLoan = {
        id: uuidv4(),
        userId: authUser.userId,
        type: 'Credit Card EMI',
        amount: 250000,
        status: 'active',
        sessionToken,
        cardLast4: body.cardNumber.slice(-4),
        createdAt: new Date(),
        nextPayment: '10 Jul 2025',
        tenure: 12,
        interestRate: 11.5
      }
      
      await loans.insertOne(newLoan)
      
      return handleCORS(NextResponse.json({
        success: true,
        message: 'Card mapped successfully',
        loanId: newLoan.id
      }))
    }

    // POST /api/loan/submit-manual
    if (route === '/loan/submit-manual' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser) {
        return handleCORS(NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }))
      }
      
      const body = await request.json()
      const sessionToken = request.headers.get('X-Loan-Session')
      
      if (!sessionToken) {
        return handleCORS(NextResponse.json({ success: false, message: 'Invalid session' }, { status: 400 }))
      }
      
      const loans = database.collection('loans')
      
      // Create loan record
      const newLoan = {
        id: uuidv4(),
        userId: authUser.userId,
        type: 'Personal Loan',
        amount: parseInt(body.loanAmount),
        status: 'pending',
        sessionToken,
        applicationData: body,
        createdAt: new Date(),
        nextPayment: 'Pending Approval',
        tenure: 24,
        interestRate: 12.5
      }
      
      await loans.insertOne(newLoan)
      
      return handleCORS(NextResponse.json({
        success: true,
        message: 'Application submitted successfully',
        loanId: newLoan.id
      }))
    }

    // GET /api/loan/ongoing
    if (route === '/loan/ongoing' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser) {
        return handleCORS(NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }))
      }
      
      const loans = database.collection('loans')
      
      // Find all loans for this user
      const userLoans = await loans.find({ userId: authUser.userId }).toArray()
      
      // Format loans for frontend
      const formattedLoans = userLoans.map(loan => ({
        id: loan.id,
        type: loan.type,
        amount: loan.amount,
        status: loan.status,
        nextPayment: loan.nextPayment,
        tenure: loan.tenure,
        interestRate: loan.interestRate
      }))
      
      return handleCORS(NextResponse.json({
        success: true,
        loans: formattedLoans
      }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", message: error.message }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute