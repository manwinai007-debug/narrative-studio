'use client';

import { useState, useRef, useEffect } from 'react';
import { useData } from '@/lib/DataContext';
import { convertNumbersInText, scriptTemplates } from '@/lib/db';
import type { Script } from '@/lib/db';

function EmotionTag({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  const colors: Record<string, string> = {
    calm: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    excited: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    sad: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    angry: 'bg-red-500/20 text-red-300 border-red-500/30',
    mysterious: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    happy: 'bg-green-500/20 text-green-300 border-green-500/30',
    serious: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    wonder: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    friendly: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    narrator: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border ${colors[tag] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
      {tag}
      <button onClick={onRemove} className="hover:opacity-70 ml-0.5">×</button>
    </span>
  );
}

export default function ScriptEditor({ page }: { page: string }) {
  if (page !== 'scripts') return null;
  const { activeProject, scripts, createScript, updateScript, deleteScript } = useData();
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [content, setContent] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [wpm, setWpm] = useState(150);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selectedScript) {
      setContent(selectedScript.content);
    }
  }, [selectedScript]);

  if (!activeProject) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg">กรุณาเลือกโปรเจกต์ก่อน</p>
          <p className="text-sm mt-1">เลือกจาก dropdown ด้านบนซ้าย</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!selectedScript) return;
    const words = content.split(/\s+/).filter(Boolean).length;
    await updateScript(selectedScript.id, {
      content,
      wordCount: words,
      estimatedDuration: (words / wpm) * 60,
    });
  };

  const handleCreate = async (templateContent?: string) => {
    const title = newTitle.trim() || 'Untitled Script';
    const initialContent = templateContent || '';
    const words = initialContent.split(/\s+/).filter(Boolean).length;
    const script = await createScript({
      projectId: activeProject.id,
      title,
      content: initialContent,
      wordCount: words,
      estimatedDuration: (words / wpm) * 60,
    });
    setSelectedScript(script);
    setContent(initialContent);
    setShowNew(false);
    setNewTitle('');
  };

  const handleThaiConvert = () => {
    const converted = convertNumbersInText(content);
    setContent(converted);
    setShowConvertConfirm(false);
  };

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.slice(0, start) + tag + content.slice(end);
    setContent(newText);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
      textarea.focus();
    }, 0);
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.ceil((wordCount / wpm) * 60);
  const minutes = Math.floor(estimatedDuration / 60);
  const seconds = estimatedDuration % 60;

  // Count special tags
  const emotionCount = (content.match(/\[EMOTION:\s*\w+\]/gi) || []).length;
  const pauseCount = (content.match(/\[PAUSE:\s*[\d.]+s?\]/gi) || []).length;

  return (
    <div className="h-full flex">
      {/* Script List */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">สคริปต์</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-2.5 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                title="Templates"
              >
                📋
              </button>
              <button
                onClick={() => setShowNew(true)}
                className="px-2.5 py-1.5 text-xs bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                ใหม่
              </button>
            </div>
          </div>
          {showTemplates && (
            <div className="space-y-1 mb-3">
              <p className="text-xs text-gray-500 mb-1">Templates:</p>
              {Object.entries(scriptTemplates).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => handleCreate(tpl)}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-gray-200 transition capitalize"
                >
                  {key === 'storytelling' ? '📖 เรื่องเล่า' : key === 'podcast' ? '🎙️ พ็อดแคสต์' : '🎬 สารคดี'}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {scripts.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-8">ยังไม่มีสคริปต์</p>
          ) : (
            scripts.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedScript(s)}
                className={`w-full text-left p-3 rounded-xl text-sm transition ${
                  selectedScript?.id === s.id
                    ? 'bg-amber-500/10 border border-amber-500/20 text-white'
                    : 'text-gray-400 hover:bg-gray-800 border border-transparent'
                }`}
              >
                <p className="font-medium truncate">{s.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{s.wordCount} คำ · {Math.ceil(s.estimatedDuration / 60)} นาที</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedScript ? (
          <>
            {/* Toolbar */}
            <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white mr-2">{selectedScript.title}</span>

              <div className="h-5 w-px bg-gray-700 mx-1" />

              {/* Emotion Tags */}
              <span className="text-xs text-gray-500 mr-1">Emotion:</span>
              {['calm', 'excited', 'sad', 'happy', 'angry', 'mysterious', 'serious', 'wonder', 'friendly'].map(em => (
                <button
                  key={em}
                  onClick={() => insertTag(`[EMOTION: ${em}] `)}
                  className="px-2 py-1 text-[10px] bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-gray-200 transition"
                >
                  {em}
                </button>
              ))}

              <div className="h-5 w-px bg-gray-700 mx-1" />

              {/* Pause & WPM */}
              <button onClick={() => insertTag('[PAUSE: 1s] ')} className="px-2 py-1 text-[10px] bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-gray-200 transition">
                ⏸ Pause
              </button>
              <button onClick={() => insertTag('[NARRATOR]\n')} className="px-2 py-1 text-[10px] bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-gray-200 transition">
                🎙 Narrator
              </button>

              <div className="flex items-center gap-1 ml-2">
                <span className="text-[10px] text-gray-500">WPM:</span>
                <input
                  type="number"
                  value={wpm}
                  onChange={e => setWpm(Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 text-center"
                  min={60}
                  max={300}
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setShowConvertConfirm(true)}
                  className="px-3 py-1.5 text-xs bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition"
                >
                  🔢 แปลงเลข→ไทย
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition"
                >
                  💾 บันทึก
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 p-6 bg-gray-950 text-gray-200 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                placeholder="เริ่มเขียนสคริปต์ที่นี่..."
                spellCheck={false}
              />
            </div>

            {/* Status Bar */}
            <div className="border-t border-gray-800 px-6 py-2 flex items-center gap-6 text-xs text-gray-500">
              <span>{wordCount} คำ</span>
              <span>~{minutes}:{seconds.toString().padStart(2, '0')}</span>
              <span>{emotionCount} emotion tags</span>
              <span>{pauseCount} pauses</span>
              <span className="ml-auto">{wpm} WPM</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">📝 เลือกสคริปต์หรือสร้างใหม่</p>
              <p className="text-sm">สคริปต์จะปรากฏทางซ้ายมือ</p>
            </div>
          </div>
        )}
      </div>

      {/* New Script Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">สร้างสคริปต์ใหม่</h2>
            <input
              type="text"
              placeholder="ชื่อสคริปต์"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm">ยกเลิก</button>
              <button onClick={() => handleCreate()} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl transition text-sm">สร้าง</button>
            </div>
          </div>
        </div>
      )}

      {/* Thai Convert Confirm */}
      {showConvertConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowConvertConfirm(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-2">แปลงเลขเป็นภาษาไทย</h2>
            <p className="text-sm text-gray-400 mb-4">ตัวอย่าง: 47 → สี่สิบเจ็ด, 2024 → สองพันยี่สิบสี่</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConvertConfirm(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm">ยกเลิก</button>
              <button onClick={handleThaiConvert} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl transition text-sm">แปลง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
