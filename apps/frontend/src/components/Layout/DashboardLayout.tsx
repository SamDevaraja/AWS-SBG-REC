'use client';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-200px] left-[10%] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[5%] w-[400px] h-[400px] rounded-full bg-slate-900/[0.04] blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-orange-500/[0.03] blur-[80px]" />
      </div>
      <main className="flex-1 relative z-10 min-w-0 p-4 lg:p-6 pb-20 lg:pb-6 w-full">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
