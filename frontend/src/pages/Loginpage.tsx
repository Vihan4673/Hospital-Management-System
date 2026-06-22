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

  const backgroundImageUrl = "hospital-bg.jpeg";

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

        let gradingResponse;
        const response = gradingResponse ? await login(payload) : await login(payload);

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
      <div className="login-page">
        {/* Forgot Password Dialog */}
        {openForgotPasswordDialog && (
            <div
                className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-40 z-50"
                onClick={() => setOpenForgotPasswordDialog(false)}
            >
              <div
                  className="bg-white text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded shadow-[0px_0px_10px_0px] shadow-black/10"
                  onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Forgot Password?</h2>
                <label htmlFor="reset-email">Registered Email</label>
                <input
                    id="reset-email"
                    className="w-full border mt-1 border-gray-500/30 focus:border-indigo-500 outline-none rounded py-2.5 px-4"
                    type="email"
                    placeholder="Enter your registered email"
                />
                <button
                    type="button"
                    className="w-full my-3 bg-blue-600 active:scale-95 transition py-2.5 rounded text-white font-medium hover:bg-blue-700"
                >
                  Reset Password
                </button>
                <p className="text-gray-500/90 text-sm mt-4 text-center">
                  Remembered your password?
                  <button
                      onClick={() => setOpenForgotPasswordDialog(false)}
                      className="text-blue-600 hover:underline ml-1 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
        )}

        <div className="flex min-h-screen w-full">
          {/* Left Side - Hospital Branding */}
          <div
              className="hidden md:flex w-1/2 flex-col justify-center items-center bg-slate-900 text-center relative p-8"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
          >
            <div className="relative z-10 flex flex-col justify-center items-center text-white">
              <h1 className="text-2xl md:text-4xl font-semibold text-blue-400">
                Welcome to
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4 tracking-wide text-white">
                MEDICARE PORTAL
              </h2>
              <p className="text-sm md:text-base text-slate-300 max-w-md">
                Your Health, Our Priority. Connecting Patients and Healthcare Professionals Seamlessly.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full min-h-screen md:w-1/2 flex flex-col items-center justify-center bg-white">
            <form
                onSubmit={handleSubmit}
                className="md:w-96 w-80 flex flex-col items-center justify-center"
            >
              <div className="bg-blue-50 p-3 rounded-full mb-2">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-blue-800 tracking-tight">
                SIGN IN
              </h1>

              <p className="text-sm text-gray-500 mt-2 text-center">
                Access your medical records using Email or Doctor ID
              </p>

              <div className="w-full p-2 mt-4">
                <div
                    className={`flex items-center w-full bg-transparent border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-blue-600 ${
                        errors.identifier && submitted
                            ? "border-red-500"
                            : isIdentifierFocused
                                ? "border-blue-600 bg-slate-50/50"
                                : "border-gray-300"
                    }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      className="bg-transparent text-black/80 placeholder-gray-400 outline-none text-sm w-full h-full"
                  />
                </div>
                {errors.identifier && submitted && (
                    <div className="text-red-500 text-xs mt-1 text-left pl-6 w-full">
                      {errors.identifier}
                    </div>
                )}
              </div>

              {/* Password Field */}
              <div className="w-full p-2">
                <div
                    className={`flex items-center mt-3 w-full bg-transparent border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-blue-600 ${
                        errors.password && submitted
                            ? "border-red-500"
                            : isPasswordFocused
                                ? "border-blue-600 bg-slate-50/50"
                                : "border-gray-300"
                    }`}
                >
                  <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
                  </svg>
                  <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      className="bg-transparent text-black/80 placeholder-gray-400 outline-none text-sm w-full h-full"
                  />
                  <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="m-3 focus:outline-none"
                  >
                    {!showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7z" stroke="#6B7280" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.94 17.94C16.14 19.24 14.14 20 12 20 5 20 1 12 1 12c.73-1.31 1.63-2.52 2.66-3.6M22.08 11.08c-.56-1.31-1.33-2.5-2.29-3.52-1.9-1.97-4.29-3.01-6.79-3.01-.73 0-1.45.09-2.16.25M1 1l22 22" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                  </button>
                </div>
                {errors.password && submitted && (
                    <div className="text-red-500 text-xs mt-1 pl-6 text-left w-full">
                      {errors.password}
                    </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="w-full p-2 flex items-center justify-between mt-6 text-gray-500">
                <div className="flex items-center gap-2">
                  <input className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" id="checkbox" />
                  <label className="text-sm select-none" htmlFor="checkbox">
                    Remember me
                  </label>
                </div>
                <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                    onClick={() => setOpenForgotPasswordDialog(!openForgotPasswordDialog)}
                >
                  Forgot password?
                </button>
              </div>

              <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 w-full h-11 rounded-full text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all font-medium shadow-sm disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              <div className="flex items-center gap-4 w-full my-5">
                <div className="w-full h-px bg-gray-200"></div>
                <p className="text-nowrap text-xs text-gray-400 uppercase tracking-wider">
                  or corporate login
                </p>
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                    type="button"
                    className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-full hover:shadow-sm hover:bg-gray-200 transition-colors"
                    title="Sign in with Google"
                >
                  <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                      alt="Google"
                      className="w-5 h-5"
                  />
                </button>
              </div>

              <p className="text-gray-500 text-sm mt-6">
                New to our hospital?
                <Link to="/signup" className="text-blue-600 font-medium hover:underline ml-1">
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