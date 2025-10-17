'use client'

import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Heart, User, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Medscred
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">by Empower Fintech</div>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="hover:bg-blue-50 transition-colors">
                    Dashboard
                  </Button>
                </Link>
                
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-scale-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-sm font-semibold">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                      </div>
                      <Link href="/dashboard">
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors">
                          My Loans
                        </button>
                      </Link>
                      <button 
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-red-600 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-blue-50 transition-colors">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-md hover:shadow-lg transition-all">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar