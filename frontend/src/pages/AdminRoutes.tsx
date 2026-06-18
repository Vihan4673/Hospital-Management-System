import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const AdminRoutes = () => {

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex h-screen overscroll-auto'>
      <button
      className="md:hidden p-2 fixed top-20 left-4 z-50 bg-white shadow rounded"
      onClick={() => setSidebarOpen(!isSidebarOpen)}
    >
      ☰
    </button>

    {/* Mobile Sidebar */}
    {isSidebarOpen && (
      <div className="fixed inset-0 bg-transparent bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)}>
        <div
          className="bg-white w-64 h-full p-4 shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar />
        </div>
      </div>
    )}

      <div className="hidden md:block flex-shrink-0">
        <Sidebar/>
      </div>
      <div className='flex-1  bg-gray-50 p-5'>
        <Outlet/>
      </div>
    </div>
  )
}

export default AdminRoutes
