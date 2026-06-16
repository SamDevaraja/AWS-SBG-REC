'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEvent, useUpdateEvent } from '@/lib/hooks';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  FileText,
  GripVertical,
  Users,
  ArrowLeft,
} from 'lucide-react';
import type {
  CreateEventDto,
  CreateAgendaDto,
  CreateSpeakerDto,
  CreateFormFieldDto,
  EventMode,
  FieldType,
} from '@/lib/types';

interface AgendaItem extends CreateAgendaDto {
  _key: string;
  serverId?: string;
}

interface SpeakerItem extends CreateSpeakerDto {
  _key: string;
  serverId?: string;
}

interface FormFieldItem extends CreateFormFieldDto {
  _key: string;
  optionsList: string[];
  serverId?: string;
}

const STEPS = ['Basic Info', 'Agenda', 'Speakers', 'Form Builder'];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT', label: 'Text' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'RADIO', label: 'Radio' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'TEXTAREA', label: 'Textarea' },
];

let keyCounter = 0;
function nextKey(): string {
  return `k-${++keyCounter}-${Date.now()}`;
}

function LoadingSkeleton() {
  return (
    <div className="bg-transparent p-6 lg:p-8">
      <div className="w-full space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-slate-100" />
          <div className="h-6 w-48 rounded bg-slate-100" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-slate-100" />
          ))}
        </div>
        <div className="border border-slate-200 rounded-[10px] shadow-sm p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-slate-100" />
          <div className="h-10 w-full rounded-[8px] bg-slate-100" />
          <div className="h-5 w-40 rounded bg-slate-100" />
          <div className="h-10 w-full rounded-[8px] bg-slate-100" />
          <div className="h-5 w-28 rounded bg-slate-100" />
          <div className="h-24 w-full rounded-[8px] bg-slate-100" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded-[8px] bg-slate-100" />
            <div className="h-10 rounded-[8px] bg-slate-100" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-10 rounded-[8px] bg-slate-100" />
            <div className="h-10 rounded-[8px] bg-slate-100" />
            <div className="h-10 rounded-[8px] bg-slate-100" />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="h-9 w-20 rounded-[8px] bg-slate-100" />
          <div className="h-9 w-24 rounded-[8px] bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function PosterImageInput({
  formData,
  setFormData,
}: {
  formData: CreateEventDto;
  setFormData: (data: CreateEventDto) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, posterImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">Poster Image</label>

      <div className="space-y-3">
        {!formData.posterImage ? (
          <div>
            <label className="border-2 border-dashed border-slate-200 rounded-[10px] p-4 text-center hover:border-slate-300 transition cursor-pointer flex flex-col items-center justify-center min-h-[96px] bg-slate-50">
              <Upload className="h-6 w-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500 font-medium">Select image file</span>
              <span className="text-[9px] text-slate-400">
                PNG, JPG up to 5MB (Converts to Base64)
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-3 border border-slate-200 rounded-[8px] p-2 bg-slate-50">
            <div className="w-16 h-12 rounded-[6px] overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center relative">
              <img
                src={formData.posterImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Poster Image
              </p>
              <p className="text-xs text-slate-600 truncate">
                {formData.posterImage.startsWith('data:')
                  ? 'Local Uploaded Image'
                  : formData.posterImage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, posterImage: '' })}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BasicInfoStep({
  formData,
  setFormData,
  errors,
}: {
  formData: CreateEventDto;
  setFormData: (data: CreateEventDto) => void;
  errors: Record<string, string>;
}) {
  const [title, setTitle] = useState(formData.title || '');
  const [shortDesc, setShortDesc] = useState(formData.shortDescription || '');
  const [description, setDescription] = useState(formData.description || '');
  const [venue, setVenue] = useState(formData.venue || '');
  const [capacity, setCapacity] = useState(formData.capacity ?? '');
  const [date, setDate] = useState(formData.date || '');
  const [time, setTime] = useState(formData.time || '');
  const [deadline, setDeadline] = useState(formData.registrationDeadline || '');

  // Refs to avoid stale closures in setTimeout
  const formDataRef = useRef(formData);
  const setFormDataRef = useRef(setFormData);

  useEffect(() => {
    formDataRef.current = formData;
    setFormDataRef.current = setFormData;
  }, [formData, setFormData]);

  // Track timers for debounce
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const triggerChange = (field: keyof CreateEventDto, value: any) => {
    if (timers.current[field]) {
      clearTimeout(timers.current[field]);
    }
    timers.current[field] = setTimeout(() => {
      setFormDataRef.current({ ...formDataRef.current, [field]: value });
    }, 150);
  };

  const handleBlur = (field: keyof CreateEventDto, value: any) => {
    if (timers.current[field]) {
      clearTimeout(timers.current[field]);
    }
    setFormDataRef.current({ ...formDataRef.current, [field]: value });
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            triggerChange('title', e.target.value);
          }}
          onBlur={() => handleBlur('title', title)}
          placeholder="Event title"
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
        />
        {errors.title && <p className="text-[10px] text-rose-500 mt-1">{errors.title}</p>}
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Short Description</label>
        <input
          type="text"
          value={shortDesc}
          onChange={(e) => {
            setShortDesc(e.target.value);
            triggerChange('shortDescription', e.target.value);
          }}
          onBlur={() => handleBlur('shortDescription', shortDesc)}
          placeholder="Brief description (shown in cards)"
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Full Description</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            triggerChange('description', e.target.value);
          }}
          onBlur={() => handleBlur('description', description)}
          placeholder="Detailed event description..."
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition resize-none"
        />
      </div>

      {/* Category & Venue row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
          <div className="relative">
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full appearance-none border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
            >
              <option value="">Select category</option>
              <option value="Business">Business</option>
              <option value="Health">Health</option>
              <option value="Technology">Technology</option>
              <option value="Workshop">Workshop</option>
              <option value="Bootcamp">Bootcamp</option>
              <option value="AI/ML">AI/ML</option>
              <option value="DevOps">DevOps</option>
              <option value="Analytics">Analytics</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => {
              setVenue(e.target.value);
              triggerChange('venue', e.target.value);
            }}
            onBlur={() => handleBlur('venue', venue)}
            placeholder="Event venue"
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
          />
        </div>
      </div>

      {/* Mode */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">Mode</label>
        <div className="flex gap-3">
          {(['ONLINE', 'OFFLINE', 'HYBRID'] as EventMode[]).map((m) => (
            <label
              key={m}
              className={`flex items-center gap-2 border rounded-[8px] px-4 py-2 text-xs font-medium cursor-pointer transition ${
                formData.mode === m
                  ? 'border-[#232F3E] bg-[#232F3E]/5 text-[#232F3E]'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={m}
                checked={formData.mode === m}
                onChange={() => setFormData({ ...formData, mode: m })}
                className="sr-only"
              />
              {m.charAt(0) + m.slice(1).toLowerCase()}
            </label>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Capacity</label>
        <input
          type="number"
          min={0}
          value={capacity}
          onChange={(e) => {
            const num = e.target.value ? Number(e.target.value) : undefined;
            setCapacity(e.target.value ? Number(e.target.value) : '');
            triggerChange('capacity', num);
          }}
          onBlur={() => handleBlur('capacity', capacity === '' ? undefined : Number(capacity))}
          placeholder="Max attendees"
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
        />
      </div>

      {/* Date, Time, Registration Deadline */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              triggerChange('date', e.target.value);
            }}
            onBlur={() => handleBlur('date', date)}
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              triggerChange('time', e.target.value);
            }}
            onBlur={() => handleBlur('time', time)}
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Registration Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              triggerChange('registrationDeadline', e.target.value);
            }}
            onBlur={() => handleBlur('registrationDeadline', deadline)}
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
          />
        </div>
      </div>

      {/* Poster Image Choice */}
      <PosterImageInput formData={formData} setFormData={setFormData} />
    </div>
  );
}

function AgendaStep({
  agenda,
  setAgenda,
}: {
  agenda: AgendaItem[];
  setAgenda: (items: AgendaItem[]) => void;
}) {
  function addItem() {
    setAgenda([
      ...agenda,
      {
        _key: nextKey(),
        title: '',
        speaker: '',
        startTime: '',
        endTime: '',
      },
    ]);
  }

  function removeItem(key: string) {
    setAgenda(agenda.filter((item) => item._key !== key));
  }

  function updateItem(key: string, field: keyof CreateAgendaDto, value: string) {
    setAgenda(agenda.map((item) => (item._key === key ? { ...item, [field]: value } : item)));
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= agenda.length) return;
    const updated = [...agenda];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setAgenda(updated);
  }

  return (
    <div className="space-y-4">
      {agenda.length === 0 && (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-[10px]">
          <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-3">
            No agenda items yet. Add your first session.
          </p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </button>
        </div>
      )}

      {agenda.map((item, index) => (
        <div
          key={item._key}
          className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[6px]">
                #{index + 1}
              </span>
              <div className="flex gap-0.5">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === agenda.length - 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item._key)}
              className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(item._key, 'title', e.target.value)}
                placeholder="Session title"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Speaker</label>
              <input
                type="text"
                value={item.speaker || ''}
                onChange={(e) => updateItem(item._key, 'speaker', e.target.value)}
                placeholder="Speaker name"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={item.startTime}
                onChange={(e) => updateItem(item._key, 'startTime', e.target.value)}
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">End Time</label>
              <input
                type="time"
                value={item.endTime}
                onChange={(e) => updateItem(item._key, 'endTime', e.target.value)}
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
          </div>
        </div>
      ))}

      {agenda.length > 0 && (
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 border border-dashed border-slate-300 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition w-full justify-center"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Another Item
        </button>
      )}
    </div>
  );
}

function SpeakersStep({
  speakers,
  setSpeakers,
}: {
  speakers: SpeakerItem[];
  setSpeakers: (items: SpeakerItem[]) => void;
}) {
  function addItem() {
    setSpeakers([
      ...speakers,
      {
        _key: nextKey(),
        name: '',
        role: '',
        organization: '',
        bio: '',
        photo: '',
      },
    ]);
  }

  function removeItem(key: string) {
    setSpeakers(speakers.filter((item) => item._key !== key));
  }

  function updateItem(key: string, field: keyof CreateSpeakerDto, value: string) {
    setSpeakers(speakers.map((item) => (item._key === key ? { ...item, [field]: value } : item)));
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= speakers.length) return;
    const updated = [...speakers];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSpeakers(updated);
  }

  return (
    <div className="space-y-4">
      {speakers.length === 0 && (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-[10px]">
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-3">
            No speakers added yet. Add your first speaker.
          </p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Speaker
          </button>
        </div>
      )}

      {speakers.map((item, index) => (
        <div
          key={item._key}
          className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[6px]">
                Speaker #{index + 1}
              </span>
              <div className="flex gap-0.5">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === speakers.length - 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item._key)}
              className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item._key, 'name', e.target.value)}
                placeholder="Speaker name"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Role</label>
              <input
                type="text"
                value={item.role || ''}
                onChange={(e) => updateItem(item._key, 'role', e.target.value)}
                placeholder="e.g. Keynote Speaker"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={item.organization || ''}
                onChange={(e) => updateItem(item._key, 'organization', e.target.value)}
                placeholder="Company or institution"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Bio</label>
              <textarea
                rows={3}
                value={item.bio || ''}
                onChange={(e) => updateItem(item._key, 'bio', e.target.value)}
                placeholder="Speaker biography..."
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Photo</label>
              <div className="border-2 border-dashed border-slate-200 rounded-[10px] p-4 text-center hover:border-slate-300 transition cursor-pointer">
                <Upload className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">Click to upload photo</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {speakers.length > 0 && (
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 border border-dashed border-slate-300 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition w-full justify-center"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Another Speaker
        </button>
      )}
    </div>
  );
}

function FormBuilderStep({
  fields,
  setFields,
  registrationFormType,
  setRegistrationFormType,
}: {
  fields: FormFieldItem[];
  setFields: (items: FormFieldItem[]) => void;
  registrationFormType: 'DEFAULT' | 'CUSTOM';
  setRegistrationFormType: (type: 'DEFAULT' | 'CUSTOM') => void;
}) {
  function addField() {
    setFields([
      ...fields,
      {
        _key: nextKey(),
        label: '',
        type: 'TEXT',
        isRequired: false,
        fieldOrder: fields.length + 1,
        optionsList: [],
      },
    ]);
  }

  function removeField(key: string) {
    setFields(fields.filter((f) => f._key !== key));
  }

  function updateField(key: string, updates: Partial<FormFieldItem>) {
    setFields(fields.map((f) => (f._key === key ? { ...f, ...updates } : f)));
  }

  function moveField(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((f, i) => (f.fieldOrder = i + 1));
    setFields(updated);
  }

  function addOption(fieldKey: string) {
    const field = fields.find((f) => f._key === fieldKey);
    if (!field) return;
    updateField(fieldKey, {
      optionsList: [...(field.optionsList || []), ''],
    });
  }

  function updateOption(fieldKey: string, optIndex: number, value: string) {
    const field = fields.find((f) => f._key === fieldKey);
    if (!field) return;
    const opts = [...(field.optionsList || [])];
    opts[optIndex] = value;
    updateField(fieldKey, { optionsList: opts });
  }

  function removeOption(fieldKey: string, optIndex: number) {
    const field = fields.find((f) => f._key === fieldKey);
    if (!field) return;
    updateField(fieldKey, {
      optionsList: (field.optionsList || []).filter((_, i) => i !== optIndex),
    });
  }

  const hasOptions = (type: FieldType) =>
    type === 'DROPDOWN' || type === 'RADIO' || type === 'CHECKBOX';

  return (
    <div className="space-y-6">
      {/* Registration Form Type Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Registration Form Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            className={`flex flex-col p-4 border rounded-[12px] cursor-pointer transition relative hover:border-slate-350 ${
              registrationFormType === 'DEFAULT'
                ? 'border-[#232F3E] bg-[#232F3E]/5 ring-1 ring-[#232F3E]'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-800">Default Form</span>
              <input
                type="radio"
                name="registrationFormType"
                value="DEFAULT"
                checked={registrationFormType === 'DEFAULT'}
                onChange={() => setRegistrationFormType('DEFAULT')}
                className="h-4 w-4 text-[#232F3E] border-slate-300 focus:ring-[#232F3E]"
              />
            </div>
            <p className="text-xs text-slate-500">
              Standard registration with mandatory fields: Name, Roll Number, Email, and Department.
            </p>
          </label>

          <label
            className={`flex flex-col p-4 border rounded-[12px] cursor-pointer transition relative hover:border-slate-350 ${
              registrationFormType === 'CUSTOM'
                ? 'border-[#232F3E] bg-[#232F3E]/5 ring-1 ring-[#232F3E]'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-800">Custom Form</span>
              <input
                type="radio"
                name="registrationFormType"
                value="CUSTOM"
                checked={registrationFormType === 'CUSTOM'}
                onChange={() => setRegistrationFormType('CUSTOM')}
                className="h-4 w-4 text-[#232F3E] border-slate-300 focus:ring-[#232F3E]"
              />
            </div>
            <p className="text-xs text-slate-500">
              Include the 4 mandatory fields plus add, edit, and reorder additional custom fields.
            </p>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        {registrationFormType === 'DEFAULT' ? (
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Form Fields Preview</h3>
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-[12px] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="opacity-75">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Name *</label>
                  <input
                    type="text"
                    disabled
                    placeholder="John Doe"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="22XX1234"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    disabled
                    placeholder="john@example.com"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Computer Science"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white cursor-not-allowed text-slate-400"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                * These fields are system-mandatory and cannot be deleted, renamed, or reordered.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Mandatory Base Fields</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-[8px] p-3 text-[11px] font-medium text-slate-600">
                <div className="bg-white border border-slate-150 rounded-[6px] py-1.5 px-2.5 text-center">
                  Name (Required)
                </div>
                <div className="bg-white border border-slate-150 rounded-[6px] py-1.5 px-2.5 text-center">
                  Roll Number (Required)
                </div>
                <div className="bg-white border border-slate-150 rounded-[6px] py-1.5 px-2.5 text-center">
                  Email (Required)
                </div>
                <div className="bg-white border border-slate-150 rounded-[6px] py-1.5 px-2.5 text-center">
                  Department (Required)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Additional Custom Fields</h3>
            </div>

            <div className="space-y-4">
              {fields.length === 0 && (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-[10px] bg-slate-50">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">
                    No custom fields added yet. Add additional fields for your custom form if
                    needed.
                  </p>
                  <button
                    type="button"
                    onClick={addField}
                    className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Custom Field
                  </button>
                </div>
              )}

              {fields.map((field, index) => (
                <div
                  key={field._key}
                  className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                      <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[6px]">
                        Custom Field #{index + 1}
                      </span>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(index, 'down')}
                          disabled={index === fields.length - 1}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(field._key)}
                      className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field._key, { label: e.target.value })}
                        placeholder="Field label"
                        className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
                        Type
                      </label>
                      <div className="relative">
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(field._key, {
                              type: e.target.value as FieldType,
                              optionsList: hasOptions(e.target.value as FieldType)
                                ? field.optionsList || []
                                : [],
                            })
                          }
                          className="w-full appearance-none border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                        >
                          {FIELD_TYPES.map((ft) => (
                            <option key={ft.value} value={ft.value}>
                              {ft.label}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.isRequired || false}
                        onChange={(e) => updateField(field._key, { isRequired: e.target.checked })}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#232F3E] focus:ring-[#232F3E]"
                      />
                      <span className="text-[10px] font-medium text-slate-500">Required</span>
                    </label>
                  </div>

                  {hasOptions(field.type) && (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <label className="block text-[10px] font-medium text-slate-500">
                        Options
                      </label>
                      {(field.optionsList || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(field._key, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 border border-slate-200 rounded-[8px] text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(field._key, optIdx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(field._key)}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-[#232F3E] hover:underline"
                      >
                        <Plus className="h-3 w-3" />
                        Add Option
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {fields.length > 0 && (
                <button
                  type="button"
                  onClick={addField}
                  className="inline-flex items-center gap-1.5 border border-dashed border-slate-300 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition w-full justify-center text-center bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Another Field
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-1 sm:gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              index === currentStep
                ? 'bg-[#232F3E] text-white'
                : index < currentStep
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                index < currentStep
                  ? 'bg-emerald-500 text-white'
                  : index === currentStep
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </span>
            <span className="hidden sm:inline">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-px w-4 sm:w-8 ${
                index < currentStep ? 'bg-emerald-300' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { data: event, isLoading } = useEvent(eventId);
  const updateEvent = useUpdateEvent();

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateEventDto>({
    organizerId: '',
    title: '',
    category: '',
    description: '',
    shortDescription: '',
    venue: '',
    mode: undefined,
    capacity: undefined,
    date: '',
    time: '',
    registrationDeadline: '',
    status: 'DRAFT',
    registrationFormType: 'DEFAULT',
  });

  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerItem[]>([]);
  const [formFields, setFormFields] = useState<FormFieldItem[]>([]);

  useEffect(() => {
    if (!event) return;

    setFormData({
      organizerId: event.organizerId,
      title: event.title,
      category: event.category || '',
      description: event.description || '',
      shortDescription: event.shortDescription || '',
      venue: event.venue || '',
      mode: event.mode,
      capacity: event.capacity,
      date: event.date || '',
      time: event.time || '',
      registrationDeadline: event.registrationDeadline || '',
      status: event.status,
      registrationFormType: event.registrationFormType || 'DEFAULT',
    });

    setAgenda(
      (event.agenda || []).map((item) => ({
        _key: nextKey(),
        serverId: item.id,
        title: item.title,
        speaker: item.speaker || '',
        startTime: item.startTime,
        endTime: item.endTime,
      })),
    );

    setSpeakers(
      (event.speakers || []).map((item) => ({
        _key: nextKey(),
        serverId: item.id,
        name: item.name,
        role: item.role || '',
        organization: item.organization || '',
        bio: item.bio || '',
        photo: item.photo || '',
      })),
    );

    setFormFields(
      (event.formFields || []).map((item) => ({
        _key: nextKey(),
        serverId: item.id,
        label: item.label,
        type: item.type,
        isRequired: item.isRequired,
        fieldOrder: item.fieldOrder,
        optionsList:
          item.options && 'choices' in item.options ? (item.options.choices as string[]) : [],
      })),
    );
  }, [event]);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === 0) {
        if (!formData.title.trim()) {
          newErrors.title = 'Title is required';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData.title],
  );

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
    }
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  function handleSubmit() {
    if (!validateStep(0)) {
      setCurrentStep(0);
      return;
    }

    const payload: Partial<CreateEventDto> = {
      ...formData,
      posterImage:
        formData.posterImage && formData.posterImage.startsWith('data:')
          ? '/uploads/events/cloud_matrix.jpg'
          : formData.posterImage,
      agenda: agenda.map(({ _key, serverId: _serverId, ...rest }) => rest),
      speakers: speakers.map(({ _key, serverId: _serverId, ...rest }) => rest),
      formFields:
        formData.registrationFormType === 'DEFAULT'
          ? []
          : formFields.map(({ _key, serverId: _serverId, optionsList, ...rest }) => ({
              ...rest,
              options: optionsList && optionsList.length > 0 ? { choices: optionsList } : undefined,
            })),
    };

    updateEvent.mutate(
      { id: eventId, data: payload },
      {
        onSuccess: () => {
          router.push('/events');
        },
      },
    );
  }

  const isLastStep = currentStep === STEPS.length - 1;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-transparent p-6 lg:p-8">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Event</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update the details for &ldquo;{event?.title}&rdquo;
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step Content */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-5 sm:p-6">
          {currentStep === 0 && (
            <BasicInfoStep formData={formData} setFormData={setFormData} errors={errors} />
          )}
          {currentStep === 1 && <AgendaStep agenda={agenda} setAgenda={setAgenda} />}
          {currentStep === 2 && <SpeakersStep speakers={speakers} setSpeakers={setSpeakers} />}
          {currentStep === 3 && (
            <FormBuilderStep
              fields={formFields}
              setFields={setFormFields}
              registrationFormType={formData.registrationFormType || 'DEFAULT'}
              setRegistrationFormType={(type) =>
                setFormData({ ...formData, registrationFormType: type })
              }
            />
          )}
        </div>

        {/* Error summary */}
        {updateEvent.isError && (
          <div className="border border-rose-200 bg-rose-50 rounded-[10px] p-4">
            <p className="text-xs text-rose-600">Failed to update event. Please try again.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-1.5 border border-slate-200 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updateEvent.isPending}
              className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-5 py-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {updateEvent.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-5 py-2 hover:opacity-90 transition"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
