'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { topicsService, type TopicData, type TopicTheme } from '@/services/roadmap.api';
import { ApiError } from '@/services/roadmap.apiClient';
import { authService } from '@/services/auth.service';
import TopicCard from '@/components/Core/TopicCard';
import CreateTopicModal from '@/components/Core/CreateTopicModal';
import EditTopicModal from '@/components/Core/EditTopicModal';
import DeleteTopicModal from '@/components/Core/DeleteTopicModal';
import { showToast } from '@/components/Core/Toast';

export default function TopicsDirectoryPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicData | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<TopicData | null>(null);

  const [authorized, setAuthorized] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const handleApiError = (err: any) => {
    const apiError = err as ApiError;
    if (apiError.status === 401) {
      authService.logout();
      router.push('/login');
    } else if (apiError.status === 403) {
      alert('Permission Denied: You do not have the required core privileges.');
    } else {
      alert(apiError.message || 'An unexpected error occurred.');
    }
  };

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await topicsService.getTopics();
      setTopics(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load topics: error details =', {
        message: err?.message,
        status: err?.status,
        errors: err?.errors,
        raw: err
      });
      setError(err?.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const role = (parsed?.role ?? "").toLowerCase().trim();
        if (role === "core") {
          setAuthorized(true);
          setCheckingAuth(false);
          loadTopics();
        } else if (parsed.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}&permission=manage_announcements`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.hasPermission) {
                setAuthorized(true);
                loadTopics();
              } else {
                router.replace('/crew/dashboard');
              }
              setCheckingAuth(false);
            })
            .catch(() => {
              router.replace('/crew/dashboard');
              setCheckingAuth(false);
            });
        } else {
          router.replace('/login');
          setCheckingAuth(false);
        }
      } else {
        router.replace('/login');
        setCheckingAuth(false);
      }
    } catch {
      router.replace('/login');
      setCheckingAuth(false);
    }
  }, [router]);

  const handleCreateTopic = async (name: string, description: string) => {
    try {
      await topicsService.createTopic({ name, description });
      await loadTopics();
      showToast('Topic created successfully');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleUpdateTopic = async (id: string, name: string, description: string, theme: TopicTheme) => {
    try {
      await topicsService.updateTopic(id, { name, description, theme });
      await loadTopics();
      showToast('Topic updated successfully');
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await topicsService.deleteTopic(id);
      await loadTopics();
      showToast('Topic deleted successfully');
    } catch (err) {
      handleApiError(err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Icons.RefreshCw className="animate-spin text-[#FF9900]" size={32} />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verifying Security Credentials...</span>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="max-w-xl w-full border-2 border-rose-500/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Icons.AlertTriangle className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">Error Loading Topics</h2>
            <p className="text-xs text-slate-650 leading-relaxed max-w-md mx-auto">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="bg-rose-600 hover:bg-rose-550 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all font-heading">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800 overflow-hidden font-sans">

      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 select-none">
        <div className="flex items-center gap-6 h-full text-xs font-bold">
          <Link
            href="/core/topics"
            className="transition-all duration-150 h-full flex items-center px-1 border-b-2 text-indigo-650 font-extrabold border-indigo-600"
          >
            Roadmap Builder
          </Link>
          <Link
            href="/core/learners"
            className="transition-all duration-150 h-full flex items-center px-1 text-slate-500 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-300 border-b-2 border-transparent"
          >
            Learners Directory
          </Link>
        </div>
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#232F3E] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-[8px] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 font-heading"
          >
            <Icons.Plus className="w-4 h-4 stroke-[3]" />
            Create Topic
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading && topics.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-xs text-slate-400 font-bold tracking-wider uppercase animate-pulse">Loading Topics...</span>
            </div>
          </div>
        ) : topics.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <Icons.FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-heading">No Topics Yet</h3>
                <p className="text-xs text-slate-550 mt-1 leading-relaxed font-semibold max-w-xs">
                  Create your first topic to start building the curriculum roadmap.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#232F3E] hover:bg-slate-800 text-white font-black text-xs px-5 py-2.5 rounded-[8px] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 font-heading"
              >
                <Icons.Plus className="w-4 h-4 stroke-[3]" />
                Create First Topic
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} onEdit={setEditingTopic} onDelete={setDeletingTopic} />
            ))}
          </div>
        )}
      </div>

      <CreateTopicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTopic}
      />

      <EditTopicModal
        isOpen={!!editingTopic}
        topic={editingTopic}
        onClose={() => setEditingTopic(null)}
        onSubmit={handleUpdateTopic}
      />

      <DeleteTopicModal
        isOpen={!!deletingTopic}
        topic={deletingTopic}
        onClose={() => setDeletingTopic(null)}
        onSubmit={handleDeleteTopic}
      />
    </div>
  );
}
