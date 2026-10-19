import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  FileText,
  Link as LinkIcon,
  Plus,
  Loader2,
  Paperclip,
} from 'lucide-react';
import { Chapter, CoachMessage } from '../types';
import { speakText } from '../utils/speech';

interface CoachTabProps {
  chapter: Chapter;
  onAddSource: (label: string, text: string) => void;
}

export const CoachTab: React.FC<CoachTabProps> = ({ chapter, onAddSource }) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `Hello! I'm Sparky, your study buddy locked exclusively to **${chapter.title}**! 🎓\n\nI won't just dump answers on you — I'll ask questions and give clues so your brain makes the connection. What concept are you curious about right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickQuestions: [
        'Give me a simple everyday analogy for this',
        'Quiz me on the most important concept',
        'What is a common exam trick or trap here?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: CoachMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let aiSettings: any = {};
      try {
        const raw = localStorage.getItem('cms_ai_settings_v4');
        if (raw) aiSettings = JSON.parse(raw);
      } catch (e) {}

      const res = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle: chapter.title,
          subject: chapter.subject,
          grade: chapter.grade,
          message: text,
          history: messages.slice(-6),
          currentContext: chapter.text || chapter.map?.bigIdea || '',
          aiProvider: aiSettings.provider,
          deepseekApiKey: aiSettings.deepseekApiKey,
          deepseekModel: aiSettings.deepseekModel,
        }),
      });

      if (!res.ok) throw new Error('Coach failed to respond');
      const data = await res.json();

      const aiMsg: CoachMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.reply || `That's a thoughtful question about ${chapter.title}! What do you think happens next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickQuestions: data.quickQuestions || [
          'Can you give another example?',
          'Test me on another key point!',
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: `Remember: ${chapter.title} is all about connected cause-and-effect! Think about what core force drives the process. What do you recall about that?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickQuestions: ['Give me an analogy', 'Quiz me!'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!sourceUrl.trim() || isAddingSource) return;
    setIsAddingSource(true);
    try {
      const res = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });
      const data = await res.json();
      onAddSource(data.label || sourceUrl, data.text || `Reference URL: ${sourceUrl}`);
      setSourceUrl('');
      setShowAddSource(false);

      setMessages((prev) => [
        ...prev,
        {
          id: `src_${Date.now()}`,
          role: 'assistant',
          content: `✓ I've incorporated the new source "**${data.label || sourceUrl}**" into our study notes! Feel free to ask me anything about it.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e: any) {
      alert('Could not parse link content');
    } finally {
      setIsAddingSource(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col h-[75vh] min-h-[500px]">
      {/* Top Banner: Context Lock & Sources */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 mb-3 shadow-xs shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-700 font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-900 font-['Outfit']">
                Coach Sparky
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.2 rounded-full">
                Socratic Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Locked to: <strong className="text-slate-600">{chapter.title}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddSource(!showAddSource)}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
        >
          <Paperclip className="w-3.5 h-3.5 text-slate-500" />
          <span>Add Source</span>
        </button>
      </div>

      {/* Add Source Drawer (Collapsible) */}
      {showAddSource && (
        <div className="mb-3 p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs shrink-0 animate-fadeIn space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-teal-900 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" />
              Add a web article or YouTube link to chapter context:
            </span>
            <button
              onClick={() => setShowAddSource(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Paste article, Wikipedia, or YouTube video link..."
              className="flex-1 p-2 bg-white border border-teal-300 rounded-xl text-xs outline-none"
            />
            <button
              onClick={handleAddLink}
              disabled={isAddingSource || !sourceUrl.trim()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition disabled:opacity-40"
            >
              {isAddingSource ? 'Fetching...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Message Chat Container */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-3xl border border-slate-200/80 p-4 sm:p-5 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-medium">{m.content}</div>

                {/* Read Aloud button for assistant messages */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={() => speakText(m.content)}
                      className="flex items-center gap-1 text-slate-400 hover:text-teal-700 transition"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                    <span>{m.timestamp}</span>
                  </div>
                )}

                {/* Quick suggestion chips */}
                {m.quickQuestions && m.quickQuestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {m.quickQuestions.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-full transition cursor-pointer text-left"
                      >
                        ⚡ {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Sparky is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Row */}
      <div className="mt-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-slate-200/90 focus-within:border-teal-500 shadow-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or explain what you remember..."
            className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-transparent outline-none text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
