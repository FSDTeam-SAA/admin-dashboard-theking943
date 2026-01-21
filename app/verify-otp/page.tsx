'use client';

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/lib/api-client";
import Loading from "./loading";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    if (!email) {
      toast.error("Email not found. Please try forgot password again.");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.verifyOTP(email, otpCode);
      toast.success("OTP verified successfully");
      router.push(`/reset-password?email=${email}&otp=${otpCode}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email not found");
      return;
    }

    setResendLoading(true);
    try {
      await authAPI.sendOTP(email);
      setTimeLeft(300);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("OTP sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            <h2 className="text-2xl font-bold text-blue-600 mb-2 text-center">Enter OTP</h2>
            <p className="text-gray-600 text-center mb-6">Enter the 6-digit code sent to your Email Address</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="*"
                  />
                ))}
              </div>

              {/* Timer and Resend */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Didn't Receive OTP?{" "}
                  {timeLeft > 0 ? (
                    <span className="text-gray-500">Resend in {formatTime(timeLeft)}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendLoading}
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendLoading ? "Sending..." : "RESEND OTP"}
                    </button>
                  )}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || otp.some((d) => !d)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Log In"}
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
