import React from "react";
import { useNavigate } from "react-router-dom";

const HospitalHomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navigation Bar */}
            <nav className="flex justify-between items-center py-6 px-10 bg-white shadow-sm">
                <h1 className="text-2xl font-bold text-blue-700">MediCare Hospital</h1>
                <button
                    onClick={() => navigate("/PatientAptmentPage")}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Book Appointment
                </button>
            </nav>

            {/* Hero Section */}
            <header className="bg-gradient-to-r from-blue-900 to-indigo-800 py-20 px-6 text-center text-white">
                <h2 className="text-5xl font-extrabold mb-4">Quality Care, Close to You</h2>
                <p className="text-lg mb-8 opacity-90">Expert doctors and advanced technology for your health needs.</p>
                <button
                    onClick={() => navigate("/PatientAptmentPage")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105"
                >
                    🚀 Channel a Doctor Now
                </button>
            </header>

            {/* Services Section */}
            <section id="services" className="py-16 px-6 max-w-6xl mx-auto">
                <h3 className="text-3xl font-bold text-center mb-12">Our Medical Services</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    {["General Checkup", "Cardiology", "Pediatrics"].map((service) => (
                        <div key={service} className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center">
                            <h4 className="text-xl font-bold mb-4">{service}</h4>
                            <button
                                onClick={() => navigate("/PatientAptmentPage")}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                View Doctors →
                            </button>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <p className="text-slate-600">Need specific help?</p>
                    <button
                        onClick={() => navigate("/PatientAptmentPage")}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Let our AI Assistant guide you →
                    </button>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16 text-center text-white mx-6 rounded-3xl mb-12">
                <h3 className="text-3xl font-bold mb-4">Ready to take care of your health?</h3>
                <p className="mb-8 opacity-90">Schedule your consultation in under 60 seconds.</p>
                <button
                    onClick={() => navigate("/PatientAptmentPage")}
                    className="bg-white text-blue-700 font-extrabold px-8 py-4 rounded-xl hover:bg-slate-100 transition"
                >
                    📅 Book Your Visit Now
                </button>
            </section>

            {/* Footer */}
            <footer className="py-10 text-center border-t border-slate-200">
                <p className="text-slate-500">© 2026 MediCare Hospital. All rights reserved.</p>
                <button
                    onClick={() => navigate("/PatientAptmentPage")}
                    className="text-blue-500 hover:underline mt-2"
                >
                    Online Channeling Portal
                </button>
            </footer>
        </div>
    );
};

export default HospitalHomePage;