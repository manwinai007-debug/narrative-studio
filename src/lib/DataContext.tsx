'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db, type Project, type Script, type VoiceProfile, type AudioFile, type Episode, type Activity } from '@/lib/db';

interface DataContextType {
  // Projects
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Scripts
  scripts: Script[];
  loadScripts: (projectId: string) => Promise<void>;
  createScript: (data: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Script>;
  updateScript: (id: string, data: Partial<Script>) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;

  // Voices
  voices: VoiceProfile[];
  loadVoices: () => Promise<void>;
  createVoice: (data: Omit<VoiceProfile, 'id' | 'createdAt'>) => Promise<VoiceProfile>;
  deleteVoice: (id: string) => Promise<void>;

  // Audio
  audioFiles: AudioFile[];
  loadAudioFiles: (projectId: string) => Promise<void>;
  createAudioFile: (data: Omit<AudioFile, 'id' | 'createdAt'>) => Promise<AudioFile>;
  deleteAudioFile: (id: string) => Promise<void>;

  // Episodes
  episodes: Episode[];
  loadEpisodes: (projectId: string) => Promise<void>;
  createEpisode: (data: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Episode>;
  updateEpisode: (id: string, data: Partial<Episode>) => Promise<void>;
  deleteEpisode: (id: string) => Promise<void>;

  // Activity
  activity: Activity[];
  loadActivity: (projectId?: string) => Promise<void>;

  // Stats
  stats: { totalProjects: number; activeProjects: number; totalScripts: number; totalVoices: number; totalAudio: number; totalDuration: number; totalEpisodes: number; publishedEpisodes: number } | null;
  loadStats: () => Promise<void>;

  // Loading
  loading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState<DataContextType['stats']>(null);
  const [loading, setLoading] = useState(true);

  const setActiveProject = useCallback((p: Project | null) => {
    setActiveProjectState(p);
    if (p) {
      localStorage.setItem('ns-active-project', p.id);
    } else {
      localStorage.removeItem('ns-active-project');
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [projs, vcs, st] = await Promise.all([
          db.getProjects(),
          db.getVoices(),
          db.getStats(),
        ]);
        setProjects(projs);
        setVoices(vcs);
        setStats(st);

        // Restore active project
        const savedProjectId = localStorage.getItem('ns-active-project');
        if (savedProjectId) {
          const saved = projs.find(p => p.id === savedProjectId);
          if (saved) setActiveProjectState(saved);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const refreshProjects = useCallback(async () => {
    const projs = await db.getProjects();
    setProjects(projs);
  }, []);

  const loadStats = useCallback(async () => {
    const s = await db.getStats();
    setStats(s);
  }, []);

  const createProject = useCallback(async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const project = await db.createProject(data);
    await refreshProjects();
    await loadStats();
    return project;
  }, [refreshProjects, loadStats]);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    await db.updateProject(id, data);
    await refreshProjects();
    if (activeProject?.id === id) {
      setActiveProjectState(prev => prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : null);
    }
  }, [activeProject, refreshProjects]);

  const deleteProject = useCallback(async (id: string) => {
    await db.deleteProject(id);
    await refreshProjects();
    await loadStats();
    if (activeProject?.id === id) setActiveProject(null);
  }, [activeProject, loadStats]);

  const loadScripts = useCallback(async (projectId: string) => {
    const s = await db.getScripts(projectId);
    setScripts(s);
  }, []);

  const createScript = useCallback(async (data: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => {
    const script = await db.createScript(data);
    if (activeProject) await loadScripts(activeProject.id);
    await loadStats();
    return script;
  }, [activeProject, loadScripts, loadStats]);

  const updateScript = useCallback(async (id: string, data: Partial<Script>) => {
    await db.updateScript(id, data);
    if (activeProject) await loadScripts(activeProject.id);
  }, [activeProject, loadScripts]);

  const deleteScript = useCallback(async (id: string) => {
    await db.deleteScript(id);
    if (activeProject) await loadScripts(activeProject.id);
  }, [activeProject, loadScripts]);

  const loadVoices = useCallback(async () => {
    const v = await db.getVoices();
    setVoices(v);
  }, []);

  const createVoice = useCallback(async (data: Omit<VoiceProfile, 'id' | 'createdAt'>) => {
    const voice = await db.createVoice(data);
    await loadVoices();
    return voice;
  }, [loadVoices]);

  const deleteVoice = useCallback(async (id: string) => {
    await db.deleteVoice(id);
    await loadVoices();
  }, [loadVoices]);

  const loadAudioFiles = useCallback(async (projectId: string) => {
    const a = await db.getAudioFiles(projectId);
    setAudioFiles(a);
  }, []);

  const createAudioFile = useCallback(async (data: Omit<AudioFile, 'id' | 'createdAt'>) => {
    const file = await db.createAudioFile(data);
    if (activeProject) await loadAudioFiles(activeProject.id);
    return file;
  }, [activeProject, loadAudioFiles]);

  const deleteAudioFile = useCallback(async (id: string) => {
    await db.deleteAudioFile(id);
    if (activeProject) await loadAudioFiles(activeProject.id);
  }, [activeProject, loadAudioFiles]);

  const loadEpisodes = useCallback(async (projectId: string) => {
    const e = await db.getEpisodes(projectId);
    setEpisodes(e);
  }, []);

  const createEpisode = useCallback(async (data: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'>) => {
    const episode = await db.createEpisode(data);
    if (activeProject) await loadEpisodes(activeProject.id);
    await loadStats();
    return episode;
  }, [activeProject, loadEpisodes, loadStats]);

  const updateEpisode = useCallback(async (id: string, data: Partial<Episode>) => {
    await db.updateEpisode(id, data);
    if (activeProject) await loadEpisodes(activeProject.id);
  }, [activeProject, loadEpisodes]);

  const deleteEpisode = useCallback(async (id: string) => {
    await db.deleteEpisode(id);
    if (activeProject) await loadEpisodes(activeProject.id);
  }, [activeProject, loadEpisodes]);

  const loadActivity = useCallback(async (projectId?: string) => {
    const a = await db.getActivity(projectId);
    setActivity(a.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()));
  }, []);

  return (
    <DataContext.Provider value={{
      projects, activeProject, setActiveProject,
      createProject, updateProject, deleteProject,
      scripts, loadScripts, createScript, updateScript, deleteScript,
      voices, loadVoices, createVoice, deleteVoice,
      audioFiles, loadAudioFiles, createAudioFile, deleteAudioFile,
      episodes, loadEpisodes, createEpisode, updateEpisode, deleteEpisode,
      activity, loadActivity,
      stats, loadStats,
      loading,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
