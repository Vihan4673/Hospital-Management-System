import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const AdminRoutes = () => {

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
      <div className='flex h-screen bg-slate-50 overflow-hidden'>
        {/* Mobile Toggle Button - Styled with Medical Teal tint and subtle hover transitions */}
        <button
            className="md:hidden p-2.5 fixed top-4 left-4 z-50 bg-white border border-teal-100 text-teal-700 shadow-md rounded-full hover:bg-teal-50 transition-colors focus:outline-none"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-teal-950/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={() => setSidebarOpen(false)}
            >
              <div
                  className="bg-white w-64 h-full shadow-xl flex flex-col border-r border-slate-100"
                  onClick={(e) => e.stopPropagation()}
              >
                {/* Optional Header for Mobile Sidebar */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-teal-800 text-white">
                  <span className="font-bold tracking-wide text-sm">CLINICAL PORTAL</span>
                  <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-teal-200 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar />
                </div>
              </div>
            </div>
        )}

        {/* Desktop Sidebar Container */}
        <div className="hidden md:block flex-shrink-0 h-full border-r border-slate-200/80 shadow-sm bg-white">
          <Sidebar/>
        </div>

        {/* Main Content Area - Optimized for medical tables, dashboards, and analytics charts */}
        <div className='flex-1 h-full overflow-y-auto bg-slate-50/60 p-6 md:p-8'>
          <main className="max-w-7xl mx-auto">
            <Outlet/>
          </main>
        </div>
      </div>
  )
}

export default AdminRoutes