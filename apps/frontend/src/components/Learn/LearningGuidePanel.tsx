'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as AWSIcons from './AWSServiceIcons';

interface GuidelineSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  prominent?: boolean;
  prominentColor?: 'amber' | 'sky';
  themeColor: 'sky' | 'emerald' | 'amber' | 'indigo';
}

interface ExampleLine {
  label: string;
  value: string;
}

const SECTIONS: (GuidelineSection | { type: 'divider' } | { type: 'example'; lines: ExampleLine[] })[] = [
  {
    icon: <AWSIcons.StepFunctionsIcon size={18} />,
    title: 'Complete modules in sequence.',
    description: 'Modules must be completed in order. Skipping ahead is not allowed.',
    themeColor: 'sky',
  },
  { type: 'divider' },
  {
    icon: <AWSIcons.S3Icon size={18} />,
    title: 'Revisit completed modules anytime.',
    description: 'After completing a module, you can return to it at any time for revision and learning.',
    themeColor: 'emerald',
  },
  { type: 'divider' },
  {
    icon: <AWSIcons.IAMIcon size={18} />,
    title: 'Unlock topics through progress.',
    description: 'Complete all modules in a topic to unlock the next topic.',
    themeColor: 'sky',
  },
  { type: 'divider' },
  {
    icon: <AWSIcons.ConfigIcon size={18} />,
    title: 'Quiz Attempt Policy',
    description: 'Each quiz can only be attempted once. Review the learning material carefully before starting.',
    prominent: true,
    prominentColor: 'amber',
    themeColor: 'amber',
  },
  { type: 'divider' },
  {
    icon: <AWSIcons.CloudWatchIcon size={18} />,
    title: 'Earn points through learning and quiz performance.',
    description: 'Completing a module awards 50% of the available points automatically.',
    themeColor: 'indigo',
  },
  { type: 'divider' },
  {
    icon: <AWSIcons.QuickSightIcon size={18} />,
    title: 'Quiz accuracy determines the remaining points.',
    description: 'The remaining 50% is awarded based on your quiz score. Higher accuracy earns more points.',
    themeColor: 'indigo',
  },
  { type: 'divider' },
  {
    type: 'example',
    lines: [
      { label: 'Module Completion', value: '50 Points' },
      { label: 'Quiz Score', value: '8 / 10 Correct' },
      { label: 'Quiz Reward', value: '40 Points' },
      { label: 'Final Score', value: '90 Points' },
    ],
  },
  { type: 'divider' },
  {
    icon: <AWSIcons.ApplicationComposerIcon size={18} />,
    title: 'Follow the learning path.',
    description: 'Modules, levels, and topics must be completed in order. You cannot jump between modules, levels, or topics.',
    prominent: true,
    prominentColor: 'sky',
    themeColor: 'sky',
  },
];

const COLOR_MAP: Record<string, { glow: string; border: string; iconBg: string; text: string }> = {
  sky: {
    glow: 'bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]',
    border: 'border-sky-500/20 hover:border-sky-500/35',
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    text: 'text-sky-600'
  },
  emerald: {
    glow: 'bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    border: 'border-emerald-500/20 hover:border-emerald-500/35',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-600'
  },
  amber: {
    glow: 'bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    border: 'border-amber-500/20 hover:border-amber-500/35',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-600'
  },
  indigo: {
    glow: 'bg-indigo-500/10 shadow-[0_0_20px_rgba(129,140,248,0.15)]',
    border: 'border-indigo-500/20 hover:border-indigo-500/35',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    text: 'text-indigo-600'
  }
};

export const LearningGuidePanel: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.3),0_12px_36px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-5 select-none w-full min-h-full">
      {/* Guidelines Header */}
      <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center border border-amber-500/20">
            <Lightbulb className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-widest font-heading">
            GUIDELINES
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold tracking-tight pl-10 -mt-1 leading-normal">
          Platform learning rules and progression guidelines
        </p>
      </div>

      {/* Guidelines Cards Stack */}
      <div className="flex flex-col gap-3">
        {SECTIONS.filter(section => 'type' in section ? section.type !== 'divider' : true).map((section, i) => {
          // Render example scoring card
          if ('type' in section && section.type === 'example') {
            return (
              <div
                key={i}
                className="w-full bg-sky-50/[0.04] border border-white/15 rounded-xl p-4 flex flex-col gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(15,23,42,0.02)] backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:bg-sky-50/[0.06]"
              >
                <div className="absolute inset-0 bg-teal-500/10 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-300" />

                <div className="flex items-center gap-3 z-10">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center relative flex-shrink-0 bg-white/10 border border-white/20 shadow-inner">
                    <div className="relative z-10 flex items-center justify-center">
                      <AWSIcons.CostExplorerIcon size={20} />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase font-heading">
                    Example Scoring
                  </h3>
                </div>

                <div className="space-y-1.5 pt-0.5 z-10">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    For a 100-point module:
                  </p>
                  {section.lines.map((line, j) => (
                    <div key={j} className="flex justify-between items-center text-xs py-1 border-b border-slate-200/5 last:border-0 last:pb-0">
                      <span className="text-slate-600 font-semibold">{line.label}</span>
                      <span className="font-bold text-slate-800 tabular-nums">{line.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          const guideline = section as GuidelineSection;
          const isProminent = guideline.prominent;
          const pc = guideline.prominentColor || 'sky';
          const themeColor = guideline.themeColor;
          const config = COLOR_MAP[themeColor] || COLOR_MAP.sky;

          // Prominent container theme mappings
          const containerClass = isProminent
            ? pc === 'amber'
              ? 'bg-amber-500/[0.06] hover:bg-amber-500/[0.09] border-amber-500/25 hover:border-amber-500/35 shadow-[0_6px_16px_rgba(245,158,11,0.03)]'
              : 'bg-sky-500/[0.06] hover:bg-sky-500/[0.09] border-sky-500/25 hover:border-sky-500/35 shadow-[0_6px_16px_rgba(14,165,233,0.03)]'
            : 'bg-sky-55/[0.03] hover:bg-sky-55/[0.06] border-white/10 hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_6px_20px_rgba(15,23,42,0.02)]';

          const iconContainerClass = isProminent
            ? pc === 'amber'
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-sky-500/10 border-sky-500/20'
            : 'bg-white/10 border-white/20';

          const titleColorClass = isProminent
            ? pc === 'amber'
              ? 'text-amber-900 font-bold'
              : 'text-sky-900 font-bold'
            : 'text-slate-800 font-bold';

          const descColorClass = isProminent
            ? pc === 'amber'
              ? 'text-amber-800/80'
              : 'text-sky-800/80'
            : 'text-slate-500/90';

          const glowColorClass = config.glow;

          return (
            <div
              key={i}
              className={cn(
                'w-full border rounded-xl p-4 flex items-start gap-4 transition-all duration-300 hover:scale-[1.005] backdrop-blur-md relative overflow-hidden group',
                containerClass
              )}
            >
              <div className={cn('absolute inset-0 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-300', glowColorClass)} />

              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center relative flex-shrink-0 border shadow-inner', iconContainerClass)}>
                <div className="relative z-10 flex items-center justify-center">
                  {React.cloneElement(guideline.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
                </div>
              </div>

              <div className="flex-1 min-w-0 z-10">
                <h3 className={cn(
                  'text-xs tracking-tight leading-snug font-heading',
                  titleColorClass
                )}>
                  {guideline.title}
                </h3>
                <p className={cn('text-[11px] leading-relaxed mt-1', descColorClass)}>
                  {guideline.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

