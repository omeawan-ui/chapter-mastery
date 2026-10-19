import React, { useState } from 'react';
import { MapDiagram } from '../types';
import { Sparkles, ArrowRight, RotateCw, Layers, CheckCircle2 } from 'lucide-react';

interface DiagramViewerProps {
  diagram: MapDiagram;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ diagram }) => {
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);
  const steps = diagram.steps || [];
  const currentStep = steps[selectedStepIdx] || steps[0];

  if (!steps.length) return null;

  return (
    <div className="rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-teal-50/50 via-white to-slate-50 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-teal-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
            {diagram.type === 'cycle' ? (
              <RotateCw className="w-4 h-4 animate-spin-slow" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Outfit']">
              {diagram.title || 'Visual Mechanism Diagram'}
            </h4>
            <p className="text-[11px] text-slate-500">{diagram.caption}</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
          {diagram.type === 'cycle' ? 'Cyclical Flow' : 'Step-by-Step Flow'}
        </span>
      </div>

      {/* Interactive Step Navigator Nodes */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
        {steps.map((step, idx) => {
          const isSelected = idx === selectedStepIdx;
          return (
            <React.Fragment key={idx}>
              <button
                type="button"
                onClick={() => setSelectedStepIdx(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-teal-500/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50/50'
                }`}
              >
                <span className="text-base">{step.emoji || `${idx + 1}`}</span>
                <span>{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              {diagram.type === 'cycle' && idx === steps.length - 1 && (
                <RotateCw className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Focused Step Detail Card */}
      {currentStep && (
        <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-xs flex items-start gap-3.5 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 flex items-center justify-center text-lg font-bold shrink-0">
            {currentStep.emoji || (selectedStepIdx + 1)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Outfit']">
                Step {selectedStepIdx + 1}: {currentStep.label}
              </span>
              <span className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Step details
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
              {currentStep.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
