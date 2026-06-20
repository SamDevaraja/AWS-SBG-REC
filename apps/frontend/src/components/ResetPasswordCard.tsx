"use client";

import React, { useState } from "react";
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Circle
} from "lucide-react";
import { InputField } from "./InputField";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export const ResetPasswordCard = () => {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const validations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const passwordsMatch = formData.confirmPassword
    ? formData.password === formData.confirmPassword
    : null;

  const validationItems = [
    { key: "length", label: "Minimum 8 Characters" },
    { key: "uppercase", label: "One Uppercase Letter" },
    { key: "number", label: "One Number" },
    { key: "special", label: "One Special Character" },
  ] as const;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allValid = Object.values(validations).every(v => v === true);
    if (!allValid || !passwordsMatch) {
      setStatus({ type: "error", message: "Please ensure all requirements are met and passwords match." });
      return;
    }

    if (!token) {
      setStatus({ type: "error", message: "Invalid or missing reset token." });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus({ type: "success", message: data.message });
      } else {
        setStatus({ type: "error", message: data.message || "Failed to reset password." });
      }
    } catch {
      setStatus({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (status?.type === "success") {
    return (
      <div className="relative z-10 w-full max-w-[460px] bg-white/85 backdrop-blur-md border border-slate-300 rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col items-start text-left py-6 w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-slate-900 text-[24px] font-bold tracking-tight mb-2 auth-card-heading">Password Reset!</h1>
          <p className="text-slate-500 text-[14px] font-medium mb-8">
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>
          <Link 
            href="/login" 
            className="w-full h-11 bg-[#232F3E] hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 font-medium text-[15px] font-display tracking-wide transition-all shadow-sm"
          >
            Go to Login
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-[460px] bg-white/85 backdrop-blur-md border border-slate-300 rounded-2xl p-8 sm:p-10">
      {/* Header Bar Section */}
      <div className="flex flex-col items-start text-left mb-5 w-full">
        <h1 className="text-slate-900 text-[24px] font-bold tracking-tight mb-1 auth-card-heading">
          Set New Password
        </h1>
        <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
          Please choose a strong password to secure your account.
        </p>
      </div>

      {/* Form Section */}
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <InputField
            label="New Password"
            type="password"
            name="password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Validation Checklist */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {validationItems.map((item) => {
              const isValid = validations[item.key as keyof typeof validations];
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <div>
                    {isValid ? (
                      <CheckCircle2 size={12} className="text-green-500" />
                    ) : (
                      <Circle size={12} className="text-aws-slate/30" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider transition-colors duration-300",
                    isValid ? "text-green-600" : "text-slate-500"
                  )}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <InputField
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            error={passwordsMatch === false}
          />

          {passwordsMatch !== null && (
            <div>
              <p className={cn(
                "text-[10px] font-semibold",
                passwordsMatch ? "text-green-600" : "text-red-500"
              )}>
                {passwordsMatch ? "✓ Passwords Match" : "⚠ Passwords do not match"}
              </p>
            </div>
          )}
        </div>

        {status && (
          <div className="p-3 rounded-lg text-[13px] font-semibold text-center border bg-red-50 border-red-200 text-red-700">
            {status.message}
          </div>
        )}

        {/* Primary Button */}
        <button
          disabled={isLoading}
          type="submit"
          className={cn(
            "relative w-full h-11 mt-4 overflow-hidden rounded-lg",
            "bg-[#232F3E] hover:bg-slate-800 transition-colors duration-300",
            "text-white font-medium text-[15px] font-display tracking-wide capitalize",
            "shadow-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed group"
          )}
        >
          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? "Updating..." : "Reset Password"}
            <RefreshCw size={16} className={cn("transition-transform", isLoading ? "animate-spin" : "group-hover:rotate-180 duration-500")} />
          </div>
        </button>
      </form>
    </div>
  );
};
