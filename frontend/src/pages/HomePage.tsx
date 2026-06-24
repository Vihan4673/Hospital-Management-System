import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mail, Phone, Search, Facebook, Youtube, Linkedin,
    CalendarDays, Stethoscope, Beaker, CreditCard, Ambulance, MessageCircle,
    ShieldCheck, Award, Users, HeartPulse, Brain, Bone, Baby
} from "lucide-react";

const HospitalHomePage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "MediCare Hospital | Home";
    }, []);

    const handleNavigation = () => {
        navigate("/PatientAptmentPage");
    };

    const QuickActionCard: React.FC<{ icon: React.ReactElement<{ className?: string }>; title: string }> = ({ icon, title }) => (
        <div
            className="flex flex-col items-center justify-center text-center group transition-all duration-300 hover:-translate-y-1.5"
        >
            <div className="p-4 bg-white rounded-2xl text-slate-700 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                {React.cloneElement(icon, {
                    className: `${icon.props.className || ""} w-6 h-6 transition-transform duration-300 group-hover:scale-110`.trim()
                })}
            </div>
            <p className="mt-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight max-w-[110px] group-hover:text-blue-600 transition-colors">
                {title}
            </p>
        </div>
    );

    return (
        <div className="fixed inset-0 w-full h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white overflow-y-auto block">

            <div className="bg-slate-900 text-slate-300 text-[11px] font-semibold py-2.5 px-6 sm:px-12 lg:px-20 flex flex-col md:flex-row justify-between items-center gap-2 border-b border-slate-800">
                <div className="flex items-center space-x-5 tracking-wide uppercase text-slate-400">
                    <span className="hover:text-white cursor-pointer transition">News</span>
                    <span className="hover:text-white cursor-pointer transition">Contact Us</span>
                    <span className="hover:text-white cursor-pointer transition">Patient Reviews</span>
                    <span className="hover:text-white cursor-pointer transition">Privacy Notice</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-1.5 hover:text-white transition">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        <span>011 2140 000</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-white transition">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span>contactus@medicare.com</span>
                    </div>
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                        <Search className="w-3.5 h-3.5 text-blue-500" />
                        <span>Search</span>
                    </div>
                    <div className="flex items-center space-x-3.5 text-slate-500 pl-4 border-l border-slate-800">
                        <Facebook className="w-3.5 h-3.5 hover:text-blue-500 cursor-pointer transition" />
                        <Youtube className="w-3.5 h-3.5 hover:text-rose-500 cursor-pointer transition" />
                        <Linkedin className="w-3.5 h-3.5 hover:text-blue-400 cursor-pointer transition" />
                    </div>
                </div>
            </div>

            {/* BRAND BRANDING & QUICK ACTIONS */}
            <header className="bg-white py-6 px-6 sm:px-12 lg:px-20 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-8 shadow-sm">
                <div className="flex items-center gap-3 select-none self-start xl:self-auto">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md shadow-blue-500/20">
                        <Ambulance className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">MEDI<span className="text-blue-600">CARE</span></h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1">HOSPITAL PORTAL</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 w-full xl:w-auto justify-center">
                    <QuickActionCard icon={<CalendarDays />} title="Book Visits" />
                    <QuickActionCard icon={<Stethoscope />} title="Health Check" />
                    <QuickActionCard icon={<Beaker />} title="Laboratories" />
                    <QuickActionCard icon={<CreditCard />} title="Pay Online" />
                    <QuickActionCard icon={<Ambulance className="text-rose-600 animate-pulse" />} title="Emergencies" />
                </div>
            </header>

            {/* MAIN PORTAL NAVIGATION BAR */}
            <nav className="bg-blue-600 text-white text-xs font-bold py-1.5 px-6 sm:px-12 lg:px-20 uppercase tracking-wider shadow-md overflow-x-auto whitespace-nowrap sticky top-0 z-40">
                <div className="flex items-center space-x-1 py-1">
                    {["HOME", "ABOUT US", "MEDICAL SPECIALTIES", "FACILITIES & SERVICES", "INTERNATIONAL PATIENTS", "INSURANCES", "PRIORITY CIRCLE", "CONTACT US"].map((item, index) => (
                        <div
                            key={item}
                            className={`px-4 py-2 rounded-lg transition duration-150 cursor-pointer font-black tracking-wide ${index === 0 ? "bg-blue-800 text-white" : "hover:bg-blue-700 text-blue-50"}`}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </nav>

            {/* HERO BANNER SECTION */}
            <div className="relative w-full min-h-[480px] md:h-[520px] bg-white overflow-hidden flex flex-col md:flex-row items-center border-b border-slate-100">
                <div className="w-full md:w-1/2 flex flex-col justify-center items-start px-6 sm:px-12 lg:px-24 py-12 z-10 space-y-6">
                    <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-wider">
                        ✨ Premium Medical Care
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                        Experience <span className="text-blue-600">the best</span> clinical excellence.
                    </h2>
                    <p className="text-sm md:text-base text-slate-500 font-medium max-w-md leading-relaxed">
                        Your wellness is our ultimate priority. Connect with top-tier consultants and manage medical tracks instantly.
                    </p>
                    <button
                        onClick={handleNavigation}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    >
                        <CalendarDays className="w-4 h-4 stroke-[2.5]" />
                        Book an Appointment
                    </button>
                </div>

                <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden self-stretch">
                    <div className="absolute inset-0 bg-slate-100 hidden md:block" style={{ clipPath: "polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)" }}>
                        <img
                            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"
                            alt="Hospital Interior"
                            className="w-full h-full object-cover grayscale-[15%] contrast-[1.05]"
                        />
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"
                        alt="Hospital Interior Mobile"
                        className="w-full h-full object-cover block md:hidden"
                    />
                </div>
            </div>

            {/*  HOSPITAL STATS  */}
            <section className="py-12 bg-white px-6 sm:px-12 lg:px-20 border-b border-slate-100">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
                        <div><h4 className="text-xl sm:text-2xl font-black text-slate-900">50,000+</h4><p className="text-xs font-semibold text-slate-500">Happy Patients</p></div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Stethoscope className="w-6 h-6" /></div>
                        <div><h4 className="text-xl sm:text-2xl font-black text-slate-900">150+</h4><p className="text-xs font-semibold text-slate-500">Expert Doctors</p></div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award className="w-6 h-6" /></div>
                        <div><h4 className="text-xl sm:text-2xl font-black text-slate-900">25+</h4><p className="text-xs font-semibold text-slate-500">Years Excellence</p></div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
                        <div><h4 className="text-xl sm:text-2xl font-black text-slate-900">100%</h4><p className="text-xs font-semibold text-slate-500">Safe & Certified</p></div>
                    </div>
                </div>
            </section>

            {/* CLINICAL SPECIALTIES GRID */}
            <section className="py-16 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-12">
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">Our Medical Specialties</h3>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Get world-class treatments from our specialized clinical departments.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Cardiology", desc: "Heart care and failure diagnostics.", icon: <HeartPulse className="text-rose-500" /> },
                        { title: "Neurology", desc: "Advanced brain and nerve treatments.", icon: <Brain className="text-indigo-500" /> },
                        { title: "Orthopedics", desc: "Bone, joint, and fracture surgeries.", icon: <Bone className="text-amber-600" /> },
                        { title: "Pediatrics", desc: "Dedicated child healthcare & vaccines.", icon: <Baby className="text-sky-500" /> }
                    ].map((spec, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                            <div className="p-3 bg-slate-50 w-fit rounded-xl group-hover:scale-110 transition-transform mb-4">{spec.icon}</div>
                            <h4 className="text-lg font-bold text-slate-800 mb-1">{spec.title}</h4>
                            <p className="text-xs font-medium text-slate-500 mb-4">{spec.desc}</p>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                Medical Specialty
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* EXPERT CONSULTANTS BANNER */}
            <section className="py-16 bg-slate-100/60 px-6 sm:px-12 lg:px-20 border-y border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">Meet Our Consultants</h3>
                            <p className="text-sm text-slate-500 mt-2 font-medium">Qualified medical professionals ready to look after your health.</p>
                        </div>
                        <button className="bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wide shadow-sm cursor-default">
                            Our Medical Staff
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { name: "Dr. Asela Gunawardena", role: "Senior Cardiologist", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500&auto=format&fit=crop" },
                            { name: "Dr. Nilanthi Fernando", role: "Neurologist Consultant", img: "https://images.unsplash.com/photo-1594824813573-246434e33963?q=80&w=500&auto=format&fit=crop" },
                            { name: "Dr. Sanjaya Perera", role: "Pediatric Specialist", img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=500&auto=format&fit=crop" }
                        ].map((doc, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition duration-300">
                                <div className="h-64 bg-slate-200 relative">
                                    <img src={doc.img} alt={doc.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-5 text-center">
                                    <h4 className="font-black text-slate-900 text-lg leading-tight">{doc.name}</h4>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">{doc.role}</p>
                                    <button className="w-full mt-4 bg-slate-50 border border-slate-200 text-slate-400 font-bold py-2 rounded-xl text-xs uppercase tracking-wide cursor-default">
                                        Verified Consultant
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/*  CTA CALL TO ACTION BANNER */}
            <section className="bg-slate-900 py-16 px-6 my-16 mx-4 sm:mx-12 lg:mx-20 rounded-3xl text-center text-white relative overflow-hidden shadow-xl shadow-slate-950/10">
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h3 className="text-3xl lg:text-4xl font-black tracking-tight">Ready to prioritize your health today?</h3>
                    <p className="text-sm md:text-base opacity-70 font-medium max-w-xl mx-auto leading-relaxed">
                        Schedule your quick medical checkup or specialty specialist consultation queue slots in under a single minute.
                    </p>
                    <button
                        className="bg-slate-800 text-slate-400 font-bold px-8 py-3.5 rounded-xl mx-auto block text-sm uppercase tracking-wider cursor-default"
                    >
                        🔒 Channels via Portal Button Only
                    </button>
                </div>
            </section>

            {/*  FLOATING MESSAGE BUTTON */}
            <button
                className="fixed bottom-6 right-6 z-50 bg-slate-700 text-slate-300 font-bold px-5 py-3 rounded-full flex items-center gap-2 shadow-2xl transition duration-300 text-xs uppercase tracking-wider cursor-default"
            >
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Support Portal</span>
            </button>

            {/*  FOOTER */}
            <footer className="py-12 text-center border-t border-slate-200 bg-white px-4">
                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">MediCare Online Channeling Portal</p>
                <p className="text-[11px] text-slate-400 font-medium mt-2">© 2026 MediCare Hospital Corporation. All clinical rights reserved.</p>
            </footer>
        </div>
    );
};

export default HospitalHomePage;