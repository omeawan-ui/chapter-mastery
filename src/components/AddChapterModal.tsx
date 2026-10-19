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
  ChevronDown,
  ChevronUp,
  Sliders,
  Youtube,
  GraduationCap,
} from 'lucide-react';
import { Chapter, DifficultyLevel, SourceItem } from '../types';

interface AddChapterModalProps {
  isOpen: boolean;
  editingChapter?: Chapter | null;
  onClose: () => void;
  onGenerate: (data: {
    title: string;
    subject: string;
    grade: number;
    difficultyLevel: DifficultyLevel;
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
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(
    editingChapter?.difficultyLevel || 'standard'
  );
  const [examDate, setExamDate] = useState(editingChapter?.examDate || '');
  const [text, setText] = useState(editingChapter?.text || '');
  const [depthMode, setDepthMode] = useState<'in-depth' | 'on-the-go'>('in-depth');
  const [sources, setSources] = useState<SourceItem[]>(editingChapter?.sources || []);

  // Toggle for optional custom text / attachments
  const [isOptionalUploadsOpen, setIsOptionalUploadsOpen] = useState(
    Boolean(editingChapter?.sources?.length || (editingChapter?.text && editingChapter.text.length > 100))
  );

  const [inputUrl, setInputUrl] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('Initiating Engine...');

  if (!isOpen) return null;

  // Preset quick subjects
  const quickSubjects = [
    { name: 'Science', emoji: '🔬' },
    { name: 'Biology', emoji: '🧬' },
    { name: 'Physics', emoji: '⚡' },
    { name: 'Chemistry', emoji: '🧪' },
    { name: 'Social Studies', emoji: '🏛️' },
    { name: 'History', emoji: '📜' },
    { name: 'Mathematics', emoji: '📐' },
    { name: 'English', emoji: '📚' },
    { name: 'Geography', emoji: '🌍' },
  ];

  // Subject-sensitive curriculum topic suggestions
  const topicSuggestionsBySubject: Record<string, string[]> = {
    Science: [
      'The Water Cycle & Weather Systems',
      'The Human Digestive System',
      'Ecosystems & Food Webs',
      'States of Matter & Phase Changes',
    ],
    Biology: [
      'Photosynthesis & Plant Cell Structure',
      'Cellular Respiration & Energy',
      'Genetics, DNA & Heredity Traits',
      'The Nervous & Endocrine Systems',
    ],
    Physics: [
      "Gravity, Friction & Newton's Laws of Motion",
      'Light Reflection, Refraction & Lenses',
      'Electric Circuits, Voltage & Resistance',
      'Sound Waves & Acoustic Frequency',
    ],
    Chemistry: [
      'Atoms, Molecules & The Periodic Table',
      'Acids, Bases & The pH Scale',
      'Chemical Reactions, Bonding & Conservation of Mass',
      'Metals, Non-metals & Reactivity Series',
    ],
    'Social Studies': [
      'Ancient Egyptian Pyramids & The Nile',
      'Democracy & Ancient Greek City-States',
      'The Indus Valley Civilization',
      'Branches of Government & Citizenship',
    ],
    History: [
      'The American Revolution & Declaration of Independence',
      'The Industrial Revolution & Steam Power',
      'The French Revolution & Human Rights',
      'World War I & Trench Warfare',
    ],
    Mathematics: [
      'Fractions, Decimals & Percentages Mastery',
      'Geometry: Angles, Triangles & Polygons',
      'Linear Equations & Algebraic Expressions',
      'Ratio, Proportion & Unit Rates',
    ],
    English: [
      'Figurative Language: Metaphors & Similes',
      'Narrative Arc & Story Elements',
      'Persuasive Writing & Rhetorical Appeals',
      'Active vs Passive Voice & Verb Tenses',
    ],
    Geography: [
      'Plate Tectonics, Earthquakes & Volcanoes',
      'World Climate Zones & Biomes',
      'Latitude, Longitude & Map Projections',
      'Global Ocean Currents & Wind Patterns',
    ],
  };

  const currentSuggestions =
    topicSuggestionsBySubject[subject] || topicSuggestionsBySubject['Science'];

  const handlePickTopic = (topicName: string) => {
    setTitle(topicName);
  };

  const handleSelectSubject = (sName: string) => {
    setSubject(sName);
    // If current title is empty or from previous suggestions, pick first topic of new subject
    if (!title) {
      const newSugg = topicSuggestionsBySubject[sName] || topicSuggestionsBySubject['Science'];
      if (newSugg?.[0]) setTitle(newSugg[0]);
    }
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
      alert('Please enter or select a chapter/topic title.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(`Researching Grade ${grade} ${subject} syllabus...`);

    try {
      setTimeout(() => setGenerationStep('Designing Advance Organizer Map & Visual Diagrams...'), 1200);
      setTimeout(() => setGenerationStep('Curating educational YouTube video guides...'), 2400);
      setTimeout(() => setGenerationStep('Harvesting Vocabulary Flashcards & Memory Hooks...'), 3600);
      setTimeout(() => setGenerationStep('Crafting Active Recall Questions & Quiz Arena...'), 4800);

      await onGenerate({
        title: title.trim(),
        subject: subject.trim() || 'General',
        grade: Number(grade) || 6,
        difficultyLevel,
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
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-100">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-['Outfit']">
                {editingChapter ? 'Edit Chapter Kit' : 'Build New Chapter Mastery Kit'}
              </h3>
              <p className="text-xs text-slate-500">
                AI auto-curates complete visual maps, YouTube lessons, diagrams, flashcards & quizzes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Frictionless Setup Banner */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/70 via-sky-50/40 to-white p-3.5 sm:p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500 text-white shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-extrabold text-teal-950 font-['Outfit'] text-sm">
                Instant Auto-Populate Enabled
              </p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                <strong>No upload required!</strong> Simply choose subject, grade, and topic. Our engine will automatically research curriculum standards, generate interactive advance maps with diagrams, curate educational YouTube videos, and build active recall quizzes.
              </p>
            </div>
          </div>

          {/* Quick Subject Chips */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Select Subject
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickSubjects.map((s) => {
                const isSelected = subject.toLowerCase() === s.name.toLowerCase();
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleSelectSubject(s.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                Chapter / Topic Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cellular Respiration, Newton's Laws, The French Revolution..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                Student Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-semibold text-slate-800 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Suggestions */}
          <div>
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              ⚡ Popular {subject} Syllabus Topics:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickTopic(item)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    title === item
                      ? 'bg-teal-50 text-teal-900 border-teal-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level Adjuster (Easy -> Hard) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-600" />
                <span>Adjust Difficulty / Mastery Level</span>
              </label>
              <span className="text-[11px] font-bold text-teal-700 capitalize">
                {difficultyLevel} Level
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Easy / Foundational */}
              <button
                type="button"
                onClick={() => setDifficultyLevel('easy')}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  difficultyLevel === 'easy'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                    <span>🌱 Foundational (Easy)</span>
                    {difficultyLevel === 'easy' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Gentle pace, bite-sized vocabulary, everyday intuitive analogies. Ideal for beginners.
                  </p>
                </div>
              </button>

              {/* Standard / Grade-Level */}
              <button
                type="button"
                onClick={() => setDifficultyLevel('standard')}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  difficultyLevel === 'standard'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                    <span>⚖️ Standard (Curriculum)</span>
                    {difficultyLevel === 'standard' && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 ml-auto shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Comprehensive school syllabus, standard terminology, multi-mark exam questions.
                  </p>
                </div>
              </button>

              {/* Hard / Advanced */}
              <button
                type="button"
                onClick={() => setDifficultyLevel('hard')}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  difficultyLevel === 'hard'
                    ? 'border-indigo-500 bg-indigo-50/60 text-indigo-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                    <span>🚀 Advanced (Challenge)</span>
                    {difficultyLevel === 'hard' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Deeper scientific mechanisms, advanced vocabulary, high-order reasoning questions.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Depth Mode & Exam Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                Study Kit Scope
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDepthMode('in-depth')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    depthMode === 'in-depth'
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-extrabold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold'
                  }`}
                >
                  <div className="text-xs">🔬 In-Depth</div>
                  <div className="text-[10px] text-slate-400">8-12 cards + full quiz</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDepthMode('on-the-go')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    depthMode === 'on-the-go'
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-extrabold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold'
                  }`}
                >
                  <div className="text-xs">🏃 On-The-Go</div>
                  <div className="text-[10px] text-slate-400">4-5 cards + quick quiz</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                Exam Date (Optional)
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Optional Attachments / Notes Section (Collapsible) */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIsOptionalUploadsOpen((prev) => !prev)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-extrabold text-slate-800">
                  Optional: Attach Specific Notes, PDF, or Link
                </span>
                {sources.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                    {sources.length} attached
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                <span>{isOptionalUploadsOpen ? 'Hide' : 'Add text/PDF'}</span>
                {isOptionalUploadsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {isOptionalUploadsOpen && (
              <div className="p-4 space-y-3 bg-white border-t border-slate-200/80">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Have a specific teacher handout, textbook chapter PDF, or website? Paste notes or upload them here. If left blank, the AI generates high-grade curriculum knowledge automatically!
                </p>

                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste textbook paragraph or class notes (optional)..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none leading-relaxed text-slate-800"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File (PDF / Text)</span>
                    <input
                      type="file"
                      accept=".txt,.pdf,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-1 flex-1 min-w-[220px]">
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="Paste article URL link..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      disabled={isParsingUrl || !inputUrl.trim()}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition disabled:opacity-40 cursor-pointer"
                    >
                      {isParsingUrl ? 'Loading...' : 'Add Link'}
                    </button>
                  </div>
                </div>

                {sources.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {sources.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full"
                      >
                        <span>{s.label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(s.id)}
                          className="text-teal-600 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between gap-3 sticky bottom-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating || !title.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{generationStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{editingChapter ? 'Regenerate Study Kit' : 'Generate Complete Study Kit ✨'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
