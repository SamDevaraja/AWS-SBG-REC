'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { modulesService, ModuleData, ModuleDetail } from '@/services/roadmap.api';
import { cn } from '@/lib/utils';

const moduleDetailCache: Record<string, ModuleDetail> = {};

interface MissionDetailsDrawerProps {
  module: ModuleData | null;
  isOpen: boolean;
  onClose: () => void;
  status: 'completed' | 'current' | 'locked';
  topicSlug: string;
}

export const MissionDetailsDrawer: React.FC<MissionDetailsDrawerProps> = ({
  module,
  isOpen,
  onClose,
  status,
  topicSlug,
}) => {
  const router = useRouter();
  const [detail, setDetail] = React.useState<ModuleDetail | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen || !module) {
      setDetail(null);
      return;
    }

    const cached = moduleDetailCache[module.id];
    if (cached) {
      setDetail(cached);
      return;
    }

    let active = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await modulesService.getModuleBySlug(module.id);
        if (!active) return;
        moduleDetailCache[module.id] = data;
        setDetail(data);
      } catch (err) {
        console.error('Failed to load module details:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [isOpen, module]);

  if (!module) return null;

  const handleStartLearning = (mode: 'reading' | 'review' = 'reading') => {
    router.push(`/learn/${topicSlug}/${module.id}?mode=${mode}`);
    onClose();
  };

  const statusLabel = {
    completed: 'Completed',
    current: 'Ready To Start',
    locked: 'Locked'
  }[status];

  const hasQuizReview = status === 'completed';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-slate-200 text-slate-900 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            {/* Header Hero Area */}
            <div className="relative p-6 border-b border-slate-200/50 bg-slate-50/50 flex flex-col pr-12">
              <button
                className="absolute top-4 right-4 p-2 text-slate-450 hover:text-slate-700 rounded-full hover:bg-slate-200/40 transition-colors"
                onClick={onClose}
              >
                <Icons.X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2 font-outfit">
                {module.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                {module.description}
              </p>
            </div>

            {/* Mission Parameters */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-wider flex items-center gap-1.5 font-outfit">
                  <Icons.Sliders className="w-4 h-4 text-emerald-650" />
                  Mission parameters
                </h4>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100 shadow-sm font-medium">
                  {/* Status row */}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-slate-500">Completion Status</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-outfit",
                      status === 'completed' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      status === 'current' && "bg-blue-50 text-blue-600 border-blue-200 animate-pulse",
                      status === 'locked' && "bg-slate-50 text-slate-400 border-slate-200"
                    )}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Dedicated learning pages row */}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-slate-500">Learning Pages</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 font-outfit">
                      <Icons.BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                      {loading ? '...' : (detail?.slides?.length ?? 0)} Pages
                    </span>
                  </div>

                  {/* Architecture validations quiz questions row */}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-slate-500">Quiz Questions</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 font-outfit">
                      <Icons.ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {loading ? '...' : (detail?.questions?.length ?? 0)} Questions
                    </span>
                  </div>

                  {/* XP Reward row */}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-slate-500">XP Reward</span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 font-outfit">
                      <Icons.Zap className="w-3.5 h-3.5 fill-current" />
                      +{module.xpPoints} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2.5">
              {status === 'completed' ? (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => handleStartLearning('reading')}
                    className="w-full text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 font-bold py-3 px-6 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 font-outfit shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]"
                  >
                    <Icons.BookOpen className="w-4 h-4 text-slate-500" />
                    View Learning Content
                  </button>
                  {hasQuizReview && (
                    <button
                      onClick={() => handleStartLearning('review')}
                      className="w-full text-white bg-slate-900 hover:bg-slate-800 font-bold py-3 px-6 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 font-outfit shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]"
                    >
                      <Icons.FileText className="w-4 h-4 text-amber-400" />
                      View Quiz Review
                    </button>
                  )}
                </div>
              ) : status === 'current' ? (
                <button
                  onClick={() => handleStartLearning('reading')}
                  className="relative w-full overflow-hidden font-black py-3.5 px-6 rounded-xl text-sm tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 font-outfit cursor-pointer text-white group shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_28px_rgba(79,70,229,0.45)] hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 45%, #4f46e5 100%)' }}
                >
                  {/* Subtle shimmer on hover */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white rounded-xl" />
                  <Icons.GraduationCap className="w-4 h-4 stroke-[2.5] relative z-10" />
                  <span className="relative z-10">Start Learning</span>
                  <Icons.ArrowRight className="w-3.5 h-3.5 relative z-10 opacity-70 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              ) : (
                <div className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 px-6 rounded-xl text-xs text-center border border-slate-200 select-none flex items-center justify-center gap-1.5 font-outfit">
                  <Icons.Lock className="w-3.5 h-3.5" />
                  Complete previous module to unlock
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
