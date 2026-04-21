'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/lib/DataContext';
import type { Project } from '@/lib/db';

// Icons (inline SVG to avoid dependency issues)
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  ),
  script: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  voice: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  ),
  pipeline: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  audio: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  lock: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
  { id: 'scripts', label: 'Script Editor', icon: icons.script },
  { id: 'voices', label: 'Voice Lab', icon: icons.voice },
  { id: 'pipeline', label: 'Content Pipeline', icon: icons.pipeline },
  { id: 'audio', label: 'Audio Library', icon: icons.audio },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState('dashboard');
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectType, setNewProjectType] = useState<Project['type']>('storytelling');
  const { projects, activeProject, setActiveProject, createProject, loadScripts, loadEpisodes, loadAudioFiles, loadActivity } = useData();

  useEffect(() => {
    const saved = localStorage.getItem('ns-auth');
    if (saved === 'true') setAuthed(true);
  }, []);

  useEffect(() => {
    if (activeProject) {
      loadScripts(activeProject.id);
      loadEpisodes(activeProject.id);
      loadAudioFiles(activeProject.id);
      loadActivity(activeProject.id);
    }
  }, [activeProject, loadScripts, loadEpisodes, loadAudioFiles, loadActivity]);

  function handleLogin() {
    // Simple password auth — stores hash in localStorage
    const storedHash = localStorage.getItem('ns-password-hash');
    if (!storedHash) {
      // First time: set password
      const hash = btoa(password);
      localStorage.setItem('ns-password-hash', hash);
      localStorage.setItem('ns-auth', 'true');
      setAuthed(true);
    } else {
      if (btoa(password) === storedHash) {
        localStorage.setItem('ns-auth', 'true');
        setAuthed(true);
      } else {
        alert('รหัสผ่านไม่ถูกต้อง');
      }
    }
  }

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;
    const project = await createProject({
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      type: newProjectType,
      status: 'active',
    });
    setActiveProject(project);
    setShowNewProject(false);
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectType('storytelling');
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-full max-w-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
              {icons.voice}
            </div>
            <h1 className="text-2xl font-bold text-white">Narrative Studio</h1>
            <p className="text-gray-400 mt-1">สร้างเสียงเล่าเรื่องระดับมืออาชีพ</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              เข้าสู่ระบบ
            </button>
          </div>
          <p className="text-gray-600 text-xs text-center mt-4">ครั้งแรก? ใส่รหัสผ่านที่ต้องการจะตั้ง</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
              {icons.voice}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Narrative Studio</h1>
              <p className="text-[10px] text-gray-500">by ปู้เป้</p>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        <div className="p-3 border-b border-gray-800">
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-750 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                {icons.folder}
                <span className="truncate">{activeProject?.name || 'เลือกโปรเจกต์'}</span>
              </div>
              {icons.chevronDown}
            </button>
            {showProjectDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {projects.filter(p => p.status === 'active').map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveProject(p); setShowProjectDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition truncate"
                  >
                    {p.name}
                  </button>
                ))}
                <div className="border-t border-gray-700">
                  <button
                    onClick={() => { setShowNewProject(true); setShowProjectDropdown(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-gray-700 transition"
                  >
                    {icons.plus}
                    สร้างโปรเจกต์ใหม่
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                page === item.id
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => { localStorage.removeItem('ns-auth'); setAuthed(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition"
          >
            {icons.lock}
            ล็อกเอาท์
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ page: string }>, { page });
          }
          return child;
        })}
      </main>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowNewProject(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">สร้างโปรเจกต์ใหม่</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="ชื่อโปรเจกต์"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <textarea
                placeholder="รายละเอียด (optional)"
                value={newProjectDesc}
                onChange={e => setNewProjectDesc(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
              <select
                value={newProjectType}
                onChange={e => setNewProjectType(e.target.value as Project['type'])}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="storytelling">เรื่องเล่า (Storytelling)</option>
                <option value="podcast">พ็อดแคสต์ (Podcast)</option>
                <option value="documentary">สารคดี (Documentary)</option>
                <option value="other">อื่นๆ (Other)</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition text-sm"
              >
                สร้าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
