"use client";

import React, { useState } from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  label: string;
  type: string;
  icon: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  required?: boolean;
  error?: boolean;
}

export const InputField = ({
  label,
  type,
  icon: Icon,
  value,
  onChange,
  name,
  required = false,
  error = false,
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative w-full h-11">
        {/* The input element itself acts as the full container background and border */}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={cn(
            "absolute inset-0 w-full h-full rounded-lg border transition-all duration-300",
            "bg-[#EAEFF5] hover:bg-[#E0E7F0] outline-none text-slate-800 text-sm",
            "pl-10", // Leave space for the left icon
            isPassword ? "pr-10" : "pr-3.5", // Leave space for the password eye icon
            isFocused 
              ? "border-[#E47911] ring-4 ring-[#E47911]/5" 
              : "border-slate-200",
            error ? "border-red-500/80 ring-red-500/10" : ""
          )}
          placeholder={`Enter your ${label.toLowerCase()}...`}
        />

        {/* Left Icon - positioned on top of the input */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center">
          <Icon 
            size={16} 
            className={cn(
              "transition-colors duration-300",
              isFocused ? "text-[#E47911]" : "text-slate-400"
            )} 
          />
        </div>

        {/* Password Eye Button - positioned on top of the input */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none flex items-center"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};
