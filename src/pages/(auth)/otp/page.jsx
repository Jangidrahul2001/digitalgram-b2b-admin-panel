
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ShieldCheck, Loader2, ArrowRight } from "@/components/icons";
import { toast } from "sonner";
import { apiEndpoints } from "../../../api/apiEndpoints";
import { usePost } from "../../../hooks/usePost";
import { useDispatch } from "react-redux";
import { fetchProfile } from "../../../store/slices/profileSlice";

export default function OtpPage() {
  const navigate = useNavigate();
  const [isOtpResending, setIsOtpResending] = useState(false);
  // const { handleLogin, setPassword, setEmail } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      pastedData.forEach((value, index) => {
        if (index < 6 && !isNaN(value)) {
          newOtp[index] = value;
        }
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)].focus();
    }
  };

  const { post: otpVerify } = usePost(apiEndpoints?.verifyOtp, {
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("isAuthenticated", "true");
        const finalToken = data?.token;
        if (finalToken) localStorage.setItem("token", finalToken);
        dispatch(fetchProfile());
        toast.success("Identity Verified", {
          description: "Welcome to the dashboard.",
        });
        sessionStorage.removeItem("temp_auth_data");
        setIsLoading(false);
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
      }
    },

    onError: (error) => {
      toast.error(error.message || "Invalid OTP. Please try again.");
      setIsLoading(false);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
  });

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const tempData = sessionStorage.getItem("temp_auth_data");

      if (!tempData) {
        setIsLoading(false);
        toast.error("Session expired", { description: "Please login again." });
        navigate("/login", { replace: true });
        return;
      }

      const authData = JSON.parse(tempData);
      const email = authData.email;

      if (!email) {
        setIsLoading(false);
        toast.error("Invalid session data", {
          description: "Please login again.",
        });
        navigate("/login", { replace: true });
        return;
      }

      await otpVerify({
        email: email,
        otp: otpString,
      });
    } catch (error) {
      setIsLoading(false);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  const { post: resendOtp } = usePost(apiEndpoints?.adminLogin, {
    onSuccess: (data) => {
      if (data.success) {
        // setIsLoading(false);
        toast.success("OTP Resent Successfully");
        setIsOtpResending(false)
      }
    },
    onError: (error) => {
      console.error("Resend OTP Failed:", error);
      toast.error("Resend OTP Failed", {
        description: error.message || "Invalid credentials. Please try again.",
      });
      // setIsLoading(false);
      navigate("/login"); // Return to login if authentication fails
    },
  });


  const handleResendOtp = (e) => {
    e?.preventDefault();
    console.log(sessionStorage.getItem("temp_auth_data"));
    const email = JSON.parse(sessionStorage.getItem("temp_auth_data"))?.email || ""
    const password = JSON.parse(sessionStorage.getItem("temp_auth_data"))?.password || ""
    if (email && password) {
      setIsOtpResending(true)
      resendOtp({ email, password });
    }
    else {
      toast.error("Login again with credentials", {
        description: "Please enter both email and password.",
      });
      navigate("/login")
    }
  };
  console.log(sessionStorage.getItem("temp_auth_data"))
  useEffect(() => {

    if (sessionStorage.getItem("temp_auth_data") === null) {
      navigate("/login", { replace: true })
    }
  }, [])


  return (
    <div className="h-screen w-full flex bg-[#F9F7F2] overflow-hidden relative font-sans items-center justify-center fixed inset-0">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          className="absolute top-[10%] md:top-[20%] left-[5%] md:left-[10%] w-16 md:w-24 h-8 md:h-12 text-gray-400 opacity-50"
          viewBox="0 0 100 50"
        >
          <path
            d="M10,25 C30,10 50,40 70,25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <div className="absolute top-[25%] md:top-[30%] left-[8%] md:left-[15%] w-16 md:w-24 h-16 md:h-20 border border-gray-400 bg-transparent flex flex-col gap-2 p-2 opacity-60">
          <div className="h-0.5 w-8 md:w-12 bg-gray-400"></div>
          <div className="h-0.5 w-12 md:w-16 bg-gray-400"></div>
        </div>

        <div className="absolute bottom-0 left-[5%] md:left-[10%] w-16 md:w-24 h-32 md:h-48 bg-[#FDCE85] opacity-90 flex flex-wrap gap-2 md:gap-4 p-2 md:p-4 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-black"
            ></div>
          ))}
        </div>

        <div className="absolute bottom-[20px] left-[15%] md:left-[18%] w-16 md:w-24 h-16 md:h-24 border border-gray-400 bg-white flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-500 w-8 md:w-12 h-8 md:h-12 transform -rotate-45"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        <div className="hidden lg:block absolute bottom-[15%] right-[10%] w-[300px] h-[300px] z-0 scale-75 xl:scale-100 origin-bottom-right">
          <div className="relative w-full h-full">
            <div className="absolute right-10 bottom-20 w-32 h-32 bg-transparent z-10">
              <svg
                viewBox="0 0 200 200"
                className="w-64 h-64 text-slate-800 fill-current"
              >
                <circle cx="100" cy="50" r="20" />
                <path d="M80,80 Q100,70 120,80 L140,140 L60,140 Z" />
                <rect x="70" y="140" width="20" height="40" />
                <rect x="110" y="140" width="20" height="40" />
              </svg>
            </div>
            <div className="absolute right-32 bottom-40 w-16 h-12 bg-[#D4E781] transform -rotate-12 z-0"></div>
            <div className="absolute right-10 bottom-0 w-32 h-32 border border-black bg-white z-0"></div>
          </div>
        </div>

        <div className="absolute bottom-0 right-[5%] w-16 md:w-24 h-24 md:h-32 bg-[#FDCE85] opacity-90 flex flex-wrap gap-2 md:gap-4 p-2 md:p-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-black"
            ></div>
          ))}
        </div>

        <svg
          className="absolute top-[20%] md:top-[25%] right-[10%] md:right-[15%] w-24 md:w-32 h-8 md:h-12 text-gray-400 opacity-50"
          viewBox="0 0 100 50"
        >
          <path
            d="M10,25 Q30,5 50,25 T90,25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="w-full h-full flex items-center justify-center relative z-10 px-4 py-4 md:py-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm w-[90%] max-w-[400px] md:max-w-[450px] p-6 md:p-10 text-center flex flex-col justify-center relative z-20"
        >
          <div className="mb-6 shrink-0">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#fcebd0] flex items-center justify-center text-orange-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">
              Two-Step Verification
            </h1>
            <p className="text-slate-500 text-sm leading-tight">
              We sent a verification code to <br /> your email. Enter the code
              below.
            </p>
          </div>

          <form
            onSubmit={handleVerify}
            className="space-y-6 text-left shrink-0"
          >
            <div className="flex justify-center gap-2 md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-bold rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#F2C078] focus:border-[#F2C078] outline-none transition-all caret-black"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#F2C078] hover:bg-[#EDB05A] text-black font-bold rounded-xl shadow-none transition-all mt-4 text-sm md:text-base"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center text-xs mt-4">
              <span className="text-slate-400">Didn&apos;t receive code? </span>
              <button
                onClick={handleResendOtp}
                type="button"
                className="font-bold text-black hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                {isOtpResending ? "Resending..." : "Resend Code"}
              </button>
            </div>

            <div className="text-center mt-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-400 hover:text-black hover:underline transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
