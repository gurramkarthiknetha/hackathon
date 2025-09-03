// src/pages/auth/SignUpPage.jsx

import { useState } from "react";
import { Loader, Lock, Mail, User, UserCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../../components/ui/Input";
import PasswordStrengthMeter from "../../components/forms/PasswordStrengthMeter";
import { useAuthStore } from "../../store/authStore";
import { validateEmail, validatePassword, validateName } from "../../utils/validation";

function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Operator");
  const [open, setOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  const validateField = (fieldName, value) => {
    let validation;
    switch (fieldName) {
      case "email":
        validation = validateEmail(value);
        break;
      case "password":
        validation = validatePassword(value);
        break;
      case "name":
        validation = validateName(value);
        break;
      default:
        return;
    }
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: validation.isValid ? null : validation.message,
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    const emailVal = validateEmail(email);
    const passwordVal = validatePassword(password);
    const nameVal = validateName(name);

    const errors = {};
    if (!emailVal.isValid) errors.email = emailVal.message;
    if (!passwordVal.isValid) errors.password = passwordVal.message;
    if (!nameVal.isValid) errors.name = nameVal.message;

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    try {
      await signup(email, password, name, role.toLowerCase());
      navigate("/verify-email");
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };

  const roles = ["Operator", "Emergency Responder", "Administrator"];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl shadow-2xl 
  bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
  border border-gray-700">
  <div className="p-8">
    <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text">
      Create Account
    </h2>


          <form onSubmit={handleSignUp}>
            <Input
              icon={User}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateField("name", e.target.value);
              }}
              error={fieldErrors.name}
            />
            <Input
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField("email", e.target.value);
              }}
              error={fieldErrors.email}
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField("password", e.target.value);
              }}
              error={fieldErrors.password}
            />

            <PasswordStrengthMeter password={password} />

            {/* Animated Dropdown */}
            <div className="relative mt-6">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between bg-gray-700 bg-opacity-50 text-white text-sm border border-gray-600 rounded-lg pl-3 pr-3 py-2 focus:outline-none hover:border-cyan-400 transition"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="text-blue-400" size={18} />
                  {role}
                </span>
                <svg
                  className={`h-5 w-5 transform transition-transform ${open ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
                  >
                    {roles.map((r) => (
                      <li
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setOpen(false);
                        }}
                        className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer transition"
                      >
                        {r}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <button
              className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : "Sign Up"}
            </button>
          </form>

          <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center rounded-b-2xl">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
