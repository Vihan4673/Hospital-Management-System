import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { login } from "../services/authService";
import { useAuth } from "../context/useAuth";

interface FormData {
  identifier: string;
  password: string;
}

interface FormErrors {
  identifier?: string;
  password?: string;
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isIdentifierFocused, setIsIdentifierFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authenticate } = useAuth();
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);

  const backgroundImageUrl = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
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
          email: input,
          password: passwordInput,
          role: assignedRole
        };

        const response = await login(payload);

        toast.success(`Welcome back, ${response.user.name}!`);
        localStorage.setItem("user", JSON.stringify(response.user));
        authenticate(response.accessToken);

        if (response.user.role === "admin") {
          navigate("/dashboard");
        } else if (response.user.role === "doctor") {
          navigate("/doctor-dashboard");
        } else {
          navigate("/homepage");
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMsg = error.response?.data?.message || "Login failed. Please check credentials.";
          toast.error(errorMsg);
        } else {
          toast.error("Something went wrong");
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
      <div className="login-page font-sans text-gray-800 w-full min-h-screen overflow-y-auto">
        {/* Forgot Password Dialog */}
        {openForgotPasswordDialog && (
            <div
                className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={() => setOpenForgotPasswordDialog(false)}
            >
              <div
                  className="bg-white max-w-sm w-full mx-4 p-8 text-left rounded-2xl shadow-2xl transform transition-transform"
                  onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Forgot Password?</h2>
                <p className="text-gray-500 text-sm mb-6">Enter your registered email to reset your password.</p>

                <label htmlFor="reset-email" className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                    id="reset-email"
                    className="w-full border mt-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl py-3 px-4 transition-all"
                    type="email"
                    placeholder="name@example.com"
                />
                <button
                    type="button"
                    className="w-full mt-6 bg-blue-600 active:scale-95 transition-all py-3 rounded-xl text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                  Reset Password
                </button>
                <p className="text-gray-500 text-sm mt-6 text-center">
                  Remembered your password?
                  <button
                      onClick={() => setOpenForgotPasswordDialog(false)}
                      className="text-blue-600 hover:text-blue-700 hover:underline ml-1 font-semibold transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
        )}

        <div className="flex w-full lg:flex-row flex-col min-h-screen">
          <div
              className="hidden lg:flex w-1/2 flex-col justify-center items-center relative p-8"
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

          <div className="w-full lg:w-1/2 flex flex-col items-center bg-slate-50 py-8 px-4 sm:px-6 md:px-8 h-auto lg:h-screen overflow-y-auto justify-start lg:justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md flex flex-col items-center justify-center bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 my-auto"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-16 h-16 rounded-2xl mb-6 shadow-lg shadow-blue-500/40 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-all duration-300 flex-shrink-0">
                <span className="text-white text-3xl font-extrabold tracking-tighter">MC</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Sign In
              </h1>

              <p className="text-sm text-gray-500 mt-2 text-center mb-6">
                Access your medical records using Email or Doctor ID
              </p>

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

              <div className="w-full">
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

              <div className="w-full flex items-center justify-between mt-5 text-gray-600 flex-shrink-0">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-all"
                      type="checkbox"
                  />
                  <span className="text-sm select-none group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
                </label>
                <button
                    type="button"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                    onClick={() => setOpenForgotPasswordDialog(true)}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-8 w-full h-14 rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all font-semibold text-lg shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:pointer-events-none flex-shrink-0"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              <div className="flex items-center gap-4 w-full my-8 flex-shrink-0">
                <div className="h-px bg-gray-200 flex-1"></div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  or sign in with
                </p>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Google Login */}
              <div className="flex justify-center w-full flex-shrink-0">
                <button
                    type="button"
                    className="w-full h-12 border-2 border-gray-200 bg-white flex items-center justify-center gap-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-600"
                >
                  <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                      alt="Google"
                      className="w-5 h-5"
                  />
                  Continue with Google
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="text-gray-500 text-sm mt-8 flex-shrink-0">
                New to Medicare?
                <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline ml-1.5 transition-colors">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;