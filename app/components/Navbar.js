'use client'

import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-primary">Medscred</div>
          <div className="text-xs text-muted-foreground hidden sm:block">by Empower Fintech</div>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:block">Welcome, {user.name}</span>
              <Button onClick={logout} variant="outline">Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar