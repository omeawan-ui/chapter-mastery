import React from 'react';
import { Printer, X, Download, BookOpen, Lightbulb, CheckSquare } from 'lucide-react';
import { Chapter } from '../types';

interface PrintCheatSheetModalProps {
  chapter: Chapter;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintCheatSheetModal: React.FC<PrintCheatSheetModalProps> = ({
  chapter,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between no-print sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base font-['Outfit'] flex items-center gap-2">
              <Printer className="w-4 h-4 text-teal-600" />
              1-Page Revision Cheat Sheet
            </h3>
            <p className="text-xs text-slate-400">
              Print this sheet or save as PDF for quick morning revision or school desk review!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT AREA */}
        <div className="p-6 sm:p-10 text-slate-800 space-y-6 print:p-0 print:space-y-4">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700">
                Grade {chapter.grade} • {chapter.subject} • Chapter Revision Kit
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-['Outfit'] mt-1">
                {chapter.title}
              </h1>
            </div>

            <div className="text-right text-xs text-slate-500 shrink-0">
              <span className="font-bold text-slate-900 block">Chapter Mastery Pro</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Big Idea Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              The Big Idea to Remember:
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {chapter.map?.bigIdea || chapter.title}
            </p>
            {chapter.map?.bigIdeaAnalogy && (
              <p className="text-xs text-slate-600 italic">
                <strong>Analogy:</strong> {chapter.map.bigIdeaAnalogy}
              </p>
            )}
          </div>

          {/* Key Concepts Roadmap */}
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
              1. Core Topics & Essential Takeaways
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(chapter.map?.branches || []).map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5"
                >
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{b.branchEmoji || '📌'}</span>
                    <span>{b.branchName}</span>
                  </h3>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                    {(b.keyTakeaways || b.subPoints.slice(0, 2) || []).map((t, tIdx) => (
                      <li key={tIdx} className="leading-tight">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Key Vocabulary Grid */}
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
              2. Must-Know Curriculum Vocabulary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(chapter.keywords || []).slice(0, 8).map((k, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-extrabold">{k.word}</strong>
                    <span className="text-[10px] text-teal-700 font-semibold">{k.type}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{k.childMeaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Exam Questions & Model Answers */}
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
              3. Top Exam Questions & Answers
            </h2>
            <div className="space-y-3">
              {(chapter.questions || []).slice(0, 3).map((q, idx) => (
                <div key={idx} className="text-xs space-y-1">
                  <p className="font-extrabold text-slate-900">
                    Q{idx + 1}: {q.question} ({q.marks} marks)
                  </p>
                  <p className="text-slate-700 pl-3 border-l-2 border-teal-500 text-[11px] leading-relaxed">
                    <strong>Model Answer:</strong> {q.modelAnswer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Study with Chapter Mastery Kit Pro • Master topics with active recall and spaced repetition
          </div>
        </div>
      </div>
    </div>
  );
};
