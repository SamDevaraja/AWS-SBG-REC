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
import { clearSessionCache } from "./AuthWrapper";

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

        // Bust session cache so AuthWrapper picks up the new role immediately
        clearSessionCache();

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

  // ── Demo / Mock login (bypasses DB, for UI-only collaborators) ──────────────
  const DEMO_ACCOUNTS = [
    {
      role: 'core',
      label: 'Core Admin',
      name: 'Alex Carter',
      email: 'alex.carter@demo.aws',
      redirect: '/core/dashboard',
      bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      dot: 'bg-amber-400',
      initials: 'AC',
      avatarBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    },
    {
      role: 'crew',
      label: 'Crew Member',
      name: 'Jordan Lee',
      email: 'jordan.lee@demo.aws',
      redirect: '/crew/dashboard',
      bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-300',
      text: 'text-indigo-800',
      badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-400',
      initials: 'JL',
      avatarBg: 'bg-gradient-to-br from-indigo-400 to-blue-500',
    },
    {
      role: 'enthusiasts',
      label: 'Enthusiast',
      name: 'Sam Rivera',
      email: 'sam.rivera@demo.aws',
      redirect: '/events/dashboard',
      bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300',
      text: 'text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-400',
      initials: 'SR',
      avatarBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    },
  ] as const;

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[number]) => {
    clearSessionCache();
    localStorage.setItem('aws_sgb_rec_user', JSON.stringify({
      id: `demo-${account.role}-001`,
      fullName: account.name,
      email: account.email,
      role: account.role,
    }));
    router.push(account.redirect);
  };

  return (
    <div className="relative z-10 w-full max-w-[480px]">
      <div className="bg-white shadow-premium rounded-[16px] py-8 px-6 flex flex-col items-center overflow-hidden border border-slate-200 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6 w-full">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <img src="/brand-logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span className="brand-note-text text-[10px] uppercase tracking-wider">
              AWS Student Builders Group REC
            </span>
          </div>
          <h1 className="text-slate-900 text-2xl font-semibold tracking-tight mb-1 font-display">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
            Log in to your cloud dashboard.
          </p>
        </div>

        {/* Form */}
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
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
            <div className="flex justify-end px-1">
              <Link href="/forgot-password" className="text-xs font-normal text-slate-500 hover:text-[#232F3E] transition-colors">
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
              "relative w-full h-11 mt-6 overflow-hidden rounded-lg",
              "bg-[#232F3E] hover:bg-[#161e27] transition-all duration-300",
              "text-white font-medium text-[15px] font-display tracking-wide capitalize",
              "shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed group"
            )}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? "Signing In..." : "Sign In"}
              <LogIn size={16} className={cn("transition-transform", !isLoading && "group-hover:translate-x-1")} />
            </div>
          </button>
        </form>

        {/* ── Demo Access ─────────────────────────────────────────────────── */}
        <div className="w-full mt-6">
          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-1">
              Preview Access
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Container */}
          <div className="rounded-[12px] border border-slate-100 bg-slate-50/60 overflow-hidden divide-y divide-slate-100">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => handleDemoLogin(account)}
                className="group w-full flex items-center gap-3 px-3.5 py-3 hover:bg-white transition-all duration-150 text-left"
              >
                {/* Gradient avatar */}
                <div className={`w-8 h-8 rounded-[8px] ${account.avatarBg} flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm`}>
                  {account.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-slate-800 leading-none">
                      {account.label}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${account.badge}`}>
                      {account.role === 'enthusiasts' ? 'USER' : account.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{account.name}</p>
                </div>

                {/* Arrow CTA */}
                <span className={`text-[10px] font-semibold shrink-0 ${account.text} opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0 flex items-center gap-0.5`}>
                  Login
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            ))}
          </div>

          <p className="text-center text-[10px] text-slate-300 mt-2.5">
            UI preview · no database connection required
          </p>
        </div>

        <div className="mt-5 text-center">
          <p className="text-slate-500 text-xs font-normal">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#232F3E] hover:underline font-medium inline-block relative group transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
