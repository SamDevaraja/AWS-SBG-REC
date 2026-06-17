'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMarkCrewAttendance } from '@/lib/hooks';
import type { Ticket } from '@/lib/types';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  QrCode,
  Keyboard
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function TicketScannerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'manual' | 'camera'>('manual');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    status: string;
    ticket?: Ticket;
  } | null>(null);

  const checkInMutation = useMarkCrewAttendance();

  function handleScan(codeToScan: string) {
    if (!codeToScan.trim()) return;

    setScanResult(null);
    checkInMutation.mutate(
      { ticketCode: codeToScan.trim(), scannerId: 'crew-scanner-terminal-01' },
      {
        onSuccess: (res) => {
          setScanResult(res);
          setSearchQuery(''); // clear on success
          if (mode === 'camera') {
            setMode('manual'); // switch back to show result clearly
          }
        },
        onError: (err: Error) => {
          setScanResult({
            success: false,
            status: err.message || 'Verification system error.',
          });
        },
      },
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleScan(searchQuery);
  }

  return (
    <div className="space-y-6 py-5 px-4 sm:px-6 lg:px-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/45 backdrop-blur-md rounded-[22px] border border-white/50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#232F3E] font-display">
              Registration Verification
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Verify attendee registration details using Name, Email, Roll Number, or Ticket Code
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col bg-white/45 backdrop-blur-md rounded-[22px] border border-white/50 shadow-sm p-6 space-y-6">
        
        {/* Mode Toggle & Input Row */}
        <div className="w-full space-y-4">
          <div className="flex border-b border-slate-200/50">
            <button
              onClick={() => { setMode('manual'); setScanResult(null); }}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                mode === 'manual' 
                  ? 'text-[#232F3E] bg-white/40 shadow-[inset_0_-2px_0_0_#FF9900]' 
                  : 'text-slate-500 hover:text-[#232F3E] hover:bg-white/20'
              }`}
            >
              <Keyboard className="w-4 h-4" /> Manual Search
            </button>
            <button
              onClick={() => { setMode('camera'); setScanResult(null); }}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                mode === 'camera' 
                  ? 'text-[#232F3E] bg-white/40 shadow-[inset_0_-2px_0_0_#FF9900]' 
                  : 'text-slate-500 hover:text-[#232F3E] hover:bg-white/20'
              }`}
            >
              <QrCode className="w-4 h-4" /> QR Scanner
            </button>
          </div>

          {mode === 'manual' ? (
            <form onSubmit={handleSubmit} className="relative w-full">
              <div className="flex items-center bg-white border border-slate-200 rounded-[14px] px-4 py-3.5 focus-within:border-slate-300 transition-all shadow-sm">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Name, Email, Roll Number, or Ticket Code..."
                  className="bg-transparent w-full outline-none text-[#232F3E] text-[15px] placeholder:text-slate-400 font-medium"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={checkInMutation.isPending || !searchQuery.trim()}
                  className="hidden" // Hidden submit button
                />
                {checkInMutation.isPending && (
                  <div className="w-5 h-5 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin ml-3 shrink-0" />
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-full max-w-[280px] aspect-square rounded-[24px] bg-[#1a232f] overflow-hidden shadow-inner flex items-center justify-center mb-4">
                <Scanner
                  onScan={(result) => {
                    if (result && result.length > 0 && result[0].rawValue) {
                      handleScan(result[0].rawValue);
                    }
                  }}
                  onError={(error) => console.log(error?.message)}
                  sound={false}
                  components={{
                    finder: false,
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                  }}
                />
                
                {/* Custom Finder Overlay (pointer events none so it doesn't block camera interactions) */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner Markers */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-[3px] border-l-[3px] border-brand-orange rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-[3px] border-r-[3px] border-brand-orange rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-[3px] border-l-[3px] border-brand-orange rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-[3px] border-r-[3px] border-brand-orange rounded-br-lg" />
                  
                  {/* Scanning Laser Line Animation */}
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-brand-orange shadow-[0_0_12px_rgba(255,153,0,0.9)] animate-pulse"
                    style={{ top: '50%' }}
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 bg-white/50 px-4 py-1.5 rounded-full border border-white/40">
                Position QR code within frame
              </p>
            </div>
          )}
        </div>

        {/* Results / Empty State */}
        <div className="w-full">
          {!scanResult ? (
            mode === 'manual' ? (
              <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="border-[2px] border-dashed border-slate-300 rounded-[16px] min-h-[260px] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-[#232F3E] mb-1">Search query required</h3>
                <p className="text-sm text-slate-500">Enter search criteria above to scan and verify database records.</p>
              </div>
            ) : null
          ) : (
            <div
              className={`overflow-hidden p-6 rounded-[16px] border ${
                scanResult.success 
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                  : 'bg-rose-50 border-rose-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className={`p-3 rounded-2xl shadow-sm bg-white border ${scanResult.success ? 'border-emerald-100 text-emerald-600' : 'border-rose-100 text-rose-600'}`}>
                  {scanResult.success ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : scanResult.status.includes('Already') ? (
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-xl mb-1 ${
                    scanResult.success ? 'text-emerald-900' : 'text-rose-900'
                  }`}>
                    {scanResult.success ? 'Access Granted - Verified' : 'Access Denied'}
                  </h3>
                  <p className={`text-sm font-medium ${scanResult.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {scanResult.status}
                  </p>
                </div>
              </div>

              {scanResult.success && scanResult.ticket && (
                <div className="mt-6 pt-5 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-[12px] p-4 border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 mb-1.5">
                      <User className="w-3 h-3" /> Attendee
                    </div>
                    <div className="text-sm font-semibold text-emerald-950 truncate">
                      {scanResult.ticket.userName || (scanResult.ticket.registration ? scanResult.ticket.registration.name : 'Unknown')}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-[12px] p-4 border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 mb-1.5">
                      <Calendar className="w-3 h-3" /> Event
                    </div>
                    <div className="text-sm font-semibold text-emerald-950 truncate">
                      {scanResult.ticket.event?.title || 'Unknown Event'}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-[12px] p-4 border border-emerald-100 shadow-sm lg:col-span-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 mb-1.5">
                      <Tag className="w-3 h-3" /> Ticket ID
                    </div>
                    <div className="text-sm font-mono font-medium text-emerald-900 break-all">
                      {scanResult.ticket.id}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
