"use client";

import { useState, useEffect, useRef } from "react";
import { saveAs } from "file-saver";

interface EventData {
  id: string;
  eventName: string;
  eventNumber: number;
  academicYear: string;
  place: string;
  time: string;
  agendaItems: { content: string; order: number }[];
  coreMembers: { name: string }[];
  crewMembers: { name: string }[];
  participationCount?: number;
}

export default function EventForm() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [abstract, setAbstract] = useState("");
  
  interface ReportBodySection {
    id: string;
    title: string;
    content: string;
    isSystem: boolean;
  }

  const [bodySections, setBodySections] = useState<ReportBodySection[]>([
    { id: "overview", title: "Event Overview", content: "", isSystem: true },
    { id: "proceedings", title: "Event Proceedings", content: "", isSystem: true },
    { id: "conclusion", title: "Conclusion", content: "", isSystem: true },
  ]);

  const [selectedCore, setSelectedCore] = useState<string[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [participationCount, setParticipationCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data: EventData[]) => {
        setEvents(data);
        if (data.length > 0) {
          const firstEvent = data[0];
          setSelectedEvent(firstEvent);
          setSelectedCore(firstEvent.coreMembers.map((m) => m.name));
          setSelectedCrew(firstEvent.crewMembers.map((m) => m.name));
          setParticipationCount(firstEvent.participationCount || 0);
          setBodySections([
            { id: "overview", title: "Event Overview", content: "", isSystem: true },
            { id: "proceedings", title: "Event Proceedings", content: "", isSystem: true },
            { id: "conclusion", title: "Conclusion", content: "", isSystem: true },
          ]);
          setAbstract("");
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleEventChange = (eventId: string) => {
    const event = events.find((e) => String(e.id) === eventId);
    if (event) {
      setSelectedEvent(event);
      setSelectedCore(event.coreMembers.map((m) => m.name));
      setSelectedCrew(event.crewMembers.map((m) => m.name));
      setParticipationCount(event.participationCount || 0);
      setBodySections([
        { id: "overview", title: "Event Overview", content: "", isSystem: true },
        { id: "proceedings", title: "Event Proceedings", content: "", isSystem: true },
        { id: "conclusion", title: "Conclusion", content: "", isSystem: true },
      ]);
      setAbstract("");
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-excel", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.count !== undefined) {
        setParticipationCount(data.count);
      }
    } catch {
      alert("Failed to parse Excel file");
    }
  };

  const toggleMember = (name: string, role: "core" | "crew") => {
    if (role === "core") {
      setSelectedCore((prev) =>
        prev.includes(name)
          ? prev.filter((n) => n !== name)
          : [...prev, name]
      );
    } else {
      setSelectedCrew((prev) =>
        prev.includes(name)
          ? prev.filter((n) => n !== name)
          : [...prev, name]
      );
    }
  };

  const handleUpdateSection = (id: string, key: "title" | "content", value: string) => {
    setBodySections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, [key]: value } : sec))
    );
  };

  const handleAddSection = () => {
    const newId = `custom-${Date.now()}`;
    setBodySections((prev) => [
      ...prev,
      { id: newId, title: `Custom Section`, content: "", isSystem: false },
    ]);
  };

  const handleDeleteSection = (id: string) => {
    setBodySections((prev) => prev.filter((sec) => sec.id !== id));
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bodySections.length) return;

    setBodySections((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleGenerate = async () => {
    if (!selectedEvent) return;
    if (!abstract.trim()) {
      alert("Please fill in the Abstract field");
      return;
    }
    const emptySection = bodySections.find((sec) => !sec.title.trim() || !sec.content.trim());
    if (emptySection) {
      alert(`Please fill in both title and content for "${emptySection.title || "Custom Section"}"`);
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: selectedEvent.eventName,
          eventNumber: selectedEvent.eventNumber,
          academicYear: selectedEvent.academicYear,
          place: selectedEvent.place,
          time: selectedEvent.time,
          abstract,
          agendaItems: selectedEvent.agendaItems.map((item) => item.content),
          coreMembers: selectedCore,
          crewMembers: selectedCrew,
          participationCount,
          bodySections: bodySections.map((sec) => ({
            id: sec.id,
            title: sec.title,
            content: sec.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const blob = await res.blob();
      saveAs(blob, `${selectedEvent.eventName.replace(/\s+/g, "_")}_Report.docx`);
    } catch {
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 pt-2 pb-6">
      {/* Page Title */}
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Event Report Generator
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure metadata, verify participation lists, and compile event proceedings to generate a polished document.
        </p>
      </div>

      {/* Side-by-Side Dashboard Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Left Column: Event Picker & Participant Checklist */}
        <div className="space-y-4 md:col-span-1">
          {/* Card 1: Event Selection & Metadata */}
          <div className="glass-card p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="border-l-3 border-orange-500 pl-2.5 mb-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Event
              </label>
            </div>
            
            <div className="relative mb-3.5">
              <select
                className="w-full appearance-none bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 hover:border-slate-350 focus:border-orange-500 rounded-xl pl-4 pr-10 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all duration-200 cursor-pointer"
                value={selectedEvent?.id || ""}
                onChange={(e) => handleEventChange(e.target.value)}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName} ({event.academicYear})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {selectedEvent && (
              <div className="border-t border-slate-100 pt-3.5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue & Time</span>
                    <span className="text-xs font-semibold text-slate-700 block mt-0.5">{selectedEvent.place} @ {selectedEvent.time}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Number</span>
                    <div>
                      <span className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full inline-block mt-0.5 font-mono">
                        EVENT-{selectedEvent.eventNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedEvent.agendaItems.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Event Agenda</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedEvent.agendaItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                          <span>{item.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedEvent && (
            <>
              {/* Card 2: Team & Participation */}
              <div className="glass-card p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="border-l-3 border-orange-500 pl-2.5 mb-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Participation Selection
                  </h3>
                </div>
                
                {/* Core checklist */}
                <div className="mb-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Core Members</span>
                  {selectedEvent.coreMembers.length === 0 ? (
                    <span className="text-xs text-slate-400 italic block py-2 bg-slate-50/50 rounded-lg text-center border border-dashed border-slate-150">None found</span>
                  ) : (
                    <div className="space-y-1 bg-slate-50/30 border border-slate-100 rounded-lg p-2 max-h-32 overflow-y-auto custom-scrollbar">
                      {selectedEvent.coreMembers.map((member) => (
                        <label key={member.name} className="flex items-center space-x-2.5 p-1.5 rounded hover:bg-white hover:shadow-sm cursor-pointer transition text-xs text-slate-700 hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={selectedCore.includes(member.name)}
                            onChange={() => toggleMember(member.name, "core")}
                            className="h-3.5 w-3.5 text-orange-500 rounded border-slate-300 focus:ring-orange-500/30 focus:border-orange-500 cursor-pointer accent-orange-500"
                          />
                          <span className="font-medium">{member.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Crew checklist */}
                <div className="mb-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Crew Members</span>
                  {selectedEvent.crewMembers.length === 0 ? (
                    <span className="text-xs text-slate-400 italic block py-2 bg-slate-50/50 rounded-lg text-center border border-dashed border-slate-150">None found</span>
                  ) : (
                    <div className="space-y-1 bg-slate-50/30 border border-slate-100 rounded-lg p-2 max-h-36 overflow-y-auto custom-scrollbar">
                      {selectedEvent.crewMembers.map((member) => (
                        <label key={member.name} className="flex items-center space-x-2.5 p-1.5 rounded hover:bg-white hover:shadow-sm cursor-pointer transition text-xs text-slate-700 hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={selectedCrew.includes(member.name)}
                            onChange={() => toggleMember(member.name, "crew")}
                            className="h-3.5 w-3.5 text-orange-500 rounded border-slate-300 focus:ring-orange-500/30 focus:border-orange-500 cursor-pointer accent-orange-500"
                          />
                          <span className="font-medium">{member.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Participation Count */}
                <div className="border-t border-slate-100 pt-3.5 mt-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Confirmed Participants</span>
                  <div className="flex items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-3 py-2 bg-white border border-slate-200 hover:border-orange-400 hover:text-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer text-slate-600 font-bold flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5" />
                      </svg>
                      <span>Upload XLSX</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/60 border border-orange-200/50 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Total:</span>
                      <span className="text-sm font-black text-orange-600 font-mono">{participationCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Report Contents & Generation */}
        <div className="space-y-4 md:col-span-2">
          {selectedEvent ? (
            <>
              {/* Card: Abstract */}
              <div className="glass-card p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="border-l-3 border-orange-500 pl-2.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Abstract
                    </h2>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">Cover page paragraph</span>
                </div>
                <textarea
                  className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-h-[100px] text-slate-800 transition-all duration-200 placeholder:text-slate-400 shadow-inner"
                  placeholder="Summarize the core theme, target audience, and key deliverables of the event..."
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                />
              </div>

              {/* Dynamic Report Body Sections */}
              {bodySections.map((sec, idx) => (
                <div key={sec.id} className="glass-card p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border-l-3 border-orange-500 pl-2.5 w-full">
                          <span className="text-xs font-black text-orange-500 mr-2 font-mono">{String(idx + 1).padStart(2, '0')}</span>
                          <input
                            type="text"
                            className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-orange-500 focus:outline-none pb-0.5 transition w-full"
                            value={sec.title}
                            onChange={(e) => handleUpdateSection(sec.id, "title", e.target.value)}
                            placeholder="Enter Section Title..."
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-slate-50/80 p-0.5 rounded-lg border border-slate-200/60 shadow-sm shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, "up")}
                        className="w-6.5 h-6.5 flex items-center justify-center rounded-md text-slate-500 hover:text-orange-600 hover:bg-white disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer active:scale-90"
                        title="Move Up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={idx === bodySections.length - 1}
                        onClick={() => handleMoveSection(idx, "down")}
                        className="w-6.5 h-6.5 flex items-center justify-center rounded-md text-slate-500 hover:text-orange-600 hover:bg-white disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer active:scale-90"
                        title="Move Down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="w-6.5 h-6.5 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50/50 transition cursor-pointer active:scale-90"
                        title="Delete Section"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {sec.id === "proceedings" && (
                    <p className="text-[10px] text-slate-400 mb-2 italic">
                      Tip: Use format &quot;8:10 AM - 8:20 AM | Title&quot; at the start of a line to insert subheadings automatically.
                    </p>
                  )}

                  <textarea
                    className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-h-[140px] text-slate-800 transition-all duration-200 placeholder:text-slate-400 shadow-inner"
                    placeholder={
                      sec.id === "proceedings"
                        ? "8:10 AM - 8:20 AM | Inauguration\nThe event commenced with...\n\n8:20 AM - 8:50 AM | Main Session\nThe speaker began..."
                        : `Enter contents for ${sec.title.toLowerCase()}...`
                    }
                    value={sec.content}
                    onChange={(e) => handleUpdateSection(sec.id, "content", e.target.value)}
                  />
                </div>
              ))}

              {/* Add Custom Section Button */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-dashed border-orange-350 hover:border-orange-500 text-orange-600 hover:bg-orange-50/20 text-xs font-bold rounded-lg transition-all duration-155 shadow-sm cursor-pointer active:scale-95 hover:shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>ADD CUSTOM SECTION</span>
                </button>
              </div>

              {/* Generate Button */}
              <div className="pt-3 pb-6 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-aws-orange/35 shadow-md hover:bg-aws-orange hover:text-primary hover:border-aws-orange hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:shadow-aws-orange/20 active:translate-y-0 active:scale-98 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 ease-out cursor-pointer group"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>GENERATING REPORT...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-aws-orange group-hover:text-primary group-hover:translate-y-0.5 transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span>GENERATE EVENT REPORT</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center text-slate-400 italic rounded-xl border border-slate-100 shadow-inner">
              Please select an event from the setup panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
