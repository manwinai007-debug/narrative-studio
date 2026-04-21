'use client';

import { useState, useRef } from 'react';
import { useData } from '@/lib/DataContext';
import type { VoiceProfile } from '@/lib/db';

const providers = [
  { id: 'fish-audio', name: 'Fish Audio', color: 'from-blue-500 to-cyan-500', desc: 'Thai voice cloning — high quality' },
  { id: 'omnivoice', name: 'OmniVoice (k2-fsa)', color: 'from-purple-500 to-pink-500', desc: 'Open-source voice cloning' },
  { id: 'thonburian', name: 'ThonburianTTS', color: 'from-green-500 to-emerald-500', desc: 'Zero-shot Thai TTS' },
];

export default function VoiceLab({ page }: { page: string }) {
  if (page !== 'voices') return null;
  const { voices, createVoice, deleteVoice } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newProvider, setNewProvider] = useState<VoiceProfile['provider']>('fish-audio');
  const [newDesc, setNewDesc] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('fish-audio');
  const [params, setParams] = useState({
    speed: 1.0,
    pitch: 0,
    stability: 0.5,
    similarity: 0.75,
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await createVoice({ name: newName.trim(), provider: newProvider, description: newDesc.trim() });
    setNewName('');
    setNewDesc('');
    setShowAdd(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Lab</h1>
          <p className="text-gray-400 mt-1">จัดการเสียง reference voice และ TTS providers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          เพิ่มเสียง
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Library */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Voice Library ({voices.length})</h2>
            {voices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-3xl mb-2">🗣️</p>
                <p className="text-sm">ยังไม่มีเสียง</p>
              </div>
            ) : (
              <div className="space-y-2">
                {voices.map(v => {
                  const provider = providers.find(p => p.id === v.provider);
                  return (
                    <div key={v.id} className="p-3 bg-gray-800 rounded-xl group">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{v.name}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full bg-gradient-to-r ${provider?.color || 'from-gray-500 to-gray-600'} text-white`}>
                            {provider?.name || v.provider}
                          </span>
                          {v.description && <p className="text-xs text-gray-500 mt-1">{v.description}</p>}
                        </div>
                        <button
                          onClick={() => deleteVoice(v.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition text-xs ml-2"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* TTS Provider & Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">TTS Provider</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    selectedProvider === p.id
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className={`inline-block px-2 py-0.5 text-[10px] rounded-full bg-gradient-to-r ${p.color} text-white mb-2`}>
                    {p.name}
                  </div>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Tuning */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Parameter Tuning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Speed</span>
                  <span className="text-amber-400 font-mono">{params.speed.toFixed(2)}x</span>
                </label>
                <input
                  type="range" min="0.5" max="2.0" step="0.05"
                  value={params.speed}
                  onChange={e => setParams(p => ({ ...p, speed: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>0.5x</span><span>1.0x</span><span>2.0x</span>
                </div>
              </div>
              <div>
                <label className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Pitch</span>
                  <span className="text-amber-400 font-mono">{params.pitch > 0 ? '+' : ''}{params.pitch}</span>
                </label>
                <input
                  type="range" min="-12" max="12" step="1"
                  value={params.pitch}
                  onChange={e => setParams(p => ({ ...p, pitch: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>-12</span><span>0</span><span>+12</span>
                </div>
              </div>
              <div>
                <label className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Stability</span>
                  <span className="text-amber-400 font-mono">{params.stability.toFixed(2)}</span>
                </label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={params.stability}
                  onChange={e => setParams(p => ({ ...p, stability: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>Variable</span><span>Balanced</span><span>Stable</span>
                </div>
              </div>
              <div>
                <label className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Similarity</span>
                  <span className="text-amber-400 font-mono">{params.similarity.toFixed(2)}</span>
                </label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={params.similarity}
                  onChange={e => setParams(p => ({ ...p, similarity: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>Diverse</span><span>Balanced</span><span>Clone</span>
                </div>
              </div>
            </div>
          </div>

          {/* Waveform Preview Placeholder */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Audio Preview</h2>
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center gap-1 h-16 mb-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-amber-500/30 rounded-full"
                    style={{ height: `${Math.random() * 100}%`, minHeight: '4px' }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">เลือกสคริปต์แล้วกด Generate เพื่อ preview เสียง</p>
              <button className="mt-4 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition">
                🎙️ Generate Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Voice Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">เพิ่มเสียงใหม่</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="ชื่อเสียง (เช่น ผู้บรรยายหลัก)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <select
                value={newProvider}
                onChange={e => setNewProvider(e.target.value as VoiceProfile['provider'])}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <textarea
                placeholder="รายละเอียด (optional)"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm">ยกเลิก</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl transition text-sm">เพิ่ม</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
