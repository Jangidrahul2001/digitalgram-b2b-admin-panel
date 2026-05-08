"use client";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../components/ui/card";
import {
  Mail,
  ArrowRight,
  Loader2,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
} from "@/components/icons";
import { toast } from "sonner";
import { formatEmailInput, InputSlice } from "../../../utils/helperFunction";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("email"); // email, reset, success
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    // Simulate API call to send code/link
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStep("reset");
    toast.success("Verification code sent!", {
      description: "Please check your email for the verification code.",
    });
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    // Simulate API call to reset password
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStep("success");
    toast.success("Password reset successfully!");
    setIsLoading(false);

    // Auto-login or redirect after a delay
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        <Card className="border-slate-200 shadow-sm bg-white/70 backdrop-blur-xl overflow-hidden">
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <KeyRound className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    Forgot Password?
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-base">
                    Enter your email to receive a verification code.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                        <Input
                          placeholder="name@example.com"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: formatEmailInput(e.target.value) })}
                          className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 text-slate-900 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {step === "reset" && (
              <motion.div
                key="reset-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                    Reset Password
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Enter the code sent to your email and your new password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-4">
                      {/* Code Field */}
                      <div className="relative group">
                        <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-600" />
                        <Input
                          placeholder="Verification Code"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: InputSlice(e.target.value) })}
                          className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-orange-500 rounded-xl"
                        />
                      </div>

                      {/* New Password */}
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-600" />
                        <Input
                          placeholder="New Password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: InputSlice(e.target.value) })}
                          className="pl-10 pr-10 h-12 bg-white/50 border-slate-200 focus:border-orange-500 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Confirm Password */}
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-600" />
                        <Input
                          placeholder="Confirm New Password"
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: InputSlice(e.target.value) })}
                          className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-orange-500 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg mt-4"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8"
              >
                <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Password Updated!</h3>
                <p className="text-slate-500 mb-8">
                  Your password has been successfully reset. Redirecting you to login...
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Go to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== "success" && (
            <CardFooter className="justify-center border-t border-slate-100 bg-slate-50/50 py-6">
              <Link
                to="/login"
                className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
