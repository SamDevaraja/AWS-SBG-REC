"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  LogIn
} from "lucide-react";
import { InputField } from "./InputField";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";


export const LoginCard = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // If user is already logged in, redirect them to the correct dashboard
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const user = JSON.parse(raw);
        const role: string = (user?.role ?? '').toLowerCase().trim();
        if (role === 'core') {
          router.replace('/core/dashboard');
        } else if (role === 'crew') {
          router.replace('/crew/dashboard');
        } else if (role) {
          router.replace('/events/dashboard');
        }
      }
    } catch {
      localStorage.removeItem('aws_sgb_rec_user');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();
      if (data.success) {
        const role: string = data.user.role ?? 'enthusiasts';

        // Cache user details (including role) for RBAC
        localStorage.setItem("aws_sgb_rec_user", JSON.stringify({
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          role,
        }));

        if (data.user.accessToken) {
          localStorage.setItem("accessToken", data.user.accessToken);
        }

        setStatus({ type: "success", message: "Successfully logged in! Redirecting..." });

        // Role-based redirect — short delay so success message is visible
        let redirectPath = '/events/dashboard';
        if (role === 'core') redirectPath = '/core/dashboard';
        else if (role === 'crew') redirectPath = '/crew/dashboard';

        setTimeout(() => {
          router.push(redirectPath);
        }, 400);
      } else {
        setStatus({ type: "error", message: data.message || "Login failed. Please try again." });
      }
    } catch {
      setStatus({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative z-10 w-full max-w-[460px] bg-white/85 backdrop-blur-md border border-slate-300 rounded-2xl p-8 sm:p-10">
      {/* Header */}
      <div className="flex flex-col items-start text-left mb-5 w-full">
        <h1 className="text-slate-900 text-3xl font-bold tracking-tight mb-1.5 font-display auth-card-heading">
          Welcome Back
        </h1>
        <p className="text-slate-500 text-sm font-normal leading-relaxed">
          Log in to your cloud dashboard.
        </p>
      </div>

      {/* Form */}
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Email Address"
          type="email"
          name="email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="space-y-2">
          <InputField
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-normal text-slate-500 hover:text-[#E47911] transition-colors">
              Forgot Password?
            </Link>
          </div>
        </div>

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
            {isLoading ? "Signing In..." : "Sign In"}
            <LogIn size={16} className={cn("transition-transform", !isLoading && "group-hover:translate-x-1")} />
          </div>
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-500 text-sm font-normal">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#E47911] hover:underline font-semibold transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};
