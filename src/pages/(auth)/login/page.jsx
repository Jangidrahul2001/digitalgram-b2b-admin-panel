"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff
} from "@/components/icons";
import { cn } from "../../../lib/utils";
import { emailRegex, formatEmailInput, InputSlice } from "../../../utils/helperFunction";
import { usePost } from "../../../hooks/usePost";
import { apiEndpoints } from "../../../api/apiEndpoints";
import { toast } from "sonner";

export default function LoginPage() {

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { post: loginAdmin } = usePost(apiEndpoints?.adminLogin, {
    onSuccess: (data) => {
      if (data.success) {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      toast.error("Login Failed", {
        description: error.message || "Invalid credentials. Please try again.",
      });
      setIsLoading(false);
      navigate("/login"); // Return to login if authentication fails
    },
  });

  const handleLogin = async (e) => {
    e?.preventDefault();
    console.log(email, password);

    if (!email || !password) {
      toast.error("Missing Credentials", {
        description: "Please enter both email and password.",
      });
      return;
    }

    setIsLoading(true);

    // Save data for OTP and navigate immediately
    sessionStorage.setItem(
      "temp_auth_data",
      JSON.stringify({ email, password }),
    );
    navigate("/otp");

    // Perform background login
    loginAdmin({ email, password });
  };

  // Status: idle, validating, valid, invalid
  const [emailStatus, setEmailStatus] = useState("idle");

  // Email Validation Effect (Debounced)
  useEffect(() => {
    if (!email) {
      setEmailStatus("idle");
      return;
    }

    setEmailStatus("validating");


    const isValid = emailRegex.test(email);
    setEmailStatus(isValid ? "valid" : "invalid");
  }, [email]);

  return (
    <div className="h-screen w-full flex bg-[#F9F7F2] overflow-hidden relative font-sans items-center justify-center fixed inset-0">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.svg
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] md:top-[20%] left-[5%] md:left-[10%] w-16 md:w-24 h-8 md:h-12 text-gray-400 opacity-50"
          viewBox="0 0 100 50"
        >
          <path d="M10,25 C30,10 50,40 70,25" fill="none" stroke="currentColor" strokeWidth="2" />
        </motion.svg>

        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] md:top-[30%] left-[8%] md:left-[15%] w-16 md:w-24 h-16 md:h-20 border border-gray-400 flex flex-col gap-2 p-2 opacity-60"
        >
          <div className="h-0.5 w-8 md:w-12 bg-gray-400"></div>
          <div className="h-0.5 w-12 md:w-16 bg-gray-400"></div>
        </motion.div>

        <div className="absolute bottom-0 left-[5%] md:left-[10%] w-16 md:w-24 h-32 md:h-48 bg-[#FDCE85] opacity-90 flex flex-wrap gap-2 md:gap-4 p-2 md:p-4 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-black"></div>
          ))}
        </div>

        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20px] left-[15%] md:left-[18%] w-16 md:w-24 h-16 md:h-24 border border-gray-400 bg-white flex items-center justify-center"
        >
          <ArrowRight className="text-gray-500 w-8 md:w-12 h-8 md:h-12 -rotate-45" />
        </motion.div>

        <div className="hidden lg:block absolute bottom-[15%] right-[10%] w-[300px] h-[300px] z-0 scale-75 xl:scale-100 origin-bottom-right">
          <div className="relative w-full h-full">
            <div className="absolute right-10 bottom-20 w-32 h-32 bg-transparent z-10">
              <svg viewBox="0 0 200 200" className="w-64 h-64 text-slate-800 fill-current">
                <circle cx="100" cy="50" r="20" />
                <path d="M80,80 Q100,70 120,80 L140,140 L60,140 Z" />
                <rect x="70" y="140" width="20" height="40" />
                <rect x="110" y="140" width="20" height="40" />
              </svg>
            </div>
            <motion.div
              animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-32 bottom-40 w-16 h-12 bg-[#D4E781] -rotate-12"
            />

            {/* Background box (slow) */}
            <div className="absolute right-10 bottom-0 w-32 h-32 border border-black bg-white" />
          </div>
        </div>

        <div className="absolute bottom-0 right-[5%] w-16 md:w-24 h-24 md:h-32 bg-[#FDCE85] opacity-90 flex flex-wrap gap-2 md:gap-4 p-2 md:p-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-black"></div>
          ))}
        </div>

        <svg
          className="absolute top-[20%] md:top-[25%] right-[10%] md:right-[15%] w-24 md:w-32 h-8 md:h-12 text-gray-400 opacity-50"
          viewBox="0 0 100 50"
        >
          <path d="M10,25 Q30,5 50,25 T90,25" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="w-full h-full flex items-center justify-center relative z-10 px-4 py-4 md:py-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm w-[90%] max-w-[400px] md:max-w-[450px] p-6 md:p-10 text-center flex flex-col justify-center relative z-20"
        >
          <div className="mb-4 shrink-0">
            <h1 className="text-3xl font-bold text-black mb-2">Admin Login</h1>
            <p className="text-slate-500 text-sm leading-tight">
              Enter your details to sign in <br className="hidden md:block" />{" "}
              to your account
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4 md:space-y-5 mt-2 md:mt-4 text-left shrink-0"
          >
            <div className="space-y-4 font-sans">
              {/* Email Input with Live Validation */}
              <div className="relative group">
                <Input
                  placeholder="Enter Email"

                  value={email}
                  onChange={(e) => setEmail(formatEmailInput(e.target.value))}
                  className={cn(
                    "h-12 rounded-xl bg-gray-50 border transition-all text-sm placeholder:text-gray-400 w-full pl-4 pr-12",
                    emailStatus === "valid" ? "border-emerald-200 focus:border-emerald-500 bg-emerald-50/20" :
                      emailStatus === "invalid" ? "border-rose-200 focus:border-rose-500 bg-rose-50/20" :
                        "border-gray-200 focus:border-gray-900"
                  )}
                />

                {/* Visual Status Indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  <AnimatePresence mode="wait">
                    {emailStatus === "validating" ? (
                      <motion.div
                        key="validating"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      </motion.div>
                    ) : emailStatus === "valid" ? (
                      <motion.div
                        key="valid"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                      </motion.div>
                    ) : emailStatus === "invalid" ? (
                      <motion.div
                        key="invalid"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200"
                      >
                        <X className="w-3.5 h-3.5 text-rose-600" strokeWidth={3} onClick={() => {
                          setEmail("");
                        }} />
                      </motion.div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-200" />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <Input
                  placeholder="Passcode"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(InputSlice(e.target.value, 50))}
                  className="h-12 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 transition-all text-sm placeholder:text-gray-400 w-full pl-4 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-left flex justify-between items-center">
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-slate-400 hover:text-black"
              >
                Trouble signing in?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading || emailStatus === "invalid"}
              className={cn(
                "w-full h-12 bg-[#F2C078] hover:bg-[#EDB05A] text-black font-black uppercase tracking-widest rounded-xl shadow-none transition-all mt-2 text-sm",
                emailStatus === "invalid" && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Security Notice */}
            <div className="mt-2 pt-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center mb-1">
                    <ShieldCheck className="w-4.5 h-4.5 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                      Encryption Active
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight font-medium mt-1">
                      This is a secure administrative sector. <br />
                      All session data is end-to-end encrypted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
