import React from "react";
import { LayoutDashboard, Users, Stethoscope, CalendarCheck, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentActiveItem = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path.includes("/patients")) return "patients";
    if (path.includes("/doctors")) return "doctors";
    if (path.includes("/appointments")) return "appointments";
    return "dashboard";
  };

  const activeItem = getCurrentActiveItem();

  const handleItemClick = (item: SidebarItem) => {
    navigate(item.path);
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Overview Dashboard",
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
      path: "/dashboard"
    },
    {
      id: "patients",
      label: "Patient Registry",
      icon: <Users className="w-[18px] h-[18px]" />,
      path: "/dashboard/patients"
    },
    {
      id: "doctors",
      label: "Medical Staff",
      icon: <Stethoscope className="w-[18px] h-[18px]" />,
      path: "/dashboard/doctors"
    },
    {
      id: "appointments",
      label: "Appointments Queue",
      icon: <CalendarCheck className="w-[18px] h-[18px]" />,
      path: "/dashboard/appointments"
    }
  ];

  return (
      <>
        {/* ========================================================================= */}
        {/* 1. DESKTOP SIDEBAR (Only shown on medium screens and up: md:flex)        */}
        {/* ========================================================================= */}
        <div className="bg-slate-950 text-slate-100 w-64 min-h-screen p-5 border-r border-slate-900/60 flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            {/* Header Console */}
            <div className="mb-8 px-2 pt-2 flex items-center gap-3 border-b border-slate-900 pb-5">
              <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-center shadow-md shadow-black/40">
                <ShieldCheck className="w-4 h-4 text-blue-500 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xs font-black tracking-widest text-slate-100 uppercase leading-none">
                  CONTROL PANEL
                </h1>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-1.5">
                Workspace Console
              </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 block mb-4">
              Main Menu
            </span>
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const isActive = activeItem === item.id;
                  return (
                      <li key={item.id}>
                        <button
                            onClick={() => handleItemClick(item)}
                            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-300 text-left group relative ${
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 font-semibold"
                                    : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-100 font-medium"
                            }`}
                        >
                          {isActive && (
                              <span className="absolute left-1.5 top-3 bottom-3 w-1 bg-white rounded-full" />
                          )}

                          <span className={`flex-shrink-0 transition-all duration-300 ${
                              isActive ? "text-white scale-105" : "text-slate-500 group-hover:text-blue-400 group-hover:scale-110"
                          }`}>
                        {item.icon}
                      </span>
                          <span className="text-xs tracking-wide transition-colors duration-200">
                        {item.label}
                      </span>
                        </button>
                      </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Footer inside Sidebar */}
          <div className="pt-4 border-t border-slate-900/50 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Live Server Connected
            </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MOBILE BOTTOM NAVIGATION (Always visible on mobile - No menu button)   */}
        {/* ========================================================================= */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950 text-slate-100 border-t border-slate-900/80 p-2 z-50 flex justify-around items-center md:hidden shadow-2xl shadow-black/80">
          {sidebarItems.map((item) => {
            const isActive = activeItem === item.id;

            const getMobileLabel = (id: string, label: string) => {
              if (id === "dashboard") return "Overview";
              if (id === "appointments") return "Queue";
              return label.split(" ")[0]; // Outputs: Patient, Medical
            };

            return (
                <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 relative min-w-[68px] ${
                        isActive ? "text-blue-500 font-semibold scale-105" : "text-slate-400 font-medium"
                    }`}
                >
                  {/* Active Indicator Top Border Line */}
                  {isActive && (
                      <span className="absolute -top-2 left-4 right-4 h-[2px] bg-blue-500 rounded-full animate-fade-in" />
                  )}

                  <span className={`mb-1 transition-transform ${isActive ? "scale-110 text-blue-500" : "text-slate-500"}`}>
                {item.icon}
              </span>

                  <span className="text-[10px] tracking-tight text-center truncate">
                {getMobileLabel(item.id, item.label)}
              </span>
                </button>
            );
          })}
        </div>
      </>
  );
};

export default Sidebar;