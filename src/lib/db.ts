import { v4 as uuidv4 } from 'uuid';

// ========================
// IndexedDB Database Layer
// ========================

const DB_NAME = 'narrative-studio';
const DB_VERSION = 1;

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'podcast' | 'storytelling' | 'documentary' | 'other';
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  projectId: string;
  title: string;
  content: string;
  template?: string;
  wordCount: number;
  estimatedDuration: number; // seconds
  createdAt: string;
  updatedAt: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  provider: 'fish-audio' | 'omnivoice' | 'thonburian' | 'other';
  referenceUrl?: string;
  description?: string;
  createdAt: string;
}

export interface AudioFile {
  id: string;
  projectId: string;
  scriptId?: string;
  name: string;
  format: 'mp3' | 'wav' | 'ogg';
  size: number; // bytes
  duration?: number; // seconds
  url?: string; // blob URL or base64
  version: number;
  createdAt: string;
}

export interface Episode {
  id: string;
  projectId: string;
  title: string;
  episodeNumber: number;
  status: 'script' | 'draft' | 'recording' | 'editing' | 'published';
  scriptId?: string;
  audioFileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  type: 'script_created' | 'script_updated' | 'audio_generated' | 'episode_moved' | 'voice_added' | 'project_created';
  description: string;
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('scripts')) {
        const store = db.createObjectStore('scripts', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains('voices')) {
        db.createObjectStore('voices', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('audio')) {
        const store = db.createObjectStore('audio', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains('episodes')) {
        const store = db.createObjectStore('episodes', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains('activity')) {
        const store = db.createObjectStore('activity', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
    };
  });
}

async function dbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGet<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbPut<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function dbDelete(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function dbGetByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ========================
// High-level API
// ========================

export const db = {
  // Projects
  async getProjects(): Promise<Project[]> {
    return dbGetAll<Project>('projects');
  },
  async getProject(id: string): Promise<Project | undefined> {
    return dbGet<Project>('projects', id);
  },
  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project: Project = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await dbPut('projects', project);
    await this.addActivity(project.id, 'project_created', `สร้างโปรเจกต์ "${project.name}"`);
    return project;
  },
  async updateProject(id: string, data: Partial<Project>): Promise<void> {
    const existing = await this.getProject(id);
    if (!existing) return;
    await dbPut('projects', { ...existing, ...data, updatedAt: new Date().toISOString() });
  },
  async deleteProject(id: string): Promise<void> {
    // Delete all related data
    const scripts = await dbGetByIndex<Script>('scripts', 'projectId', id);
    for (const s of scripts) await dbDelete('scripts', s.id);
    const audio = await dbGetByIndex<AudioFile>('audio', 'projectId', id);
    for (const a of audio) await dbDelete('audio', a.id);
    const episodes = await dbGetByIndex<Episode>('episodes', 'projectId', id);
    for (const e of episodes) await dbDelete('episodes', e.id);
    const activity = await dbGetByIndex<Activity>('activity', 'projectId', id);
    for (const a of activity) await dbDelete('activity', a.id);
    await dbDelete('projects', id);
  },

  // Scripts
  async getScripts(projectId: string): Promise<Script[]> {
    return dbGetByIndex<Script>('scripts', 'projectId', projectId);
  },
  async getScript(id: string): Promise<Script | undefined> {
    return dbGet<Script>('scripts', id);
  },
  async createScript(data: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Promise<Script> {
    const script: Script = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await dbPut('scripts', script);
    await this.addActivity(data.projectId, 'script_created', `สร้างสคริปต์ "${script.title}"`);
    return script;
  },
  async updateScript(id: string, data: Partial<Script>): Promise<void> {
    const existing = await this.getScript(id);
    if (!existing) return;
    await dbPut('scripts', { ...existing, ...data, updatedAt: new Date().toISOString() });
    await this.addActivity(existing.projectId, 'script_updated', `อัพเดทสคริปต์ "${existing.title}"`);
  },
  async deleteScript(id: string): Promise<void> {
    const existing = await this.getScript(id);
    if (existing) await dbDelete('scripts', id);
  },

  // Voice Profiles
  async getVoices(): Promise<VoiceProfile[]> {
    return dbGetAll<VoiceProfile>('voices');
  },
  async createVoice(data: Omit<VoiceProfile, 'id' | 'createdAt'>): Promise<VoiceProfile> {
    const voice: VoiceProfile = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    await dbPut('voices', voice);
    return voice;
  },
  async deleteVoice(id: string): Promise<void> {
    await dbDelete('voices', id);
  },

  // Audio Files
  async getAudioFiles(projectId: string): Promise<AudioFile[]> {
    return dbGetByIndex<AudioFile>('audio', 'projectId', projectId);
  },
  async getAudioFile(id: string): Promise<AudioFile | undefined> {
    return dbGet<AudioFile>('audio', id);
  },
  async createAudioFile(data: Omit<AudioFile, 'id' | 'createdAt'>): Promise<AudioFile> {
    const file: AudioFile = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    await dbPut('audio', file);
    await this.addActivity(data.projectId, 'audio_generated', `สร้างไฟล์เสียง "${file.name}"`);
    return file;
  },
  async deleteAudioFile(id: string): Promise<void> {
    await dbDelete('audio', id);
  },

  // Episodes
  async getEpisodes(projectId: string): Promise<Episode[]> {
    return dbGetByIndex<Episode>('episodes', 'projectId', projectId);
  },
  async createEpisode(data: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'>): Promise<Episode> {
    const episode: Episode = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await dbPut('episodes', episode);
    return episode;
  },
  async updateEpisode(id: string, data: Partial<Episode>): Promise<void> {
    const allEpisodes = await dbGetAll<Episode>('episodes');
    const existing = allEpisodes.find(e => e.id === id);
    if (!existing) return;
    await dbPut('episodes', { ...existing, ...data, updatedAt: new Date().toISOString() });
    if (data.status) {
      await this.addActivity(existing.projectId, 'episode_moved', `ตอน "${existing.title}" เปลี่ยนสถานะเป็น ${data.status}`);
    }
  },
  async deleteEpisode(id: string): Promise<void> {
    await dbDelete('episodes', id);
  },

  // Activity
  async getActivity(projectId?: string): Promise<Activity[]> {
    if (projectId) {
      return dbGetByIndex<Activity>('activity', 'projectId', projectId);
    }
    return dbGetAll<Activity>('activity');
  },
  async addActivity(projectId: string, type: Activity['type'], description: string): Promise<void> {
    const activity: Activity = { id: uuidv4(), projectId, type, description, createdAt: new Date().toISOString() };
    await dbPut('activity', activity);
  },

  // Stats
  async getStats() {
    const [projects, scripts, voices, audio, episodes] = await Promise.all([
      this.getProjects(),
      dbGetAll<Script>('scripts'),
      this.getVoices(),
      dbGetAll<AudioFile>('audio'),
      dbGetAll<Episode>('episodes'),
    ]);
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalScripts: scripts.length,
      totalVoices: voices.length,
      totalAudio: audio.length,
      totalDuration: audio.reduce((sum, a) => sum + (a.duration || 0), 0),
      totalEpisodes: episodes.length,
      publishedEpisodes: episodes.filter(e => e.status === 'published').length,
    };
  },
};

// ========================
// Thai Number Converter
// ========================

const thaiDigits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

export function numberToThai(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return typeof num === 'string' ? num : String(num);
  if (n === 0) return thaiDigits[0];

  const str = String(n);
  let result = '';

  for (let i = 0; i < str.length; i++) {
    const digit = parseInt(str[i], 10);
    const unitPos = str.length - i - 1;

    if (digit === 0) continue;

    // Special cases for Thai
    if (unitPos === 1 && digit === 1) {
      result += 'สิบ';
    } else if (unitPos === 1 && digit === 2) {
      result += 'ยี่สิบ';
    } else if (unitPos === 0 && digit === 1 && str.length > 1) {
      result += 'เอ็ด';
    } else {
      result += thaiDigits[digit] + thaiUnits[unitPos];
    }
  }

  return result;
}

export function convertNumbersInText(text: string): string {
  return text.replace(/\b(\d+)\b/g, (match) => {
    const num = parseInt(match, 10);
    if (num >= 0 && num <= 9999999) {
      return numberToThai(num);
    }
    return match;
  });
}

// ========================
// Script Templates
// ========================

export const scriptTemplates = {
  storytelling: `# [TITLE]
# Template: เรื่องเล่า (Storytelling)

[EMOTION: calm]
ในสมัยก่อน... [PAUSE: 1s]

[EMOTION: excited]
มีเรื่องเล่าหนึ่งที่คนรุ่นก่อนเคยเล่าสืบต่อกันมา [PAUSE: 0.5s]

[EMOTION: mysterious]
ที่เกี่ยวกับ...`,

  podcast: `# [TITLE]
# Template: พ็อดแคสต์ (Podcast)

[EMOTION: friendly]
สวัสดีครับทุกคน! ยินดีต้อนรับกลับมาอีกครั้ง [PAUSE: 0.5s]

วันนี้เราจะมาพูดถึงเรื่อง... [PAUSE: 1s]

[EMOTION: excited]
เรื่องนี้น่าสนใจมากเลยครับ เพราะ...`,

  documentary: `# [TITLE]
# Template: สารคดี (Documentary)

[NARRATOR]
[EMOTION: serious]
ในประเทศไทย... [PAUSE: 1s]

มีปรากฏการณ์หนึ่งที่น่าสนใจมาก [PAUSE: 0.5s]

[EMOTION: wonder]
นั่นคือ... [PAUSE: 1.5s]`,
};
