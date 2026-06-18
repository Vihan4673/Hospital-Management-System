import React, { useState, type JSX } from "react"
import { MdDashboard, MdPeople, MdLocalHospital } from "react-icons/md"
import { CalendarCheck, CalendarDays } from "lucide-react"
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

  // Channelling System එකකට අදාළව items ටික සකස් කරා
  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard className='w-5 h-5' />,
    },
    {
      id: "patients", // readers -> patients
      label: "Patients",
      icon: <MdPeople className='w-5 h-5' />,
    },
    {
      id: "doctors", // books -> doctors
      label: "doctors",
      icon: <MdLocalHospital className='w-5 h-5' />,
    },
    {
      id: "appointments", // lendings -> appointments (Active Queue)
      label: "Appointments",
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: "schedules", // overdues -> schedules (දොස්තරලාගේ වැඩ කරන වේලාවන්)
      label: "DoctorModel Schedules",
      icon: <CalendarDays className='w-5 h-5' />,
    },
  ]

  return (
      <div className='bg-slate-900 text-slate-100 w-64 min-h-screen p-4 border-r border-slate-800 shadow-xl'>
        <div className='mb-8 border-b border-slate-800 pb-4'>
          {/* Channelling Panel Header */}
          <h1 className='text-xl font-black tracking-wider text-center text-blue-400 uppercase'>
            ⚕️ CHANNELLING
          </h1>
        </div>

        <nav>
          <ul className='space-y-2'>
            {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                          activeItem === item.id
                              ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                  >
                <span className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                    activeItem === item.id ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                }`}>
                  {item.icon}
                </span>
                    <span className='text-sm font-medium'>{item.label}</span>
                  </button>
                </li>
            ))}
          </ul>
        </nav>
      </div>
  )
}

export default Sidebar