"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Move, Maximize2, RotateCcw, ZoomIn, ZoomOut, Trash2, ArrowLeft } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAttendanceByEvent, useEvents } from "@/lib/hooks";
import type { TemplateConfig, Participant } from "@/lib/od-types";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const SAMPLE_PARTICIPANTS = [
  { sno: 1, rollNumber: "251801001", name: "V Y AARES", department: "CSE", year: "1" },
  { sno: 2, rollNumber: "251801002", name: "AASHISH DURAI M", department: "CSE", year: "1" },
  { sno: 3, rollNumber: "251801003", name: "ABIJITH K", department: "CSE", year: "1" },
  { sno: 4, rollNumber: "251801004", name: "ABIRAMI K", department: "CSE", year: "1" },
  { sno: 5, rollNumber: "251801005", name: "ABU SHAYAAN KHAN K", department: "CSE", year: "1" },
  { sno: 6, rollNumber: "251801006", name: "ADHITHYAN P", department: "CSE", year: "1" },
  { sno: 7, rollNumber: "251801007", name: "A ADHITYA", department: "CSE", year: "1" },
  { sno: 8, rollNumber: "251801008", name: "ADITHYA R", department: "AIDS", year: "1" },
  { sno: 9, rollNumber: "251801009", name: "ADITHYAN S", department: "AIDS", year: "2" },
  { sno: 10, rollNumber: "251801010", name: "AJAY PREETHAN K", department: "AIDS", year: "2" },
  { sno: 11, rollNumber: "251801011", name: "AJILESH M", department: "AIDS", year: "2" },
  { sno: 12, rollNumber: "251801012", name: "AKAASH PARI", department: "AIDS", year: "2" },
  { sno: 13, rollNumber: "251801013", name: "AKASH RAJ R", department: "AIDS", year: "2" },
  { sno: 14, rollNumber: "251801014", name: "AKHILAN PERUMAL P", department: "AIDS", year: "2" },
  { sno: 15, rollNumber: "251801015", name: "AKSHAYA C R", department: "AIDS", year: "2" },
  { sno: 16, rollNumber: "251801016", name: "AKSHAYA J", department: "AIDS", year: "2" },
  { sno: 17, rollNumber: "251801017", name: "AKSHYAA A", department: "IT", year: "2" },
];

const COLUMN_HEADERS = ["S.NO", "ROLL NUMBER", "NAME", "YEAR", "DEPT"];

function CalibrationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "";

  const { data: attendanceLogs, isLoading: isAttendanceLoading } = useAttendanceByEvent(eventId);
  const { data: eventsData } = useEvents({ limit: 200 });
  const currentEvent = eventsData?.data?.find(e => e.id === eventId);

  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [templateFileName, setTemplateFileName] = useState<string>("");
  const [defaultTemplate, setDefaultTemplate] = useState<string | null>(null);
  const [config, setConfig] = useState<TemplateConfig>({
    tableX: 40,
    tableY: 200,
    tableWidth: 714,
    rowHeight: 47,
    columnWidths: [6, 18, 42, 14, 20],
    rowsPerPage: 17,
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [excelFileName, setExcelFileName] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch default template image
  useEffect(() => {
    fetch("/attendance_template.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => setDefaultTemplate(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  }, []);

  // Map database attendance records to participants
  useEffect(() => {
    if (eventId && attendanceLogs) {
      if (attendanceLogs.length > 0) {
        const mapped: Participant[] = attendanceLogs.map((log, idx) => {
          const ticket = log.ticket;
          const reg = ticket?.registration;
          
          const name = ticket?.userName || (reg ? `${reg.name || ''}` : '') || 'Attendee';
          const rollNumber = ticket?.userRoll || reg?.roll_number || '';
          const department = reg?.department || '';
          
          // Derive year from roll number: e.g. "25..." -> year "1" in 2026
          let year = "1";
          if (rollNumber) {
            const match = rollNumber.match(/^(\d{2})/);
            if (match) {
              const joinYear = parseInt(match[1], 10);
              const currentYear = 26; // 2026
              const diff = currentYear - joinYear;
              if (diff >= 0 && diff <= 4) {
                year = String(diff + 1);
              }
            }
          }

          return {
            sno: idx + 1,
            rollNumber,
            name: name.toUpperCase(),
            department: department.toUpperCase(),
            year,
          };
        });
        setParticipants(mapped);
        setExcelFileName(`Loaded Event: ${currentEvent?.title || eventId}`);
      } else {
        setParticipants([]);
        setExcelFileName(`Event: ${currentEvent?.title || eventId} (No check-ins yet)`);
        setStatusMsg("No check-in logs found for this event. You can upload an Excel file instead.");
      }
    }
  }, [attendanceLogs, eventId, currentEvent]);

  const scale = zoom;

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setTemplateFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setTemplateImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
    multiple: false,
  });

  const onExcelDrop = useCallback(async (accepted: File[], rejected: any[]) => {
    let file = accepted[0];
    if (!file && rejected && rejected.length > 0) {
      const candidate = rejected[0].file;
      if (candidate && candidate.name.match(/\.xlsx?$/i) && candidate.size <= 10 * 1024 * 1024) {
        file = candidate;
      } else {
        const err = rejected[0]?.errors?.[0]?.message || "Invalid file type or size";
        setStatusMsg(`Upload failed: ${err}. Only .xlsx and .xls files under 10MB are accepted.`);
        return;
      }
    }

    if (!file) return;
    setParsing(true);
    setExcelFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-excel", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse");
      setParticipants(data.participants);
      setStatusMsg("Excel data parsed successfully!");
    } catch (err) {
      setExcelFileName("");
      setStatusMsg(err instanceof Error ? err.message : "Failed to parse Excel file");
    } finally {
      setParsing(false);
    }
  }, []);

  const { getRootProps: getExcelRootProps, getInputProps: getExcelInputProps, isDragActive: isExcelDragActive } = useDropzone({
    onDrop: onExcelDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/octet-stream": [".xlsx", ".xls"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  function clearExcel() {
    setExcelFileName("");
    setParticipants([]);
    setConfig((prev) => ({ ...prev, rowsPerPage: 17 }));
    setStatusMsg("Cleared data successfully.");
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (dragging) {
        const x = Math.round((e.clientX - rect.left) / scale - dragOffset.x);
        const y = Math.round((e.clientY - rect.top) / scale - dragOffset.y);
        setConfig((prev) => ({
          ...prev,
          tableX: Math.max(0, Math.min(A4_WIDTH_PX - prev.tableWidth, x)),
          tableY: Math.max(0, Math.min(A4_HEIGHT_PX - 200, y)),
        }));
      }

      if (resizing) {
        const w = Math.round((e.clientX - rect.left) / scale - config.tableX);
        setConfig((prev) => ({
          ...prev,
          tableWidth: Math.max(200, Math.min(A4_WIDTH_PX - prev.tableX, w)),
        }));
      }
    }

    function handleMouseUp() {
      setDragging(false);
      setResizing(false);
    }

    if (dragging || resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing, dragOffset, scale, config.tableX]);

  function handleDragStart(e: React.MouseEvent) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setDragOffset({ x: x - config.tableX, y: y - config.tableY });
    setDragging(true);
  }

  function handleResizeStart(e: React.MouseEvent) {
    e.stopPropagation();
    setResizing(true);
  }

  function resetConfig() {
    setConfig({ tableX: 39, tableY: 201, tableWidth: 714, rowHeight: 47, columnWidths: [6, 18, 42, 14, 20], rowsPerPage: 17 });
  }

  async function generatePreview() {
    if (participants.length === 0) {
      setStatusMsg("Failed: No participants in the list to generate.");
      return;
    }
    setGenerating(true);
    setStatusMsg("Generating PDF...");
    try {
      const body: Record<string, unknown> = { participants, rowCount: config.rowsPerPage, templateConfig: config };
      if (templateImage) {
        body.templateImage = templateImage;
      }

      const res = await fetch("/api/calibration-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate");
      }

      const blob = await res.blob();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
      setStatusMsg("PDF ready — scroll down to preview");
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${currentEvent?.title.replace(/[^a-z0-9]/gi, '_') || 'OD'}-List.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const isCoreDashboard = searchParams.get("scope") !== "crew";

  return (
    <div className="h-screen flex overflow-hidden bg-background p-3">
      {/* Left Panel — Controls */}
      <div className="w-[420px] min-w-[420px] border-r overflow-y-auto p-5 space-y-4 flex flex-col text-sm bg-white">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">OD List Generation</h1>

        {/* Event Selector (if they want to load database attendees) */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold uppercase text-slate-500">Select Event to Load Attendees</Label>
          <div className="relative">
            <select
              value={eventId}
              onChange={(e) => {
                const newEventId = e.target.value;
                router.push(`${window.location.pathname}?eventId=${newEventId}`);
              }}
              className="w-full border border-slate-200 rounded-[8px] text-xs px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#232F3E]/20 focus:border-[#232F3E] transition cursor-pointer text-slate-700"
            >
              <option value="">-- Choose an Event --</option>
              {eventsData?.data?.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Template Upload */}
        <div className="space-y-1">
          <Label className="text-sm font-semibold uppercase text-muted-foreground">Template Image</Label>
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-400"
            }`}
          >
            <input {...getInputProps()} />
            {templateFileName ? (
              <p className="text-xs font-medium text-slate-700">{templateFileName}</p>
            ) : (
              <p className="text-xs text-slate-500">Drop template image here or click</p>
            )}
          </div>
        </div>

        {/* Excel Upload */}
        <div className="space-y-1">
          <Label className="text-sm font-semibold uppercase text-muted-foreground">Custom Excel Data</Label>
          <div
            {...getExcelRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition-colors ${
              isExcelDragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-400"
            }`}
          >
            <input {...getExcelInputProps()} />
            {parsing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : excelFileName ? (
              <div className="text-center">
                <p className="text-xs font-medium text-slate-700 truncate max-w-[340px]">{excelFileName}</p>
                <p className="text-[10px] text-slate-500">{participants.length} rows loaded</p>
                <Button variant="ghost" size="sm" className="mt-0.5 h-5 px-2 text-[10px] text-rose-500 hover:text-rose-700" onClick={(e) => { e.stopPropagation(); clearExcel(); }}>
                  <Trash2 className="mr-1 h-2.5 w-2.5" />Reset to Default
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Drop Excel or click to upload</p>
            )}
          </div>
        </div>

        {/* Position & Size */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-1">
            <Move className="h-3 w-3" /> Position & Size
          </Label>
          {[
            { label: "X", key: "tableX" as const, max: A4_WIDTH_PX },
            { label: "Y", key: "tableY" as const, max: A4_HEIGHT_PX },
            { label: "Width", key: "tableWidth" as const, max: A4_WIDTH_PX },
            { label: "Row Height", key: "rowHeight" as const, max: 80 },
          ].map(({ label, key, max }) => (
            <div key={key} className="flex items-center gap-2">
              <Label className="text-xs w-16 text-slate-600">{label}</Label>
              <input
                type="range"
                min={0}
                max={max}
                value={config[key]}
                onChange={(e) => setConfig((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                className="flex-1 h-1 accent-primary bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <Input
                type="number"
                min={0}
                max={max}
                value={config[key]}
                onChange={(e) => setConfig((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                className="w-16 h-8 text-xs font-mono border-slate-200"
              />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 text-slate-600">Rows</Label>
            <Input
              type="number"
              min={1}
              value={config.rowsPerPage}
              onChange={(e) => setConfig((prev) => ({ ...prev, rowsPerPage: Math.max(1, Number(e.target.value) || 1) }))}
              className="w-16 h-8 text-xs border-slate-200"
            />
          </div>
        </div>

        {/* Column Widths */}
        <div className="space-y-1.5 pr-1">
          <Label className="text-sm font-semibold uppercase text-muted-foreground">Column Widths (%)</Label>
          {COLUMN_HEADERS.map((h, i) => (
            <div key={h} className="flex items-center gap-1.5">
              <Label className="text-xs w-20 truncate text-slate-600">{h}</Label>
              <input
                type="range"
                min={2}
                max={60}
                value={config.columnWidths[i]}
                onChange={(e) => {
                  const nw = [...config.columnWidths];
                  nw[i] = Number(e.target.value);
                  setConfig((prev) => ({ ...prev, columnWidths: nw }));
                }}
                className="flex-1 h-1 accent-primary bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <Input
                type="number"
                min={2}
                max={60}
                value={config.columnWidths[i]}
                onChange={(e) => {
                  const nw = [...config.columnWidths];
                  nw[i] = Number(e.target.value);
                  setConfig((prev) => ({ ...prev, columnWidths: nw }));
                }}
                className="w-14 h-8 text-xs font-mono border-slate-200"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <Button
              onClick={generatePreview}
              disabled={generating || isAttendanceLoading || participants.length === 0}
              className="flex-1 h-8 text-xs bg-[#232F3E] text-white hover:bg-slate-800 transition"
              size="sm"
            >
              {generating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              {isAttendanceLoading ? "Loading Attendees..." : "Generate PDF"}
            </Button>
            {pdfUrl && (
              <Button variant="outline" size="sm" className="h-8 px-2 border-slate-200" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex pt-1">
            <Button variant="outline" size="sm" onClick={resetConfig} className="w-full h-8 text-xs border-slate-200 text-slate-600 hover:text-white" title="Reset layout to default settings">
              <RotateCcw className="mr-1 h-3.5 w-3.5" />Reset Layout
            </Button>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`mt-auto pt-2 rounded-lg px-3 py-2 text-xs font-medium ${
            statusMsg.toLowerCase().includes("failed") || statusMsg.toLowerCase().includes("no check-in")
              ? "bg-rose-50 text-rose-700 border border-rose-100"
              : statusMsg.includes("Generating")
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}>
            <p className="text-center">{statusMsg}</p>
          </div>
        )}
      </div>

      {/* Right Visual Canvas / Preview */}
      <div className="flex-1 min-w-0 overflow-y-auto p-4 space-y-4">
        {/* Visual Canvas */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-slate-500" /> Calibration Canvas
            </span>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0 border-slate-200" onClick={() => setZoom((z) => Math.max(0.2, z - 0.05))}>
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-[10px] text-slate-500 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0 border-slate-200" onClick={() => setZoom((z) => Math.min(1.5, z + 0.05))}>
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex justify-center overflow-auto rounded-lg bg-slate-50 p-4 border border-slate-100 min-h-[300px]">
            <div
              ref={canvasRef}
              className="relative bg-white shadow-md border border-slate-200/50"
              style={{
                width: A4_WIDTH_PX * zoom,
                height: A4_HEIGHT_PX * zoom,
                minWidth: A4_WIDTH_PX * zoom,
                minHeight: A4_HEIGHT_PX * zoom,
              }}
            >
              {(templateImage || defaultTemplate) && (
                <img
                  src={templateImage || defaultTemplate || ""}
                  alt=""
                  className="absolute inset-0 pointer-events-none select-none"
                  style={{ width: "100%", height: "100%", objectFit: "fill" }}
                />
              )}
              
              {/* Background coordinates grid */}
              <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
                {Array.from({ length: Math.floor(A4_WIDTH_PX / 50) + 1 }, (_, i) => (
                  <g key={`v${i}`}>
                    <line x1={i * 50 * zoom} y1={0} x2={i * 50 * zoom} y2={A4_HEIGHT_PX * zoom} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="3,3" />
                    <text x={i * 50 * zoom + 2} y={10} fill="#94a3b8" fontSize={7} fontFamily="monospace">{i * 50}</text>
                  </g>
                ))}
                {Array.from({ length: Math.floor(A4_HEIGHT_PX / 50) + 1 }, (_, i) => (
                  <g key={`h${i}`}>
                    <line x1={0} y1={i * 50 * zoom} x2={A4_WIDTH_PX * zoom} y2={i * 50 * zoom} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="3,3" />
                    <text x={2} y={i * 50 * zoom - 2} fill="#94a3b8" fontSize={7} fontFamily="monospace">{i * 50}</text>
                  </g>
                ))}
              </svg>

              {/* Draggable table overlay overlay */}
              <div
                className="absolute cursor-move select-none"
                style={{
                  left: config.tableX * zoom,
                  top: config.tableY * zoom,
                  width: config.tableWidth * zoom,
                  zIndex: 10,
                }}
                onMouseDown={handleDragStart}
              >
                {/* Header */}
                <div className="flex bg-[#eef0f2] border border-[#d0d0d0] text-[9px] font-bold text-slate-800" style={{ height: config.rowHeight * zoom }}>
                  {COLUMN_HEADERS.map((h, i) => (
                    <div key={h} className="px-1 flex items-center justify-center border-r border-[#d0d0d0] last:border-r-0" style={{ width: `${config.columnWidths[i]}%` }}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* Rows preview */}
                {Array.from({ length: config.rowsPerPage }, (_, r) => {
                  const p = participants[r];
                  let snoContent = String(r + 1);
                  let rollContent = "";
                  let nameContent = "";
                  let yearContent = "";
                  let deptContent = "";
                  
                  if (p) {
                    rollContent = p.rollNumber;
                    nameContent = p.name;
                    yearContent = p.year;
                    deptContent = p.department;
                  }

                  return (
                    <div key={r} className={`flex border border-blue-400/30 border-t-0 text-[8px] text-slate-700 ${r % 2 === 0 ? "bg-blue-50/40" : "bg-white/40"}`} style={{ height: config.rowHeight * zoom }}>
                      <div className="px-1 flex items-center justify-center border-r border-blue-400/30 last:border-r-0 truncate" style={{ width: `${config.columnWidths[0]}%` }}>{snoContent}</div>
                      <div className="px-1 flex items-center justify-center border-r border-blue-400/30 last:border-r-0 truncate" style={{ width: `${config.columnWidths[1]}%` }}>{rollContent}</div>
                      <div className="px-1 flex items-center justify-center border-r border-blue-400/30 last:border-r-0 truncate" style={{ width: `${config.columnWidths[2]}%` }}>{nameContent}</div>
                      <div className="px-1 flex items-center justify-center border-r border-blue-400/30 last:border-r-0 truncate" style={{ width: `${config.columnWidths[3]}%` }}>{yearContent}</div>
                      <div className="px-1 flex items-center justify-center border-r border-blue-400/30 last:border-r-0 truncate" style={{ width: `${config.columnWidths[4]}%` }}>{deptContent}</div>
                    </div>
                  );
                })}

                {/* Handles */}
                <div className="absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize bg-blue-500/30 hover:bg-blue-600/50 rounded" onMouseDown={handleResizeStart} />
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border border-blue-500 rounded-full bg-blue-200 pointer-events-none" />
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 border border-blue-500 rounded-full bg-blue-200 pointer-events-none" />
              </div>

              <div className="absolute text-[8px] font-mono text-slate-500 bg-slate-100/90 px-1 border border-slate-200 rounded" style={{ left: config.tableX * zoom, top: (config.tableY + (Math.min(config.rowsPerPage, participants.length || 1) + 1) * config.rowHeight + 10) * zoom }}>
                {config.tableWidth}x{Math.round((Math.min(config.rowsPerPage, participants.length || 1) + 1) * config.rowHeight)}px
              </div>
            </div>
          </div>
        </div>

        {/* PDF Preview Frame */}
        {pdfUrl && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <span className="text-sm font-semibold text-slate-800">PDF Output Preview</span>
              <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200" onClick={handleDownload}>
                <Download className="mr-1 h-3 w-3" /> Save File
              </Button>
            </div>
            <iframe ref={iframeRef} src={pdfUrl} className="w-full rounded-lg border border-slate-200 bg-slate-100" style={{ height: "600px" }} title="PDF Preview" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalibrationPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#232F3E]" />
          <p className="text-sm text-slate-500">Loading OD list generator...</p>
        </div>
      </div>
    }>
      <CalibrationPageContent />
    </Suspense>
  );
}
