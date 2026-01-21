'use client';

import React, { useEffect, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { authAPI } from "@/lib/api-client";
import Loading from "./loading";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email") || "";
    const otpParam = searchParams.get("otp") || "";
    setEmail(emailParam);
    setOtp(otpParam);
  }, [searchParams]);

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Invalid reset request. Please try again.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(email, otp, password);
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Suspense fallback={<Loading />}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-3xl font-bold">+</span>
              </div>
              <h1 className="text-3xl font-bold text-blue-600">Docmobi</h1>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-600 mb-2 text-center">Reset Password</h2>
            <p className="text-gray-600 text-center mb-6">Enter your new password below</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Field */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
                {password && validatePassword(password) && (
                  <p className="text-red-500 text-sm mt-1">{validatePassword(password)}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? "Resetting..." : "Continue"}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
