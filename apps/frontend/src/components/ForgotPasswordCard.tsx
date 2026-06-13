"use client";

import React, { useState } from "react";
import { 
  Mail, 
  ArrowLeft,
  Send
} from "lucide-react";
import { InputField } from "./InputField";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const ForgotPasswordCard = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        // Use the server's message directly — it's crafted to be safe (anti-enumeration)
        setStatus({ type: "success", message: data.message });
      } else {
        setStatus({ type: "error", message: data.message || "Failed to send reset link." });
      }
    } catch {
      setStatus({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[480px]">
      <div className="bg-white shadow-premium rounded-[16px] py-8 px-6 flex flex-col items-center overflow-hidden border border-slate-200 w-full">
        {/* Back Button */}
        <div className="w-full mb-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#232F3E] transition-colors font-medium text-xs">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>

        {/* Header Bar Section */}
        <div className="flex flex-col items-center text-center mb-6 w-full">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <img src="/brand-logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span className="brand-note-text text-[10px] uppercase tracking-wider">
              AWS Student Builders Group REC
            </span>
          </div>
          <h1 className="text-slate-900 text-2xl font-semibold tracking-tight mb-1 font-display">
            Forgot Password?
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        {/* Form Section */}
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          <InputField
            label="Email Address"
            type="email"
            name="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {status && (
            <div
              className={cn(
                "p-3 rounded-lg text-[13px] font-semibold text-center border",
                status.type === "success" 
                  ? "bg-green-50 border-green-200 text-green-700" 
                  : "bg-red-50 border-red-200 text-red-700"
              )}
            >
              {status.message}
            </div>
          )}

          {/* Primary Button */}
          <button
            disabled={isLoading}
            type="submit"
            className={cn(
              "relative w-full h-11 mt-6 overflow-hidden rounded-lg",
              "bg-[#232F3E] hover:bg-[#161e27] transition-all duration-300",
              "text-white font-medium text-[15px] font-display tracking-wide capitalize",
              "shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed group"
            )}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? "Sending..." : "Send Instructions"}
              <Send size={16} className={cn("transition-transform", !isLoading && "group-hover:translate-x-1 group-hover:-translate-y-1")} />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};
