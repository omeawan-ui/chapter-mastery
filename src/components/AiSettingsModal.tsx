import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  Loader2,
  Zap,
} from 'lucide-react';

export interface AiSettings {
  provider: 'gemini' | 'deepseek';
  deepseekApiKey: string;
  deepseekModel: 'deepseek-chat' | 'deepseek-reasoner';
}

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AiSettings;
  onSaveSettings: (newSettings: AiSettings) => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [provider, setProvider] = useState<'gemini' | 'deepseek'>(settings.provider || 'gemini');
  const [deepseekApiKey, setDeepseekApiKey] = useState(settings.deepseekApiKey || '');
  const [deepseekModel, setDeepseekModel] = useState<'deepseek-chat' | 'deepseek-reasoner'>(
    settings.deepseekModel || 'deepseek-chat'
  );
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!deepseekApiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a DeepSeek API key (sk-...)' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // 1. Try server proxy route
      let verified = false;
      let errorMsg = '';

      try {
        const res = await fetch('/api/test-deepseek', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: deepseekApiKey.trim(),
            model: deepseekModel,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) verified = true;
        } else {
          const err = await res.json().catch(() => ({}));
          errorMsg = err.error || '';
        }
      } catch (err) {
        // Backend not running (e.g. static host on Vercel)
      }

      // 2. If backend didn't verify, test directly from browser via CORS
      if (!verified) {
        const directRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: deepseekModel || 'deepseek-chat',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say "connected"' }],
          }),
        });

        if (directRes.ok) {
          verified = true;
        } else {
          const dErr = await directRes.json().catch(() => ({}));
          errorMsg = dErr.error?.message || `HTTP ${directRes.status}`;
        }
      }

      if (verified) {
        setTestResult({
          success: true,
          message: '✓ Successfully connected to DeepSeek API!',
        });
      } else {
        setTestResult({
          success: false,
          message: errorMsg || 'Connection failed. Please check your API key.',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Network error connecting to DeepSeek API.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      provider,
      deepseekApiKey: deepseekApiKey.trim(),
      deepseekModel,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-['Outfit']">
                AI Engine & API Key Settings
              </h3>
              <p className="text-xs text-slate-400">
                Choose between built-in Gemini or custom DeepSeek models.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Selector Cards */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Select Active AI Provider:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Google Gemini Card */}
            <button
              type="button"
              onClick={() => setProvider('gemini')}
              className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer ${
                provider === 'gemini'
                  ? 'border-teal-500 bg-teal-50/50 text-teal-950 ring-2 ring-teal-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-teal-600 fill-teal-600" />
                  Google Gemini
                </span>
                {provider === 'gemini' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Built-in server AI engine. Automatic, ultra-fast generation with zero setup required.
              </p>
            </button>

            {/* DeepSeek Card */}
            <button
              type="button"
              onClick={() => setProvider('deepseek')}
              className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer ${
                provider === 'deepseek'
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  DeepSeek API
                </span>
                {provider === 'deepseek' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Use your custom DeepSeek API key for DeepSeek-V3 or R1 Reasoner models.
              </p>
            </button>
          </div>
        </div>

        {/* DeepSeek Configuration Form */}
        {provider === 'deepseek' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-4 animate-fadeIn">
            {/* API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  DeepSeek API Key
                </label>
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={deepseekApiKey}
                  onChange={(e) => {
                    setDeepseekApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="sk-..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs sm:text-sm font-mono text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-indigo-800 mt-1 font-medium">
                Key is saved in your local browser storage and communicated securely via server proxy.
              </p>
            </div>

            {/* Model Select */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-950 mb-1">
                DeepSeek Model
              </label>
              <select
                value={deepseekModel}
                onChange={(e) =>
                  setDeepseekModel(e.target.value as 'deepseek-chat' | 'deepseek-reasoner')
                }
                className="w-full p-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="deepseek-chat">deepseek-chat (DeepSeek V3 — Fast, Economical)</option>
                <option value="deepseek-reasoner">deepseek-reasoner (DeepSeek R1 — Deep Reasoning)</option>
              </select>
            </div>

            {/* Test Connection Button */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !deepseekApiKey.trim()}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test DeepSeek Connection</span>
                  </>
                )}
              </button>

              {testResult && (
                <div
                  className={`text-xs font-bold flex items-center gap-1 ${
                    testResult.success ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="line-clamp-1">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-sm cursor-pointer"
          >
            Save AI Settings
          </button>
        </div>
      </div>
    </div>
  );
};
