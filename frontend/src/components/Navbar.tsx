import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'
import toast from 'react-hot-toast'
import { useAuth } from '../context/useAuth'
import UserDropdown from './UserDropdown'
import { Activity, Menu, X } from 'lucide-react'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()
    const [isLoading] = useState(false)

    const { isLoggedIn, logout: unauthenticate } = useAuth();

    const handleLogout = async () => {
        try {
            await logout()
            toast.success("Logout successful!")
            unauthenticate()
            navigate("/login")
        } catch (error) {
            toast.error("Logout failed. Please try again.")
        }
    }

    const handleDashboard = () => {
        navigate("/dashboard")
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        // ✨ Glassmorphic Look: bg-white/75 + backdrop-blur-md
        <nav className='bg-white/75 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all'>
            <div className='w-full mx-auto px-4 sm:px-8 lg:px-10'>
                <div className='flex justify-between items-center h-16'>

                    {/* Logo & Medical Branding Section */}
                    {/* ⚡ FIX: onClick සහ cursor-pointer ඉවත් කර ඇති බැවින් මෙතනින් කිසිදු ක්‍රියාවක් සිදු නොවේ */}
                    <div className='flex items-center'>
                        <div className='flex flex-shrink-0 gap-2 justify-center items-center select-none'>
                            <div className='bg-blue-600 p-2 rounded-lg text-white'>
                                <Activity className='w-5 h-5 animate-pulse' />
                            </div>
                            <h1 className='text-xl font-black tracking-wider text-slate-900 uppercase'>
                                MEDI<span className='text-blue-600'>CARE</span>
                            </h1>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    {/* ⚡ FIX: Login Button එක සම්පූර්ණයෙන්ම ඉවත් කර ඇත */}
                    <div className='hidden md:flex items-center space-x-4'>
                        {isLoggedIn && <UserDropdown />}
                    </div>

                    {/* Mobile menu button */}
                    <div className='md:hidden'>
                        <button
                            onClick={toggleMenu}
                            className='text-slate-500 hover:text-slate-600 p-2 rounded-xl focus:outline-none transition-colors'
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className='md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg absolute left-0 w-full shadow-lg transition-all'>
                        <div className='px-4 pt-3 pb-4 space-y-2'>
                            {isLoggedIn ? (
                                <>
                                    <button
                                        onClick={() => { handleDashboard(); setIsMenuOpen(false); }}
                                        className='block w-full text-left text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 px-3 py-2.5 rounded-lg text-sm font-semibold'
                                    >
                                        Dashboard
                                    </button>

                                    <button
                                        disabled={isLoading}
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className='block w-full text-left bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-2.5 rounded-lg text-sm font-bold transition'
                                    >
                                        {isLoading ? "Logging out..." : "Logout Account"}
                                    </button>
                                </>
                            ) : (
                                <div className='text-center py-3 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
                                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                                        Medicare Portal
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar;