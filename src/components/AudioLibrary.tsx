'use client';

import { useState, useRef, useEffect } from 'react';
import { useData } from '@/lib/DataContext';
import type { AudioFile } from '@/lib/db';

export default function AudioLibrary({ page }: { page: string }) {
  if (page !== 'audio') return null;
  const { activeProject, audioFiles, createAudioFile, deleteAudioFile } = useData();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!activeProject) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg">กรุณาเลือกโปรเจกต์ก่อน</p>
        </div>
      </div>
    );
  }

  const filtered = audioFiles.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let format: AudioFile['format'] = 'mp3';
      if (ext === 'wav') format = 'wav';
      else if (ext === 'ogg') format = 'ogg';

      const url = URL.createObjectURL(file);
      await createAudioFile({
        projectId: activeProject.id,
        name: file.name,
        format,
        size: file.size,
        url,
        version: 1,
      });
    }
    e.target.value = '';
  };

  const togglePlay = (file: AudioFile) => {
    if (playingId === file.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else if (file.url) {
      if (audioRef.current) {
        audioRef.current.src = file.url;
        audioRef.current.play();
      }
      setPlayingId(file.id);
    }
  };

  const handleExport = (file: AudioFile, targetFormat: string) => {
    if (!file.url) return;
    const a = document.createElement('a');
    a.href = file.url;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    a.download = `${baseName}.${targetFormat}`;
    a.click();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Audio Library</h1>
          <p className="text-gray-400 mt-1">จัดการไฟล์เสียง — upload, preview, export</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาไฟล์..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 w-56"
            />
          </div>
          <label className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition cursor-pointer flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
            Upload
            <input type="file" accept="audio/*" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">ไฟล์ทั้งหมด</p>
          <p className="text-xl font-bold text-white mt-1">{audioFiles.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">ขนาดรวม</p>
          <p className="text-xl font-bold text-white mt-1">
            {formatSize(audioFiles.reduce((sum, f) => sum + f.size, 0))}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">ระยะเวลารวม</p>
          <p className="text-xl font-bold text-white mt-1">
            {formatDuration(audioFiles.reduce((sum, f) => sum + (f.duration || 0), 0))}
          </p>
        </div>
      </div>

      {/* File List */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-3">🎵</p>
          <p className="text-gray-400">
            {audioFiles.length === 0 ? 'ยังไม่มีไฟล์เสียง' : 'ไม่พบไฟล์ที่ค้นหา'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {audioFiles.length === 0 ? 'Upload ไฟล์เสียงหรือ generate จาก Voice Lab' : 'ลองค้นหาด้วยคำอื่น'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-gray-800 text-xs text-gray-500 font-medium">
            <span className="w-8"></span>
            <span>ชื่อไฟล์</span>
            <span className="w-20 text-center">ขนาด</span>
            <span className="w-20 text-center">รูปแบบ</span>
            <span className="w-24 text-center">Actions</span>
          </div>
          <div className="divide-y divide-gray-800/50">
            {filtered.map(file => (
              <div key={file.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 items-center hover:bg-gray-800/30 transition group">
                {/* Play Button */}
                <button
                  onClick={() => togglePlay(file)}
                  className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500/20 transition"
                >
                  {playingId === file.id ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>

                {/* File Info */}
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-600">
                    v{file.version} · {new Date(file.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {file.duration && ` · ${formatDuration(file.duration)}`}
                  </p>
                </div>

                {/* Size */}
                <span className="text-xs text-gray-400 text-center">{formatSize(file.size)}</span>

                {/* Format */}
                <span className={`text-xs px-2 py-0.5 rounded-full text-center uppercase font-mono ${
                  file.format === 'mp3' ? 'bg-green-500/10 text-green-400' :
                  file.format === 'wav' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-purple-500/10 text-purple-400'
                }`}>
                  {file.format}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 justify-center opacity-0 group-hover:opacity-100 transition">
                  {['mp3', 'wav', 'ogg'].filter(f => f !== file.format).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(file, fmt)}
                      className="px-2 py-1 text-[10px] bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
                      title={`Export as ${fmt.toUpperCase()}`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                  <button
                    onClick={() => deleteAudioFile(file.id)}
                    className="px-2 py-1 text-[10px] bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
    </div>
  );
}
