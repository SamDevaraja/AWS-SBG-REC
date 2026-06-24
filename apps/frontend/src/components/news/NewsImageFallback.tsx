import type { NewsCategory } from "@/types/news";
import { getCategoryLabel } from "@/utils/news-format";
import { cn } from "@/utils/cn";

type NewsImageFallbackProps = {
  category: NewsCategory | null;
  className?: string;
  tone?: "light" | "dark";
};

export function NewsImageFallback({
  category,
  className,
  tone = "dark",
}: NewsImageFallbackProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-slate-50 overflow-hidden border border-slate-100",
        className,
      )}
      aria-hidden="true"
    >
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* AWS logo container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <div className="w-20 h-12 flex items-center justify-center">
          <img
            src="/aws-logo.svg"
            alt="AWS Logo"
            className="w-full h-full object-contain"
          />
        </div>
        
        {category && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-200/50 border border-slate-200 px-2 py-0.5 rounded-[4px]">
            {getCategoryLabel(category)}
          </span>
        )}
      </div>
    </div>
  );
}

