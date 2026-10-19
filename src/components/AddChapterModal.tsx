import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Upload,
  Link as LinkIcon,
  BookOpen,
  Calendar,
  Layers,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Chapter, SourceItem } from '../types';

interface AddChapterModalProps {
  isOpen: boolean;
  editingChapter?: Chapter | null;
  onClose: () => void;
  onGenerate: (data: {
    title: string;
    subject: string;
    grade: number;
    examDate?: string;
    text: string;
    depthMode: 'in-depth' | 'on-the-go';
    sources: SourceItem[];
  }) => Promise<void>;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  editingChapter,
  onClose,
  onGenerate,
}) => {
  const [title, setTitle] = useState(editingChapter?.title || '');
  const [subject, setSubject] = useState(editingChapter?.subject || 'Science');
  const [grade, setGrade] = useState<number>(editingChapter?.grade || 6);
  const [examDate, setExamDate] = useState(editingChapter?.examDate || '');
  const [text, setText] = useState(editingChapter?.text || '');
  const [depthMode, setDepthMode] = useState<'in-depth' | 'on-the-go'>('in-depth');
  const [sources, setSources] = useState<SourceItem[]>(editingChapter?.sources || []);

  const [inputUrl, setInputUrl] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('Initiating Engine...');

  if (!isOpen) return null;

  const quickStartTopics = [
    { title: 'Photosynthesis & Plant Cells', subject: 'Biology', grade: 7 },
    { title: 'Gravity, Friction & Forces of Motion', subject: 'Physics', grade: 6 },
    { title: 'The Human Digestive System', subject: 'Science', grade: 6 },
    { title: 'Ancient Egyptian Pyramids & Nile', subject: 'Social Studies', grade: 6 },
  ];

  const handlePickQuickTopic = (t: { title: string; subject: string; grade: number }) => {
    setTitle(t.title);
    setSubject(t.subject);
    setGrade(t.grade);
    setText(
      `Chapter overview for ${t.title}. This chapter covers key concepts, core scientific mechanisms, functions, and standard curriculum syllabus for Grade ${t.grade} ${t.subject}.`
    );
  };

  const handleAddUrl = async () => {
    if (!inputUrl.trim() || isParsingUrl) return;
    setIsParsingUrl(true);
    try {
      const res = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });
      const data = await res.json();
      const newSource: SourceItem = {
        id: `s_${Date.now()}`,
        label: data.label || inputUrl,
        type: 'link',
        text: data.text,
        url: inputUrl,
      };
      setSources((prev) => [...prev, newSource]);
      if (data.text) {
        setText((prev) => (prev ? `${prev}\n\n${data.text}` : data.text));
      }
      setInputUrl('');
    } catch (e) {
      alert('Could not fetch link text. You can still paste notes directly.');
    } finally {
      setIsParsingUrl(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const content = await file.text();
      const newSource: SourceItem = {
        id: `s_${Date.now()}`,
        label: file.name,
        type: 'text',
        text: content,
      };
      setSources((prev) => [...prev, newSource]);
      setText((prev) => (prev ? `${prev}\n\n${content}` : content));
    } else {
      // For PDF or other files
      const newSource: SourceItem = {
        id: `s_${Date.now()}`,
        label: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        text: `Uploaded file reference: ${file.name}`,
      };
      setSources((prev) => [...prev, newSource]);
      setText((prev) => (prev ? `${prev}\n\n${file.name}` : file.name));
    }
  };

  const handleRemoveSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a chapter title.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Building Advance Organizer Mind Map...');

    try {
      setTimeout(() => setGenerationStep('Harvesting Vocabulary & Memory Hooks...'), 1500);
      setTimeout(() => setGenerationStep('Crafting Active Recall Questions & Rubrics...'), 3000);
      setTimeout(() => setGenerationStep('Generating Multi-Format Quiz Arena...'), 4500);

      await onGenerate({
        title: title.trim(),
        subject: subject.trim() || 'General',
        grade: Number(grade) || 6,
        examDate: examDate || undefined,
        text: text.trim(),
        depthMode,
        sources,
      });

      onClose();
    } catch (err: any) {
      alert(`Error generating study kit: ${err.message || 'Please check your connection'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-['Outfit']">
                {editingChapter ? 'Edit Chapter & Sources' : 'Build New Chapter Mastery Kit'}
              </h3>
              <p className="text-xs text-slate-400">
                Transforms textbook text, notes, or topics into a complete multi-modal learning system.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Quick-Pick Topics (If creating new) */}
          {!editingChapter && (
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                ⚡ Quick Start with Curriculum Favorites:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickStartTopics.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickQuickTopic(item)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200/80 transition cursor-pointer text-slate-700"
                  >
                    {item.title} ({item.subject})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Chapter Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Solar System, Cellular Respiration..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-semibold text-slate-800"
              >
                {[5, 6, 7, 8, 9, 10].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject & Exam Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science, Biology, Social Studies"
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Exam Date (Optional)
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Kit Depth Toggle */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Study Kit Depth Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDepthMode('in-depth')}
                className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                  depthMode === 'in-depth'
                    ? 'border-teal-500 bg-teal-50/50 text-teal-950'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                  <span>🔬 In-Depth Mastery</span>
                  {depthMode === 'in-depth' && <CheckCircle2 className="w-4 h-4 text-teal-600 ml-auto" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  8–12 concept cards, 12+ keywords, 6 active recall questions, full quiz.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDepthMode('on-the-go')}
                className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                  depthMode === 'on-the-go'
                    ? 'border-teal-500 bg-teal-50/50 text-teal-950'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                  <span>🏃 On-the-Go High-Yield</span>
                  {depthMode === 'on-the-go' && <CheckCircle2 className="w-4 h-4 text-teal-600 ml-auto" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  4–5 focus cards, 8 core vocabulary terms, quick 5-question quiz.
                </p>
              </button>
            </div>
          </div>

          {/* Source Material & Ingestion */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Chapter Notes or Source Text
              </label>
              <span className="text-[11px] text-slate-400">
                Paste notes, upload a file, or add a web link
              </span>
            </div>

            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste textbook paragraph, lecture notes, or key topic outline here..."
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none leading-relaxed text-slate-800"
            />

            {/* Quick Ingestion Actions (File, URL) */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File (PDF / Text)</span>
                <input
                  type="file"
                  accept=".txt,.pdf,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-1 flex-1 min-w-[240px]">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste URL link..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={isParsingUrl || !inputUrl.trim()}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition disabled:opacity-40"
                >
                  {isParsingUrl ? 'Loading...' : 'Add Link'}
                </button>
              </div>
            </div>

            {/* Attached Sources List */}
            {sources.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {sources.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full"
                  >
                    <span>{s.label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(s.id)}
                      className="text-teal-600 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 flex items-center justify-between gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating || !title.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{generationStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{editingChapter ? 'Regenerate Study Kit' : 'Generate Study Kit'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
