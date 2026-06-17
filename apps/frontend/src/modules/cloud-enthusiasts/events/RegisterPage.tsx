'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEventDetails, useRegister } from '../shared/hooks/useCloudEnthusiasts';
import { EC2ConsoleLoader, ErrorAlert } from '../shared/components/Animations';
import { ArrowLeft, ArrowRight, Check, User, Mail, GraduationCap, ClipboardList, RefreshCw, AlertCircle, FileUp } from 'lucide-react';
import { STORAGE_KEYS } from '../../../context/mockData';

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
    <div className="bg-transparent min-h-screen py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        
        {/* Cancel navigation link */}
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-[8px] px-3 py-1.5 shadow-sm hover:shadow transition-all duration-200 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Back</span>
        </Link>

        {/* Wizard Box - 10px rounded-[10px] */}
        <div className="bg-white border border-slate-200 rounded-[10px] p-5 sm:p-6 shadow-sm">
          
          {/* Event banner title */}
          <div className="text-center mb-6 border-b border-slate-100 pb-4">
            <span className="bg-[#232F3E]/10 text-[#232F3E] text-[10px] font-medium uppercase px-2.5 py-1 rounded-[6px] mb-2 inline-block">
              Registration
            </span>
            <h2 className="text-lg font-medium text-slate-800 line-clamp-1 font-display">
              {event.title}
            </h2>
            <p className="text-slate-400 text-xs font-normal mt-1">
              Please fill in your details to secure a seat pass.
            </p>
          </div>

          {/* Custom Progress Indicators */}
          <div className="flex items-center justify-between max-w-sm mx-auto mb-6 relative">
            {stepLabels.map((lbl, idx) => {
              const stepNum = idx + 1;
              const activeStep = getStepNumber(currentStep);
              const isActive = activeStep === stepNum;
              const isCompleted = activeStep > stepNum;

              return (
                <React.Fragment key={lbl}>
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : isActive 
                          ? 'bg-[#232F3E] text-white ring-4 ring-slate-100' 
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                    </div>
                    <span className={`text-[10px] font-normal mt-1.5 hidden sm:inline ${
                      isActive ? 'text-[#232F3E]' : 'text-slate-400'
                    }`}>
                      {lbl}
                    </span>
                  </div>
                  {idx < stepLabels.length - 1 && (
                    <div className="flex-1 h-0.5 bg-slate-100 mx-2 -translate-y-3" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Wizard Form */}
          <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-4">
            
            {/* STEP 1: Fixed Profile Fields */}
            {currentStep === 1 && (
              <div className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-normal text-slate-500 uppercase tracking-wide">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleFixedChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full pl-9 pr-3 py-2 border rounded-[8px] text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 transition ${
                        validationErrors.fullName 
                          ? 'border-rose-300 focus:ring-rose-200' 
                          : 'border-slate-200 focus:ring-[#232F3E]/20 focus:border-[#232F3E]'
                      }`}
                    />
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-[10px] text-rose-500 font-normal">{validationErrors.fullName}</p>
                  )}
                </div>

                {/* Roll Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-normal text-slate-500 uppercase tracking-wide">
                    Registration / Roll Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => handleFixedChange('rollNumber', e.target.value)}
                      placeholder="Enter your college registration number"
                      className={`w-full pl-9 pr-3 py-2 border rounded-[8px] text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 transition ${
                        validationErrors.rollNumber 
                          ? 'border-rose-300 focus:ring-rose-200' 
                          : 'border-slate-200 focus:ring-[#232F3E]/20 focus:border-[#232F3E]'
                      }`}
                    />
                  </div>
                  {validationErrors.rollNumber && (
                    <p className="text-[10px] text-rose-500 font-normal">{validationErrors.rollNumber}</p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="block text-xs font-normal text-slate-500 uppercase tracking-wide">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => handleFixedChange('department', e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className={`w-full pl-9 pr-3 py-2 border rounded-[8px] text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 transition ${
                        validationErrors.department 
                          ? 'border-rose-300 focus:ring-rose-200' 
                          : 'border-slate-200 focus:ring-[#232F3E]/20 focus:border-[#232F3E]'
                      }`}
                    />
                  </div>
                  {validationErrors.department && (
                    <p className="text-[10px] text-rose-500 font-normal">{validationErrors.department}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-normal text-slate-500 uppercase tracking-wide">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleFixedChange('email', e.target.value)}
                      placeholder="yourname@rajalakshmi.edu.in"
                      className={`w-full pl-9 pr-3 py-2 border rounded-[8px] text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 transition ${
                        validationErrors.email 
                          ? 'border-rose-300 focus:ring-rose-200' 
                          : 'border-slate-200 focus:ring-[#232F3E]/20 focus:border-[#232F3E]'
                      }`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-[10px] text-rose-500 font-normal">{validationErrors.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Dynamic Custom Fields */}
            {currentStep === 2 && (
              <div className="space-y-3.5">
                {customFields.map((field) => {
                  const isRequired = field.is_required;
                  const value = responses[field.field_label] || '';
                  const errorText = validationErrors[field.field_label];

                  return (
                    <div key={field.field_id} className="space-y-1">
                      <label className="block text-xs font-normal text-slate-500 uppercase tracking-wide">
                        {field.field_label} {isRequired && <span className="text-red-500">*</span>}
                      </label>

                      {/* SELECT TYPE */}
                      {field.field_type === 'select' && (
                        <div className="relative">
                          <select
                            required={isRequired}
                            value={value}
                            onChange={(e) => handleCustomChange(field.field_label, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-[8px] text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 appearance-none cursor-pointer bg-white ${
                              errorText 
                                ? 'border-rose-300 focus:ring-rose-200' 
                                : 'border-slate-200 focus:ring-[#232F3E]/20 focus:border-[#232F3E]'
                            }`}
                          >
                            <option value="">Select option...</option>
                            {field.select_options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                          </span>
                        </div>
                      )}

                      {/* RADIO TYPE */}
                      {field.field_type === 'radio' && (
                        <div className="space-y-1.5 py-0.5">
                          {field.select_options?.map(opt => (
                            <label key={opt} className="flex items-center space-x-3 cursor-pointer text-xs sm:text-sm text-slate-700">
                              <input
                                type="radio"
                                name={field.field_id}
                                value={opt}
                                checked={value === opt}
                                onChange={() => handleCustomChange(field.field_label, opt)}
                                className="w-3.5 h-3.5 text-[#232F3E] focus:ring-[#232F3E] border-slate-300"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* CHECKBOX TYPE */}
                      {field.field_type === 'checkbox' && (
                        <div className="space-y-1.5 py-0.5">
                          {field.select_options?.map(opt => (
                            <label key={opt} className="flex items-center space-x-3 cursor-pointer text-xs sm:text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={value === opt}
                                onChange={(e) => handleCustomChange(field.field_label, e.target.checked ? opt : '')}
                                className="w-3.5 h-3.5 rounded text-[#232F3E] focus:ring-[#232F3E] border-slate-300"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* TEXTAREA TYPE */}
                      {field.field_type === 'textarea' && (
                        <textarea
                          required={isRequired}
                          value={value}
                          rows={2.5}
                          onChange={(e) => handleCustomChange(field.field_label, e.target.value)}
                          placeholder={`Enter ${field.field_label.toLowerCase()}`}
                          className={`w-full px-3 py-2 border rounded-[8px] text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 transition ${
                            errorText 
                              ? 'border-rose-300 focus:ring-rose-200' 
                              : 'border-slate-200 focus:ring-[#232F3E]/20 focus:border-[#232F3E]'
                          }`}
                        />
                      )}

                      {/* FILE UPLOAD TYPE */}
                      {field.field_type === 'file' && (
                        <div className="border border-dashed border-slate-250 p-4 rounded-[10px] text-center bg-slate-50 relative cursor-pointer">
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCustomChange(field.field_label, file.name);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <FileUp className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                          <span className="block text-xs font-normal text-slate-700">
                            {value ? `File: ${value}` : 'Upload attachment file'}
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
                          className={`w-full px-3 py-2 border rounded-[8px] text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 transition ${
                            errorText 
                              ? 'border-rose-300 focus:ring-rose-200' 
                              : 'border-slate-200 focus:ring-[#232F3E]/20 focus:border-[#232F3E]'
                          }`}
                        />
                      )}

                      {errorText && (
                        <p className="text-[10px] text-rose-500 font-normal">{errorText}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 3: Review summary list */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {validationErrors.submit && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-[10px] p-3.5 text-xs font-medium flex items-center space-x-2">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                    <span>{validationErrors.submit}</span>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-100 rounded-[10px] p-4.5 space-y-3">
                  <h4 className="text-[#232F3E] font-medium text-[10px] uppercase tracking-wider border-b border-slate-200 pb-2">
                    Confirm Registration Details
                  </h4>
                  
                  <div className="divide-y divide-slate-100 text-xs sm:text-sm leading-relaxed text-slate-700">
                    <div className="flex justify-between py-2 gap-4">
                      <span className="text-slate-400 text-xs font-normal uppercase shrink-0">Name:</span>
                      <span className="font-normal text-sm text-right">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between py-2 gap-4">
                      <span className="text-slate-400 text-xs font-normal uppercase shrink-0">Roll Number:</span>
                      <span className="font-normal text-sm text-right">{formData.rollNumber}</span>
                    </div>
                    <div className="flex justify-between py-2 gap-4">
                      <span className="text-slate-400 text-xs font-normal uppercase shrink-0">Department:</span>
                      <span className="font-normal text-sm text-right">{formData.department}</span>
                    </div>
                    <div className="flex justify-between py-2 gap-4">
                      <span className="text-slate-400 text-xs font-normal uppercase shrink-0">Email:</span>
                      <span className="font-normal text-sm text-right">{formData.email}</span>
                    </div>

                    {customFields.map((field) => (
                      <div key={field.field_id} className="flex justify-between py-2 gap-4">
                        <span className="text-slate-400 text-xs font-normal uppercase shrink-0">{field.field_label}:</span>
                        <span className="font-normal text-sm text-right">{responses[field.field_label] || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step action buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-medium py-2 px-4 rounded-[8px] text-xs shadow-sm transition-all duration-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-1.5 bg-[#232F3E] text-white font-medium py-2 px-5 rounded-[8px] shadow-sm text-xs"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="flex items-center space-x-1.5 bg-[#232F3E] text-white font-medium py-2 px-6 rounded-[8px] shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed text-xs"
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
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
