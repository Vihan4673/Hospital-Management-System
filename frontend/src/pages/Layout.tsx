import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <div className='min-h-screen bg-slate-50 flex flex-col overflow-hidden'>
            {/* Fixed Top Hospital Navigation Bar */}
            <div className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm'>
                <Navbar/>
            </div>

            {/* Main Clinical/Public Portal Content Area */}
            {/* pt-16 ensures content doesn't get hidden behind the fixed Navbar */}
            <main className='pt-16 flex-1 h-full lg:overflow-hidden bg-slate-50/50'>
                <Outlet/>
            </main>
        </div>
    )
}

export default Layout