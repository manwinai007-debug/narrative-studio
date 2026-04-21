'use client';

import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import type { Episode } from '@/lib/db';

const columns: { id: Episode['status']; label: string; color: string; icon: string }[] = [
  { id: 'script', label: 'Script', color: 'border-blue-500/30 bg-blue-500/5', icon: '📝' },
  { id: 'draft', label: 'Draft', color: 'border-amber-500/30 bg-amber-500/5', icon: '📋' },
  { id: 'recording', label: 'Recording', color: 'border-purple-500/30 bg-purple-500/5', icon: '🎙️' },
  { id: 'editing', label: 'Editing', color: 'border-orange-500/30 bg-orange-500/5', icon: '✂️' },
  { id: 'published', label: 'Published', color: 'border-green-500/30 bg-green-500/5', icon: '✅' },
];

export default function ContentPipeline({ page }: { page: string }) {
  if (page !== 'pipeline') return null;
  const { activeProject, episodes, createEpisode, updateEpisode, deleteEpisode } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  if (!activeProject) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg">กรุณาเลือกโปรเจกต์ก่อน</p>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const epCount = episodes.length;
    await createEpisode({
      projectId: activeProject.id,
      title: newTitle.trim(),
      episodeNumber: epCount + 1,
      status: 'script',
    });
    setNewTitle('');
    setShowAdd(false);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = async (status: Episode['status']) => {
    if (draggedId) {
      await updateEpisode(draggedId, { status });
    }
    setDraggedId(null);
    setDragOverStatus(null);
  };

  const handleNextStatus = async (episode: Episode) => {
    const currentIndex = columns.findIndex(c => c.id === episode.status);
    if (currentIndex < columns.length - 1) {
      await updateEpisode(episode.id, { status: columns[currentIndex + 1].id });
    }
  };

  const handlePrevStatus = async (episode: Episode) => {
    const currentIndex = columns.findIndex(c => c.id === episode.status);
    if (currentIndex > 0) {
      await updateEpisode(episode.id, { status: columns[currentIndex - 1].id });
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Pipeline</h1>
          <p className="text-gray-400 mt-1">Track workflow แต่ละตอน — Script → Published</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          ตอนใหม่
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const columnEpisodes = episodes.filter(e => e.status === col.id);
          return (
            <div
              key={col.id}
              className={`w-64 shrink-0 rounded-2xl border p-3 ${col.color} transition ${
                dragOverStatus === col.id ? 'ring-2 ring-amber-500/50' : ''
              }`}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={() => handleDrop(col.id)}
              onDragLeave={() => setDragOverStatus(null)}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <span>{col.icon}</span>
                <span className="text-sm font-semibold text-white">{col.label}</span>
                <span className="text-xs text-gray-500 ml-auto">{columnEpisodes.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {columnEpisodes.map(ep => (
                  <div
                    key={ep.id}
                    draggable
                    onDragStart={() => handleDragStart(ep.id)}
                    className="bg-gray-800/80 border border-gray-700 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-gray-600 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">Ep.{ep.episodeNumber} {ep.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {new Date(ep.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handlePrevStatus(ep)}
                        className="px-2 py-0.5 text-[10px] bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
                      >
                        ← ย้อน
                      </button>
                      <button
                        onClick={() => handleNextStatus(ep)}
                        className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition"
                      >
                        ถัดไป →
                      </button>
                      <button
                        onClick={() => deleteEpisode(ep.id)}
                        className="ml-auto px-2 py-0.5 text-[10px] text-red-400 hover:text-red-300 transition"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Episode Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">เพิ่มตอนใหม่</h2>
            <input
              type="text"
              placeholder="ชื่อตอน"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm">ยกเลิก</button>
              <button onClick={handleCreate} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl transition text-sm">เพิ่ม</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
