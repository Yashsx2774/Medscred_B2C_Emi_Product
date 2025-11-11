import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import { LoanFlowProvider } from './contexts/LoanFlowContext'; // --- 1. Naya Provider Import Karo ---

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Medscred Aesthetic',
  description: 'Medscred Aesthetic EMI Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
           <LoanFlowProvider>
          <main className="min-h-screen bg-background">
            {children}
          </main>
          </LoanFlowProvider>
        </AuthProvider>
      </body>
    </html>
  )
}