'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import EventsSidebarShell from '@/app/events/EventsSidebarShell';
import CoreSidebarShell from '@/app/core/CoreSidebarShell';
import CrewSidebarShell from '@/app/crew/(admin)/CrewSidebarShell';
import { RoadmapScreen } from '@/components/Roadmap/RoadmapScreen';
import { getAuthSession } from '@/lib/authHelper';
import { learningService } from '@/services/roadmap.api';
import { Loader2 } from 'lucide-react';
import { SkyBackground } from '@/components/Roadmap/SkyBackground';

export default function TopicRoadmapPage() {
  const router = useRouter();
  const params = useParams();
  const topicSlug = params.topicSlug as string;
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return getAuthSession().role;
    }
    return null;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const LayoutShell = useMemo(() => {
    return ({ children }: { children: React.ReactNode }) => {
      if (!mounted) {
        return <div className="min-h-screen bg-[#bae6fd]" />;
      }
      if (userRole === 'core') {
        return <CoreSidebarShell>{children}</CoreSidebarShell>;
      }
      // Hiding the sidebar for crew and enthusiasts on the roadmap screen
      return <>{children}</>;
    };
  }, [mounted, userRole]);

  // NOTE: We do NOT redirect to /login here — AuthWrapper already protects /learn/*.
  // A redundant redirect here (checking getAuthSession().isAuthenticated) caused an
  // infinite loop when accessToken was absent but aws_sgb_rec_user was valid.
  useEffect(() => {
    const session = getAuthSession();
    if (session.role) setUserRole(session.role);

    let active = true;
    const checkAccess = async () => {
      try {
        const topics = await learningService.getTopicList();
        if (!active) return;
        const topic = topics.find((t) => t.slug === topicSlug);
        if (!topic || !topic.unlocked) {
          router.replace('/learn');
          return;
        }
        setLoading(false);
      } catch {
        if (!active) return;
        setLoading(false);
      }
    };

    checkAccess();
    return () => { active = false; };
  }, [router, topicSlug]);

  if (loading) {
    return (
      <LayoutShell>
        <div className="h-full w-full min-h-[500px] bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-white flex items-center justify-center relative overflow-hidden font-sans select-none">
          <SkyBackground />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full bg-sky-500/10 animate-ping" />
              <Loader2 className="w-10 h-10 text-sky-500 animate-spin stroke-[2.5]" />
            </div>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase animate-pulse font-heading">
              Preparing Your Journey...
            </span>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <RoadmapScreen topicSlug={topicSlug} />
    </LayoutShell>
  );
}
