'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEventDetails, useRegister } from '../shared/hooks/useCloudEnthusiasts';
import { EC2ConsoleLoader, ErrorAlert } from '../shared/components/Animations';
import { ArrowLeft, ArrowRight, Check, User, Mail, GraduationCap, ClipboardList, RefreshCw, AlertCircle, FileUp, ChevronDown, Calendar, MapPin, Clock, Users, Pencil } from 'lucide-react';
import { STORAGE_KEYS } from '../../../context/mockData';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { data: detailData, isLoading: isDetailsLoading, error: detailsError } = useEventDetails(eventId);
  const registerMutation = useRegister(eventId);

  // Form Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: '',
    rollNumber: '',
    department: '',
    email: '',
  });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleFixedChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  const handleCustomChange = (fieldLabel: string, value: string) => {
    setResponses(prev => ({ ...prev, [fieldLabel]: value }));
    if (validationErrors[fieldLabel]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldLabel];
        return copy;
      });
    }
  };

  if (isDetailsLoading) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-20 px-4">
        <EC2ConsoleLoader message="Reading event registration schema..." />
      </div>
    );
  }

  if (detailsError || !detailData?.event) {
    return (
      <div className="bg-transparent min-h-screen flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg">
          <ErrorAlert
            message={detailsError ? (detailsError as Error).message : 'The event form could not be loaded.'}
          />
          <div className="text-center mt-4">
            <Link href="/events" className="inline-flex items-center space-x-1.5 text-[#232F3E] hover:text-[#1a232f] font-medium transition text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Events</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event, formFields = [] } = detailData;
  const customFields = [...formFields].sort((a, b) => a.field_order - b.field_order);

  // Step 1 Validation: Fixed/Default Fields
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.rollNumber.trim()) errors.rollNumber = 'Registration / Roll Number is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    
    // Email checking
    const emailVal = formData.email.trim();
    if (!emailVal) {
      errors.email = 'Email address is required';
    } else {
      const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@rajalakshmi\.edu\.in$/;
      if (!collegeEmailRegex.test(emailVal)) {
        errors.email = 'Please use your college email address (@rajalakshmi.edu.in)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation: Dynamic Custom Fields
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    customFields.forEach(field => {
      const val = responses[field.field_label];
      if (field.is_required && (!val || String(val).trim() === '')) {
        errors[field.field_label] = `${field.field_label} is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        if (customFields.length === 0) {
          setCurrentStep(3); // Skip step 2 if no custom fields
        } else {
          setCurrentStep(2);
        }
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 3) {
      if (customFields.length === 0) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    registerMutation.mutate(
      {
        fullName: formData.fullName,
        rollNumber: formData.rollNumber,
        department: formData.department,
        email: formData.email,
        responses,
      },
      {
        onSuccess: (data) => {
          interface LocalTicket {
            ticketId: string;
            regId: string;
            eventId: string;
            eventTitle: string;
            date: string;
            time: string;
            name: string;
            email: string;
          }
          // Store ticket details in client storage to show in Tickets
          const localTickets: LocalTicket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
          if (data.ticket) {
            const ticketObj: LocalTicket = {
              ticketId: data.ticket.ticket_id,
              regId: data.registration?.registration_id || '',
              eventId: eventId,
              eventTitle: event.title,
              date: new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: new Date(event.start_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              name: formData.fullName,
              email: formData.email,
            };
            
            if (!localTickets.some((t: LocalTicket) => t.ticketId === data.ticket.ticket_id)) {
              localTickets.push(ticketObj);
              localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(localTickets));
            }
          }

          let redirectUrl = `/events/${eventId}/register/success?regId=${data.registration?.registration_id || ''}`;
          if (data.ticket?.ticket_id) {
            redirectUrl += `&ticketId=${data.ticket.ticket_id}`;
          }
          if (data.warning) {
            redirectUrl += `&warning=${encodeURIComponent(data.warning)}`;
          }
          router.push(redirectUrl);
        },
        onError: (err: Error) => {
          setValidationErrors({ submit: err.message || 'Duplicate registration or capacity limit exceeded.' });
        }
      }
    );
  };

  const stepLabels = customFields.length === 0 
    ? ['Contact Info', 'Review & Submit'] 
    : ['Contact Info', 'Custom Fields', 'Review & Submit'];

  const getStepNumber = (step: number) => {
    if (customFields.length === 0 && step === 3) return 2;
    return step;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#F4F6F9] to-[#EDF0F5] text-[#1A1C1E] font-sans relative py-5 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 overflow-y-auto premium-scrollbar scroll-smooth">
      {/* Background ambient glow (matches events page style) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.07)_0%,rgba(255,153,0,0.03)_40%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-screen-xl w-full mx-auto z-10 relative">
        {/* Top Header & Breadcrumbs / Cancel & Back */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold rounded-lg text-xs shadow-sm transition-all duration-150 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-150 text-slate-500" />
            <span className="tracking-wide">Cancel & Back</span>
          </Link>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              {/* Glow accent */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_75%_20%,rgba(0,115,187,0.03)_0%,transparent_60%)] pointer-events-none" />
              
              <div className="relative z-10">
                {/* Form header */}
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-semibold text-[#FF9900] uppercase tracking-wider font-sans block mb-1">
                      Event Pass Application
                    </span>
                    <h2 className="text-3xl font-bold text-[#232F3E] tracking-tight">
                      Secure Your Ticket
                    </h2>
                  </div>
                </div>

                {/* Stacked Wizard Form Panels */}
                <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-4">
                  
                  {/* PANEL 1: Contact Info */}
                  <div className={cn(
                    "border rounded-2xl p-5 transition-all duration-300",
                    currentStep === 1 ? "border-slate-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/30"
                  )}>
                    {/* Panel Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-200",
                          currentStep === 1 
                            ? "bg-[#232F3E] border-[#232F3E] text-white shadow-sm ring-4 ring-slate-100" 
                            : "bg-emerald-500 border-emerald-500 text-white"
                        )}>
                          {currentStep === 1 ? '1' : <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className={cn(
                            "text-[16px] font-semibold font-sans tracking-tight block",
                            currentStep === 1 ? "text-slate-900" : "text-slate-500"
                          )}>
                            Contact Info
                          </span>
                          {currentStep > 1 && (
                            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                              {formData.fullName} • {formData.email}
                            </span>
                          )}
                        </div>
                      </div>
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-650 hover:text-[#232F3E] font-bold rounded-lg text-[10.5px] uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer font-sans group"
                        >
                          <Pencil className="w-3 h-3 text-slate-400 group-hover:text-[#FF9900] transition-colors duration-200" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {/* Panel Body */}
                    {currentStep === 1 && (
                      <div className="mt-4 space-y-4 pt-3.5 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          {/* Full Name */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#FF9900] uppercase tracking-wider font-sans">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                              </span>
                              <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => handleFixedChange('fullName', e.target.value)}
                                placeholder="Enter your full name"
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-[#232F3E] placeholder-slate-400 transition-all font-medium ${
                                  validationErrors.fullName ? 'border-rose-300 focus:border-rose-500 focus:ring-0' : ''
                                }`}
                              />
                            </div>
                            {validationErrors.fullName && (
                              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1.5 animate-fadeIn">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{validationErrors.fullName}</span>
                              </p>
                            )}
                          </div>

                          {/* Roll Number */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#FF9900] uppercase tracking-wider font-sans">
                              Registration / Roll Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <ClipboardList className="w-4 h-4" />
                              </span>
                              <input
                                type="text"
                                required
                                value={formData.rollNumber}
                                onChange={(e) => handleFixedChange('rollNumber', e.target.value)}
                                placeholder="Enter your college registration number"
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-[#232F3E] placeholder-slate-400 transition-all font-medium ${
                                  validationErrors.rollNumber ? 'border-rose-300 focus:border-rose-500 focus:ring-0' : ''
                                }`}
                              />
                            </div>
                            {validationErrors.rollNumber && (
                              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1.5 animate-fadeIn">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{validationErrors.rollNumber}</span>
                              </p>
                            )}
                          </div>

                          {/* Department */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#FF9900] uppercase tracking-wider font-sans">
                              Department <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <GraduationCap className="w-4.5 h-4.5" />
                              </span>
                              <input
                                type="text"
                                required
                                value={formData.department}
                                onChange={(e) => handleFixedChange('department', e.target.value)}
                                placeholder="e.g. Computer Science & Engineering"
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-[#232F3E] placeholder-slate-400 transition-all font-medium ${
                                  validationErrors.department ? 'border-rose-300 focus:border-rose-500 focus:ring-0' : ''
                                }`}
                              />
                            </div>
                            {validationErrors.department && (
                              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1.5 animate-fadeIn">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{validationErrors.department}</span>
                              </p>
                            )}
                          </div>

                          {/* Email */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#FF9900] uppercase tracking-wider font-sans">
                              Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                              </span>
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => handleFixedChange('email', e.target.value)}
                                placeholder="yourname@rajalakshmi.edu.in"
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-[#232F3E] placeholder-slate-400 transition-all font-medium ${
                                  validationErrors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-0' : ''
                                }`}
                              />
                            </div>
                            {validationErrors.email && (
                              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1.5 animate-fadeIn">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{validationErrors.email}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Continue Button */}
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={nextStep}
                            className="flex items-center gap-1.5 bg-[#1A1C1E] hover:bg-[#FF9900] text-white font-semibold py-2 px-4 rounded-xl shadow-sm hover:shadow text-xs transition-all duration-200 uppercase tracking-wider cursor-pointer font-sans"
                          >
                            <span>Continue</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PANEL 2: Custom Fields */}
                  {customFields.length > 0 && (
                    <div className={cn(
                      "border rounded-2xl p-5 transition-all duration-300",
                      currentStep === 2 
                        ? "border-slate-200 bg-white shadow-sm" 
                        : currentStep > 2 
                          ? "border-slate-100 bg-slate-50/30" 
                          : "border-slate-100 bg-slate-50/20 opacity-60"
                    )}>
                      {/* Panel Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-200",
                            currentStep === 2 
                              ? "bg-[#232F3E] border-[#232F3E] text-white shadow-sm ring-4 ring-slate-100" 
                              : currentStep > 2 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : "bg-slate-100 border-slate-250 text-slate-400"
                          )}>
                            {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                          </div>
                          <div>
                            <span className={cn(
                              "text-[16px] font-semibold font-sans tracking-tight block",
                              currentStep === 2 ? "text-slate-900" : "text-slate-500"
                            )}>
                              Custom Fields
                            </span>
                            {currentStep > 2 && (
                              <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                                {Object.keys(responses).length} field(s) answered
                              </span>
                            )}
                            {currentStep < 2 && (
                              <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                                Complete contact info step to unlock
                              </span>
                            )}
                          </div>
                        </div>
                        {currentStep > 2 && (
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-650 hover:text-[#232F3E] font-bold rounded-lg text-[10.5px] uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer font-sans group"
                          >
                            <Pencil className="w-3 h-3 text-slate-400 group-hover:text-[#FF9900] transition-colors duration-200" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>

                      {/* Panel Body */}
                      {currentStep === 2 && (
                        <div className="mt-4 pt-3.5 border-t border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {customFields.map((field) => {
                              const isRequired = field.is_required;
                              const value = responses[field.field_label] || '';
                              const errorText = validationErrors[field.field_label];
                              const isFullWidth = field.field_type === 'textarea' || field.field_type === 'file';

                              return (
                                <div key={field.field_id} className={cn("space-y-1.5", isFullWidth && "md:col-span-2")}>
                                  <label className="block text-[11px] font-bold text-[#FF9900] uppercase tracking-wider font-sans">
                                    {field.field_label} {isRequired && <span className="text-red-500">*</span>}
                                  </label>

                                  {/* SELECT TYPE */}
                                  {field.field_type === 'select' && (
                                    <div className="relative">
                                      <select
                                        required={isRequired}
                                        value={value}
                                        onChange={(e) => handleCustomChange(field.field_label, e.target.value)}
                                        className={`w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-[#232F3E] cursor-pointer transition-all appearance-none ${
                                          errorText ? 'border-rose-300 focus:border-rose-500' : ''
                                        }`}
                                      >
                                        <option value="">Select option...</option>
                                        {field.select_options?.map(opt => (
                                          <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                                    </div>
                                  )}

                                  {/* RADIO TYPE */}
                                  {field.field_type === 'radio' && (
                                    <div className="space-y-2 py-1">
                                      {field.select_options?.map(opt => (
                                        <label key={opt} className="flex items-center space-x-3 cursor-pointer text-[13px] text-[#232F3E] hover:text-slate-900 transition-colors">
                                          <input
                                            type="radio"
                                            name={field.field_id}
                                            value={opt}
                                            checked={value === opt}
                                            onChange={() => handleCustomChange(field.field_label, opt)}
                                            className="w-4 h-4 text-[#232F3E] focus:ring-[#FF9900] border-slate-300"
                                          />
                                          <span className="font-medium">{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}

                                  {/* CHECKBOX TYPE */}
                                  {field.field_type === 'checkbox' && (
                                    <div className="space-y-2 py-1">
                                      {field.select_options?.map(opt => (
                                        <label key={opt} className="flex items-center space-x-3 cursor-pointer text-[13px] text-[#232F3E] hover:text-slate-900 transition-colors">
                                          <input
                                            type="checkbox"
                                            name={field.field_id}
                                            value={opt}
                                            checked={value === opt}
                                            onChange={(e) => handleCustomChange(field.field_label, e.target.checked ? opt : '')}
                                            className="w-4 h-4 rounded text-[#232F3E] focus:ring-[#FF9900] border-slate-300"
                                          />
                                          <span className="font-medium">{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}

                                  {/* TEXTAREA TYPE */}
                                  {field.field_type === 'textarea' && (
                                    <textarea
                                      required={isRequired}
                                      value={value}
                                      rows={3}
                                      onChange={(e) => handleCustomChange(field.field_label, e.target.value)}
                                      placeholder={`Enter your answer for ${field.field_label.toLowerCase()}...`}
                                      className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-[#232F3E] placeholder-slate-400 transition-all font-medium ${
                                        errorText ? 'border-rose-300 focus:border-rose-500' : ''
                                      }`}
                                    />
                                  )}

                                  {/* FILE UPLOAD TYPE */}
                                  {field.field_type === 'file' && (
                                    <div className="border border-dashed border-slate-200 hover:border-[#FF9900] p-5 rounded-2xl text-center bg-slate-50/50 hover:bg-slate-50/20 relative cursor-pointer transition-all">
                                      <input
                                        type="file"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleCustomChange(field.field_label, file.name);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      />
                                      <FileUp className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                                      <span className="block text-xs font-bold text-slate-600">
                                        {value ? `Selected: ${value}` : 'Upload your attachment file'}
                                      </span>
                                      <span className="block text-[10px] text-slate-400 mt-1">
                                        Drag and drop or click to upload
                                      </span>
                                    </div>
                                  )}

                                  {/* STANDARD INPUT TYPES */}
                                  {field.field_type !== 'select' && 
                                   field.field_type !== 'radio' && 
                                   field.field_type !== 'checkbox' && 
                                   field.field_type !== 'textarea' && 
                                   field.field_type !== 'file' && (
                                    <input
                                      type={field.field_type === 'url' ? 'url' : field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                                      required={isRequired}
                                      value={value}
                                      onChange={(e) => handleCustomChange(field.field_label, e.target.value)}
                                      placeholder={`Enter ${field.field_label.toLowerCase()}`}
                                      className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] text-[#232F3E] placeholder-slate-400 transition-all font-medium ${
                                        errorText ? 'border-rose-300 focus:border-rose-500' : ''
                                      }`}
                                    />
                                  )}

                                  {errorText && (
                                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1.5 animate-fadeIn">
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>{errorText}</span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                            <button
                              type="button"
                              onClick={prevStep}
                              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 hover:bg-slate-50 font-semibold py-2 px-3.5 rounded-xl text-xs shadow-sm transition-all duration-200 cursor-pointer uppercase tracking-wider font-sans"
                            >
                              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                              <span>Back</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={nextStep}
                              className="flex items-center gap-1.5 bg-[#1A1C1E] hover:bg-[#FF9900] text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm hover:shadow text-xs transition-all duration-200 uppercase tracking-wider cursor-pointer font-sans"
                            >
                              <span>Continue</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PANEL 3: Review & Submit */}
                  <div className={cn(
                    "border rounded-2xl p-5 transition-all duration-300",
                    currentStep === 3 
                      ? "border-slate-200 bg-white shadow-sm" 
                      : "border-slate-100 bg-slate-50/20 opacity-60"
                  )}>
                    {/* Panel Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-200",
                          currentStep === 3 
                            ? "bg-[#232F3E] border-[#232F3E] text-white shadow-sm ring-4 ring-slate-100" 
                            : "bg-slate-100 border-slate-250 text-slate-400"
                        )}>
                          {customFields.length > 0 ? '3' : '2'}
                        </div>
                        <div>
                          <span className={cn(
                            "text-[16px] font-semibold font-sans tracking-tight block",
                            currentStep === 3 ? "text-slate-900" : "text-slate-500"
                          )}>
                            Review & Submit
                          </span>
                          {currentStep < 3 && (
                            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                              Complete previous steps to unlock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Panel Body */}
                    {currentStep === 3 && (
                      <div className="mt-4 space-y-4 pt-3.5 border-t border-slate-100">
                        {validationErrors.submit && (
                          <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-4 text-[12.5px] font-semibold flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{validationErrors.submit}</span>
                          </div>
                        )}

                        <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
                            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                            <h4 className="text-slate-500 font-bold text-[11px] uppercase tracking-wider font-sans">
                              Confirm Application Details
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 text-sm leading-relaxed text-slate-700">
                            <div className="flex justify-between py-2.5 border-b border-slate-100 gap-4 items-center">
                              <span className="text-[#FF9900] text-xs font-bold uppercase tracking-wider font-sans shrink-0">Name</span>
                              <span className="font-semibold text-[#232F3E] text-right truncate flex-1 min-w-0">{formData.fullName}</span>
                            </div>
                            <div className="flex justify-between py-2.5 border-b border-slate-100 gap-4 items-center">
                              <span className="text-[#FF9900] text-xs font-bold uppercase tracking-wider font-sans shrink-0">Roll Number</span>
                              <span className="font-semibold text-[#232F3E] text-right truncate flex-1 min-w-0">{formData.rollNumber}</span>
                            </div>
                            <div className="flex justify-between py-2.5 border-b border-slate-100 gap-4 items-center">
                              <span className="text-[#FF9900] text-xs font-bold uppercase tracking-wider font-sans shrink-0">Department</span>
                              <span className="font-semibold text-[#232F3E] text-right truncate flex-1 min-w-0">{formData.department}</span>
                            </div>
                            <div className="flex justify-between py-2.5 border-b border-slate-100 gap-4 items-center">
                              <span className="text-[#FF9900] text-xs font-bold uppercase tracking-wider font-sans shrink-0">Email</span>
                              <span className="font-semibold text-[#232F3E] text-right truncate flex-1 min-w-0">{formData.email}</span>
                            </div>

                            {customFields.map((field) => (
                              <div key={field.field_id} className="flex justify-between py-2.5 border-b border-slate-100 gap-4 items-center">
                                <span className="text-[#FF9900] text-xs font-bold uppercase tracking-wider font-sans shrink-0">{field.field_label}</span>
                                <span className="font-semibold text-[#232F3E] text-right truncate flex-1 min-w-0">{responses[field.field_label] || 'N/A'}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 hover:bg-slate-50 font-semibold py-2 px-3.5 rounded-xl text-xs shadow-sm transition-all duration-200 cursor-pointer uppercase tracking-wider font-sans"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                            <span>Back</span>
                          </button>
                          
                          <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="flex items-center gap-1.5 bg-[#232F3E] hover:bg-[#FF9900] text-white font-semibold py-2.5 px-6 rounded-xl shadow-md disabled:bg-slate-350 disabled:cursor-not-allowed text-xs transition-all duration-200 uppercase tracking-wider cursor-pointer font-sans"
                          >
                            {registerMutation.isPending ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Reserving...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm & Register</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      );
    }
