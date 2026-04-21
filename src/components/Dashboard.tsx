'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function Dashboard({ page }: { page: string }) {
  if (page !== 'dashboard') return null;
  const { stats, projects, activity, activeProject, loadStats, loadActivity, setActiveProject } = useData();

  // Refresh stats and activity every time Dashboard mounts
  React.useEffect(() => {
    loadStats();
    loadActivity();
  }, [loadStats, loadActivity]);

  if (!stats) return <div className="p-8 text-gray-400">Loading...</div>;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const activityIcons: Record<string, string> = {
    script_created: '📝',
    script_updated: '✏️',
    audio_generated: '🎙️',
    episode_moved: '📊',
    voice_added: '🗣️',
    project_created: '🆕',
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">ภาพรวมทุกโปรเจกต์และ activity ล่าสุด</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>}
          label="โปรเจกต์"
          value={stats.totalProjects}
          color="bg-amber-500/10"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>}
          label="สคริปต์"
          value={stats.totalScripts}
          color="bg-blue-500/10"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Z" /></svg>}
          label="ไฟล์เสียง"
          value={stats.totalAudio}
          color="bg-purple-500/10"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          label="ระยะเวลารวม"
          value={formatDuration(stats.totalDuration)}
          color="bg-green-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">โปรเจกต์ล่าสุด</h2>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>ยังไม่มีโปรเจกต์</p>
              <p className="text-sm mt-1">คลิก &quot;สร้างโปรเจกต์ใหม่&quot; ใน sidebar เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveProject(p)}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    activeProject?.id === p.id
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.description || p.type}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.status === 'active' ? 'bg-green-500/10 text-green-400' :
                      p.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Activity ล่าสุด</h2>
          {activity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>ยังไม่มี activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-start gap-3 p-2">
                  <span className="text-lg">{activityIcons[a.type] || '📌'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-300 truncate">{a.description}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {new Date(a.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Episode Progress */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Episode Progress</h2>
          <span className="text-sm text-gray-400">
            {stats.publishedEpisodes} / {stats.totalEpisodes} published
          </span>
        </div>
        {stats.totalEpisodes > 0 ? (
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${stats.totalEpisodes > 0 ? (stats.publishedEpisodes / stats.totalEpisodes) * 100 : 0}%` }}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">ยังไม่มี episode</p>
        )}
      </div>
    </div>
  );
}
