# LoanFlow - Loan Application Platform

A full-stack Next.js loan application platform with multiple loan approval flows, built with Next.js 14, MongoDB, and shadcn/ui components.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with phone number and password
- **Session management** using Context API
- Persistent login state with localStorage
- Secure token-based API authentication

### Loan Application Flows
The application supports three different loan approval flows based on eligibility:

1. **Pre-Approved Loans** (Phone ending in 0-3)
   - Instant loan approval
   - Simple PAN verification (last 4 digits)
   - Quick processing

2. **Credit Card EMI** (Phone ending in 4-6)
   - Instant EMI approval
   - Credit card details mapping
   - Secure card information handling

3. **Manual Application** (Phone ending in 7-9)
   - Comprehensive application form
   - Personal, employment, bank, and address details
   - Full KYC process

### Dashboard
- Clean, modern dashboard with loan overview
- View all ongoing/active loans
- Quick "Start Loan Application" CTA
- Real-time loan status tracking

## 📁 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js    # Backend API routes
│   ├── contexts/
│   │   └── AuthContext.js           # Authentication context
│   ├── components/
│   │   ├── Navbar.js                # Navigation component
│   │   ├── LoanCard.js              # Loan display card
│   │   └── InputField.js            # Reusable input field
│   ├── login/page.js                # Login page
│   ├── signup/page.js               # Signup page
│   ├── dashboard/page.js            # User dashboard
│   ├── loan/
│   │   ├── start/page.js            # Loan eligibility check
│   │   ├── preapproved/page.js      # Pre-approved loan offer
│   │   ├── pan-confirm/page.js      # PAN verification
│   │   ├── creditcard/page.js       # Credit card details
│   │   ├── manual/page.js           # Manual application form
│   │   └── thankyou/page.js         # Confirmation page
│   ├── page.js                      # Landing page
│   ├── layout.js                    # Root layout
│   └── globals.css                  # Global styles
└── package.json
```

## 🎨 UI/UX Design

- **Modern Design System**: Built with Tailwind CSS and shadcn/ui
- **Responsive Layout**: Mobile-first design approach
- **Clean Typography**: Inter font family
- **Consistent Colors**: Using semantic color tokens
- **Smooth Animations**: Hover effects and transitions

## 🔧 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: JWT (Base64 encoded)
- **State Management**: React Context API
- **HTTP Client**: Native Fetch API

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login

### Loan Management
- `POST /api/loan/check-eligibility` - Check loan eligibility by phone
- `POST /api/loan/verify-pan` - Verify PAN for pre-approved loans
- `POST /api/loan/map-card` - Map credit card for EMI
- `POST /api/loan/submit-manual` - Submit manual loan application
- `GET /api/loan/ongoing` - Get user's active loans

## 🔐 Authentication Flow

1. User signs up with name, phone, email, and password
2. Server generates JWT token and returns with user data
3. Token stored in localStorage and sent with subsequent requests
4. Token verified on protected routes via Authorization header
5. Logout clears token and redirects to login

## 💳 Loan Application Flow

### Entry Point
1. User enters mobile number on `/loan/start`
2. System checks eligibility and creates loan session token
3. Routes to appropriate flow based on eligibility

### Flow A: Pre-Approved (Last digit 0-3)
1. Show pre-approved loan offer with details
2. Collect last 4 digits of PAN
3. Create loan record → Thank you page

### Flow B: Credit Card EMI (Last digit 4-6)
1. Show credit card EMI approval
2. Collect card details (number, name, expiry, CVV)
3. Create loan record → Thank you page

### Flow C: Manual Application (Last digit 7-9)
1. Comprehensive form with multiple sections:
   - Personal Information (name, gender, DOB, PAN)
   - Employment Information (status, company, income)
   - Bank Information (bank, account, IFSC)
   - Address (full address, pincode)
   - Loan Details (amount, purpose)
2. Submit application → Thank you page

## 🗄️ Database Schema

### Users Collection
```javascript
{
  id: String (UUID),
  name: String,
  phone: String,
  email: String,
  password: String,
  createdAt: Date
}
```

### Loans Collection
```javascript
{
  id: String (UUID),
  userId: String,
  type: String,
  amount: Number,
  status: String,
  sessionToken: String,
  tenure: Number,
  interestRate: Number,
  nextPayment: String,
  createdAt: Date,
  // Additional fields based on loan type
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB instance running
- yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

3. Environment variables are pre-configured in `.env`:
```
MONGO_URL=mongodb://localhost:27017
```

4. Start the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the Application

### Test User Credentials
You can create a test user through the signup flow or use:
- Phone: Any 10-digit number
- Password: Any password

### Testing Different Loan Flows
When starting a loan application, use phone numbers ending in:
- **0, 1, 2, 3**: Pre-approved loan flow
- **4, 5, 6**: Credit card EMI flow
- **7, 8, 9**: Manual application flow

## 📝 Mock Data

All API calls currently use **mock responses** for development. The backend:
- Creates users in MongoDB
- Generates JWT tokens
- Stores loan applications
- Returns mock loan eligibility based on phone number
- Simulates loan approval workflows

## 🔄 Session Management

- **Authentication Token**: Stored in localStorage as 'token'
- **Loan Session Token**: Created per loan application, stored as 'loanSessionToken'
- **User Data**: Cached in localStorage as 'user'
- **Auto-redirect**: Protected routes redirect to login if not authenticated

## 🎯 Future Enhancements

- Real Spring Boot API integration (placeholders ready)
- OTP-based phone verification
- Document upload functionality
- Payment gateway integration
- Loan repayment tracking
- EMI calculator
- Credit score integration
- Push notifications
- Admin dashboard

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🛠️ Development Notes

- Uses Next.js App Router (not Pages Router)
- All pages use JavaScript (not TypeScript)
- Client components marked with 'use client' directive
- Server components for static content
- Hot reload enabled for development
- MongoDB connection pooling implemented

## 📄 License

This project is a template for loan application platforms.
