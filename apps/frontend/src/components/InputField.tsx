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
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">
        {label}
      </label>
      <div
        className={cn(
          "relative flex items-center transition-all duration-300",
          "h-11 rounded-lg border px-3.5",
          "bg-slate-50 hover:bg-slate-100/80 transition-colors",
          isFocused 
            ? "border-[#FF9900] ring-4 ring-[#FF9900]/5" 
            : "border-slate-200",
          error ? "border-red-500/80 ring-red-500/10" : ""
        )}
      >
        <Icon 
          size={16} 
          className={cn(
            "mr-2.5 transition-colors duration-300",
            isFocused ? "text-[#FF9900]" : "text-slate-400"
          )} 
        />
        
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className="w-full bg-transparent outline-none text-slate-800 text-sm"
          placeholder={`Enter your ${label.toLowerCase()}...`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};
