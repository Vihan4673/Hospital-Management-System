import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signUp } from "../services/authService";

interface FormData {
    fullName: string;
    identifier: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    fullName?: string;
    identifier?: string;
    password?: string;
    confirmPassword?: string;
}

const SignupPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isIdentifierFocused, setIsIdentifierFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        identifier: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const backgroundImageUrl = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop";

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        const input = formData.identifier.trim();
        if (!input) {
            newErrors.identifier = "Email Address or Doctor ID is required";
        } else {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
            if (!isEmail && !input.toUpperCase().startsWith("DOC")) {
                newErrors.identifier = "Please enter a valid email or Doctor ID (e.g., DOC005)";
            }
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (validateForm()) {
            setIsLoading(true);
            try {
                const input = formData.identifier.trim();
                const passwordInput = formData.password;

                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
                const isDoctor = !isEmail && input.toUpperCase().startsWith("DOC");
                const isAdmin = passwordInput.startsWith("admin");

                let assignedRole = "patient";
                if (isAdmin) {
                    assignedRole = "admin";
                } else if (isDoctor) {
                    assignedRole = "doctor";
                }

                const payload = {
                    name: formData.fullName,
                    password: passwordInput,
                    role: assignedRole,
                    ...(isDoctor ? { doctorId: input.toUpperCase() } : { email: input.toLowerCase() })
                };

                await signUp(payload);
                toast.success("Account created successfully!");
                navigate("/login");

            } catch (error) {
                if (error && typeof error === "object" && "response" in error) {
                    const axiosError = error as { response?: { data?: { message?: string } } };
                    const serverMessage = axiosError.response?.data?.message || "Registration failed";
                    toast.error(serverMessage);
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    return (
        <div className="signup-page font-sans text-gray-800 w-full min-h-screen overflow-y-auto">
            <div className="flex w-full md:flex-row flex-col min-h-screen">
                <div
                    className="hidden md:flex w-1/2 flex-col justify-center items-center relative p-8"
                    style={{
                        backgroundImage: `url(${backgroundImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                    <div className="relative z-10 flex flex-col justify-center items-center text-center p-6 max-w-lg">
                        <h1 className="text-2xl md:text-3xl font-medium text-blue-200 drop-shadow-sm">
                            Welcome to
                        </h1>
                        <h2 className="text-4xl md:text-5xl font-extrabold mt-2 mb-6 tracking-tight text-white drop-shadow-md">
                            MEDICARE <span className="text-blue-400">PORTAL</span>
                        </h2>
                        <p className="text-base md:text-lg text-slate-200 max-w-md leading-relaxed">
                            Your Health, Our Priority. Connecting Patients and Healthcare Professionals Seamlessly.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col items-center bg-slate-50 py-8 px-4 sm:px-6 md:px-8 h-auto md:h-screen overflow-y-auto justify-start md:justify-center">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-md flex flex-col items-center justify-center bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 my-auto animate-fade-in"
                    >
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-16 h-16 rounded-2xl mb-6 shadow-lg shadow-blue-500/40 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-all duration-300 flex-shrink-0 select-none">
                <span className="text-white text-2xl font-black tracking-wider font-mono">
                  MC
                </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight text-center">
                            Create Account
                        </h1>

                        <p className="text-sm text-gray-500 mt-2 text-center mb-6">
                            Register using your Email Address, Doctor ID or Admin Credentials
                        </p>

                        {/* Full Name Field */}
                        <div className="w-full mb-4">
                            <div
                                className={`flex items-center w-full bg-slate-50 border-2 h-14 rounded-xl overflow-hidden pl-5 gap-3 transition-colors duration-300 focus-within:bg-white ${
                                    errors.fullName && submitted
                                        ? "border-red-500"
                                        : isNameFocused
                                            ? "border-blue-600 shadow-sm"
                                            : "border-gray-200"
                                }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#9CA3AF" strokeWidth="2" />
                                    <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    onFocus={() => setIsNameFocused(true)}
                                    onBlur={() => setIsNameFocused(false)}
                                    className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base w-full h-full"
                                />
                            </div>
                            {errors.fullName && submitted && (
                                <div className="text-red-500 text-sm mt-1.5 text-left pl-2 font-medium">
                                    {errors.fullName}
                                </div>
                            )}
                        </div>

                        {/* Identifier Field (Email / Doctor ID) */}
                        <div className="w-full mb-4">
                            <div
                                className={`flex items-center w-full bg-slate-50 border-2 h-14 rounded-xl overflow-hidden pl-5 gap-3 transition-colors duration-300 focus-within:bg-white ${
                                    errors.identifier && submitted
                                        ? "border-red-500"
                                        : isIdentifierFocused
                                            ? "border-blue-600 shadow-sm"
                                            : "border-gray-200"
                                }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <input
                                    type="text"
                                    name="identifier"
                                    placeholder="Email Address or Doctor ID"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    onFocus={() => setIsIdentifierFocused(true)}
                                    onBlur={() => setIsIdentifierFocused(false)}
                                    className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base w-full h-full"
                                />
                            </div>
                            {errors.identifier && submitted && (
                                <div className="text-red-500 text-sm mt-1.5 text-left pl-2 font-medium">
                                    {errors.identifier}
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="w-full mb-4">
                            <div
                                className={`flex items-center w-full bg-slate-50 border-2 h-14 rounded-xl overflow-hidden pl-5 gap-3 transition-colors duration-300 focus-within:bg-white ${
                                    errors.password && submitted
                                        ? "border-red-500"
                                        : isPasswordFocused
                                            ? "border-blue-600 shadow-sm"
                                            : "border-gray-200"
                                }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base w-full h-full"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="px-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                >
                                    {!showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.94 17.94C16.14 19.24 14.14 20 12 20 5 20 1 12 1 12c.73-1.31 1.63-2.52 2.66-3.6M22.08 11.08c-.56-1.31-1.33-2.5-2.29-3.52-1.9-1.97-4.29-3.01-6.79-3.01-.73 0-1.45.09-2.16.25M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && submitted && (
                                <div className="text-red-500 text-sm mt-1.5 pl-2 text-left font-medium">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="w-full mb-2">
                            <div
                                className={`flex items-center w-full bg-slate-50 border-2 h-14 rounded-xl overflow-hidden pl-5 gap-3 transition-colors duration-300 focus-within:bg-white ${
                                    errors.confirmPassword && submitted
                                        ? "border-red-500"
                                        : isConfirmPasswordFocused
                                            ? "border-blue-600 shadow-sm"
                                            : "border-gray-200"
                                }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onFocus={() => setIsConfirmPasswordFocused(true)}
                                    onBlur={() => setIsConfirmPasswordFocused(false)}
                                    className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base w-full h-full"
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="px-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                >
                                    {!showConfirmPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.94 17.94C16.14 19.24 14.14 20 12 20 5 20 1 12 1 12c.73-1.31 1.63-2.52 2.66-3.6M22.08 11.08c-.56-1.31-1.33-2.5-2.29-3.52-1.9-1.97-4.29-3.01-6.79-3.01-.73 0-1.45.09-2.16.25M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && submitted && (
                                <div className="text-red-500 text-sm mt-1.5 pl-2 text-left font-medium">
                                    {errors.confirmPassword}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-8 w-full h-14 rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all font-semibold text-lg shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:pointer-events-none flex-shrink-0"
                        >
                            {isLoading ? "Creating account..." : "Sign Up"}
                        </button>

                        <p className="text-gray-500 text-sm mt-8 flex-shrink-0">
                            Already have an account?
                            <Link
                                to="/login"
                                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline ml-1.5 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;