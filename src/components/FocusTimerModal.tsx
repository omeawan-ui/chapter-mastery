import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Coffee,
} from 'lucide-react';
import { playChimeSound } from '../utils/audio';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: (newMinutes?: number) => void;
  mode: 'focus' | 'break';
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onReset,
  mode,
}) => {
  const [ambientSound, setAmbientSound] = useState<boolean>(false);

  if (!isOpen) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const presets = [
    { label: '25m Focus', minutes: 25 },
    { label: '15m Sprint', minutes: 15 },
    { label: '5m Break', minutes: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm font-['Outfit']">
              Focus Pomodoro Timer
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tag */}
        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              mode === 'focus'
                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {mode === 'focus' ? <Sparkles className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
            <span>{mode === 'focus' ? 'Deep Study Sprint' : 'Brain Recharge Break'}</span>
          </span>
        </div>

        {/* Big Digital Clock Display */}
        <div className="py-2">
          <div className="text-5xl sm:text-6xl font-extrabold text-slate-900 font-mono tracking-tight">
            {formattedTime}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isRunning ? 'Timer is running — stay in the flow! 🚀' : 'Press play to start focusing'}
          </p>
        </div>

        {/* Preset Sprints */}
        <div className="flex justify-center gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onReset(p.minutes)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onReset()}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={isRunning ? onPause : onStart}
            className={`py-3.5 px-8 rounded-2xl font-extrabold text-sm transition flex items-center gap-2 shadow-lg cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Start Sprint</span>
              </>
            )}
          </button>
        </div>

        {/* Keep window open or minimize tip */}
        <p className="text-[11px] text-slate-400">
          The timer keeps running in the header bar if you close this modal!
        </p>
      </div>
    </div>
  );
};
