import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'
import toast from 'react-hot-toast'
import { useAuth } from '../context/useAuth'
import UserDropdown from './UserDropdown'
import { Activity } from 'lucide-react'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const { isLoggedIn, logout: unauthenticate } = useAuth();

    const handleLogin = () => {
        navigate("/login")
    }

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
        <nav className='bg-white shadow-md border-b border-slate-200 sticky top-0 z-50'>
            <div className='w-full mx-auto px-4 sm:px-8 lg:px-10'>
                <div className='flex justify-between items-center h-16'>

                    {/* Logo & Medical Branding Section */}
                    <div className='flex items-center'>
                        <div className='flex flex-shrink-0 gap-2 justify-center items-center cursor-pointer' onClick={handleDashboard}>
                            {/* Image logo එකක් නැතත් වැඩ කරන්න Lucide Icon එකක් දැම්මා, ඔයාට අවශ්‍ය නම් img tag එක දාන්න පුළුවන් */}
                            <div className='bg-blue-600 p-2 rounded-lg text-white'>
                                <Activity className='w-6 h-6 animate-pulse' />
                            </div>
                            <h1 className='text-2xl font-black tracking-tight text-blue-900'>
                                MEDI<span className='text-blue-600'>CARE</span>
                            </h1>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex items-center space-x-4'>
                        {!isLoggedIn && (
                            <button
                                onClick={handleLogin}
                                className='bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-150 shadow-xs'
                            >
                                Login
                            </button>
                        )}

                        {isLoggedIn && <UserDropdown />}
                    </div>

                    {/* Mobile menu button */}
                    <div className='md:hidden'>
                        <button
                            onClick={toggleMenu}
                            className='text-slate-500 hover:text-slate-600 focus:outline-none'
                        >
                            <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className='md:hidden animate-fade-in'>
                        <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-100 bg-white shadow-inner'>
                            {!isLoggedIn && (
                                <button
                                    onClick={handleLogin}
                                    className='block w-full text-center bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-base font-medium transition'
                                >
                                    Login
                                </button>
                            )}

                            {isLoggedIn && (
                                <button
                                    onClick={handleDashboard}
                                    className='block w-full text-left text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-base font-medium'
                                >
                                    Dashboard
                                </button>
                            )}

                            {isLoggedIn && (
                                <button
                                    disabled={isLoading}
                                    onClick={handleLogout}
                                    className='block w-full text-left bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-2 rounded-lg text-base font-medium transition'
                                >
                                    {isLoading ? "Logging out..." : "Logout"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar