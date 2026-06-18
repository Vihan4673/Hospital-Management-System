import React, { useState, type JSX } from "react"
import { MdDashboard, MdPeople, MdLocalHospital } from "react-icons/md"
import { CalendarCheck, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SidebarItem {
  id: string
  label: string
  icon: JSX.Element
}

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>("dashboard")
  const navigate = useNavigate()

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId)
    if (itemId === "dashboard") navigate(`/dashboard`)
    else navigate(`/dashboard/${itemId}`)
  }

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard className='w-5 h-5' />,
    },
    {
      id: "patients", // ✅ Changed from 'readers' -> 'patients'
      label: "Patients",
      icon: <MdPeople className='w-5 h-5' />,
    },
    {
      id: "doctors", // ✅ Changed from 'books' -> 'doctors'
      label: "Doctors",
      icon: <MdLocalHospital className='w-5 h-5' />,
    },
    {
      id: "appointments", // ✅ Changed from 'lendings' -> 'appointments'
      label: "Appointments",
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: "schedules", // ✅ Changed from 'overdues' -> 'schedules' / Pending sessions
      label: "Clinic Schedules",
      icon: <Clock className='w-5 h-5' />,
    },
  ]

  return (
      <div className='bg-slate-900 text-white w-64 min-h-screen p-4 flex flex-col shadow-xl border-r border-slate-800'>
        {/* Hospital System Brand Header */}
        <div className='mb-6 border-b border-slate-800 pb-5'>
          <h1 className='text-xl font-black text-center tracking-wider text-teal-400'>
            CAREFLOW <span className="text-white font-light text-sm block tracking-normal mt-0.5">Hospital Management</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1">
          <ul className='space-y-1.5'>
            {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                          activeItem === item.id
                              ? "bg-teal-600 text-white font-semibold shadow-md shadow-teal-600/20"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                <span className={`flex-shrink-0 ${activeItem === item.id ? "text-white" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                    <span className='text-sm tracking-wide'>{item.label}</span>
                  </button>
                </li>
            ))}
          </ul>
        </nav>

        {/* Optional: Footer or User Profile summary section */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 CareFlow Central</p>
        </div>
      </div>
  )
}

export default Sidebar