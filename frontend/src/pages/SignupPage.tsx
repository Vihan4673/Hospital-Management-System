import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { signUp } from "../services/authService";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Updated background image variable name placeholder for medical layout
  const backgroundImageUrl = "hospital-bg.jpeg";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
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
        const response = await signUp({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
        toast.success('Account created successfully!');
        console.log(response.name);
        navigate("/login");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message);
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
        <div className="flex min-h-screen w-full">
          {/* Left Side: Medical Hero Section */}
          <div
              className="hidden md:flex w-4/5 flex-col justify-center items-center bg-teal-950 p-8 text-center relative"
              style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
          >
            {/* Subtle dark overlay for healthcare aesthetics and contrast */}
            <div className="absolute inset-0 bg-teal-950/40 z-0"></div>

            <div className="relative z-10 flex flex-col justify-center items-center text-white p-8">
              <h1 className="text-2xl md:text-3xl font-semibold text-teal-100">
                Welcome to
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-white drop-shadow-md">
                MEDICARE CARE HOSPITAL
              </h2>
              <p className="text-sm md:text-base text-teal-50 font-light max-w-md">
                Your Health, Our Priority. Providing Exceptional Clinical and Digital Care.
              </p>
            </div>
          </div>

          {/* Right Side: Registration Portal */}
          <div className="w-full min-h-90 flex flex-col items-center justify-center bg-slate-50">
            <form
                onSubmit={handleSubmit}
                className="md:w-96 w-80 flex flex-col items-center justify-center"
            >
              {/* Swapped library logo with hospital-logo.jpeg */}
              <img src="hospital-logo.jpeg" alt="Hospital Logo" className="w-16 h-16 object-contain mb-2" />

              <h1 className="text-2xl md:text-2xl font-bold text-teal-800 tracking-wide">
                CREATE ACCOUNT
              </h1>

              <p className="text-sm text-gray-500/90 mt-2 text-center">
                Join our healthcare platform to manage your clinical portal
              </p>

              {/* Full Name Input Field */}
              <div className="w-full mt-6">
                <div
                    className={`flex items-center w-full bg-white border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-teal-500 ${
                        errors.fullName && submitted
                            ? "border-red-500"
                            : isNameFocused
                                ? "border-teal-500 bg-teal-50/10"
                                : "border-gray-300/80"
                    }`}
                >
                  <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="#14B8A6" // Medical Teal Icon Accent
                        strokeWidth="2"
                    />
                    <path
                        d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                        stroke="#14B8A6" // Medical Teal Icon Accent
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                  </svg>
                  <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                      className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full"
                  />
                </div>
                {errors.fullName && submitted && (
                    <div className="text-red-500 text-xs mt-1 text-left pl-6 w-full">
                      {errors.fullName}
                    </div>
                )}
              </div>

              {/* Email Input Field */}
              <div className="w-full mt-4">
                <div
                    className={`flex items-center w-full bg-white border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-teal-500 ${
                        errors.email && submitted
                            ? "border-red-500"
                            : isEmailFocused
                                ? "border-teal-500 bg-teal-50/10"
                                : "border-gray-300/80"
                    }`}
                >
                  <svg
                      width="16"
                      height="11"
                      viewBox="0 0 16 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                        fill="#14B8A6" // Medical Teal Icon Accent
                    />
                  </svg>
                  <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full"
                  />
                </div>
                {errors.email && submitted && (
                    <div className="text-red-500 text-xs mt-1 text-left pl-6 w-full">
                      {errors.email}
                    </div>
                )}
              </div>

              {/* Password Input Field */}
              <div className="w-full mt-4">
                <div
                    className={`flex items-center w-full bg-white border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-teal-500 ${
                        errors.password && submitted
                            ? "border-red-500"
                            : isPasswordFocused
                                ? "border-teal-500 bg-teal-50/10"
                                : "border-gray-300/80"
                    }`}
                >
                  <svg
                      width="13"
                      height="17"
                      viewBox="0 0 13 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                        fill="#14B8A6" // Medical Teal Icon Accent
                    />
                  </svg>

                  <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Security Password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full"
                  />

                  <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="m-3 cursor-pointer"
                  >
                    {!showPassword ? (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                              d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7z"
                              stroke="#6B7280"
                              strokeWidth="2"
                          />
                          <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2" />
                        </svg>
                    ) : (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                              d="M17.94 17.94C16.14 19.24 14.14 20 12 20 5 20 1 12 1 12c.73-1.31 1.63-2.52 2.66-3.6M22.08 11.08c-.56-1.31-1.33-2.5-2.29-3.52-1.9-1.97-4.29-3.01-6.79-3.01-.73 0-1.45.09-2.16.25M1 1l22 22"
                              stroke="#6B7280"
                              strokeWidth="2"
                              strokeLinecap="round"
                          />
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

              {/* Confirm Password Input Field */}
              <div className="w-full mt-4">
                <div
                    className={`flex items-center w-full bg-white border h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors duration-300 focus-within:border-teal-500 ${
                        errors.confirmPassword && submitted
                            ? "border-red-500"
                            : isConfirmPasswordFocused
                                ? "border-teal-500 bg-teal-50/10"
                                : "border-gray-300/80"
                    }`}
                >
                  <svg
                      width="13"
                      height="17"
                      viewBox="0 0 13 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55(2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                        fill="#14B8A6" // Medical Teal Icon Accent
                    />
                  </svg>

                  <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Security Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setIsConfirmPasswordFocused(true)}
                      onBlur={() => setIsConfirmPasswordFocused(false)}
                      className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full"
                  />

                  <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="m-3 cursor-pointer"
                  >
                    {!showConfirmPassword ? (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                              d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7z"
                              stroke="#6B7280"
                              strokeWidth="2"
                          />
                          <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2" />
                        </svg>
                    ) : (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                              d="M17.94 17.94C16.14 19.24 14.14 20 12 20 5 20 1 12 1 12c.73-1.31 1.63-2.52 2.66-3.6M22.08 11.08c-.56-1.31-1.33-2.5-2.29-3.52-1.9-1.97-4.29-3.01-6.79-3.01-.73 0-1.45.09-2.16.25M1 1l22 22"
                              stroke="#6B7280"
                              strokeWidth="2"
                              strokeLinecap="round"
                          />
                        </svg>
                    )}
                  </button>
                </div>

                {errors.confirmPassword && submitted && (
                    <div className="text-red-500 text-xs mt-1 pl-6 text-left w-full">
                      {errors.confirmPassword}
                    </div>
                )}
              </div>

              {/* Submit Button (Hospital Styled Teal Color) */}
              <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-8 w-full h-11 rounded-full text-white bg-teal-600 hover:bg-teal-700 font-medium tracking-wide active:scale-95 transition-all disabled:opacity-70 shadow-sm"
              >
                {isLoading ? "Creating Portal Account..." : "Register Now"}
              </button>

              <div className="flex items-center gap-4 w-full my-5">
                <div className="w-full h-px bg-gray-200"></div>
                <p className="w-full text-nowrap text-xs text-gray-400 text-center">
                  or sign up with enterprise
                </p>
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              {/* OAuth Buttons (Maintained Structure) */}
              <div className="flex flex-wrap gap-4 mt-1 justify-center">
                <button
                    type="button"
                    className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center rounded-full hover:shadow-sm"
                >
                  <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                      alt="Google"
                      className="w-5 h-5"
                  />
                </button>

                <button
                    type="button"
                    className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center rounded-full hover:shadow-sm"
                >
                  <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
                      alt="Facebook"
                      className="w-5 h-5"
                  />
                </button>
              </div>

              <p className="text-gray-500/90 text-sm mt-6">
                Already have a clinical account?
                <Link to="/login" className="text-teal-600 font-medium hover:underline ml-1">
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