import React, { useState } from 'react';
import { VideoRecommendation } from '../types';
import { Play, ExternalLink, X, Film, Clock, Sparkles } from 'lucide-react';

interface VideoGuideCardProps {
  video: VideoRecommendation;
}

export const VideoGuideCard: React.FC<VideoGuideCardProps> = ({ video }) => {
  const [isPlayingModalOpen, setIsPlayingModalOpen] = useState(false);

  // Extract clean video ID if available
  const extractId = (url: string, id?: string): string => {
    if (id && id.length === 11) return id;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/);
    return match ? match[1] : '';
  };

  const youtubeId = extractId(video.youtubeUrl || '', video.youtubeId);
  const targetUrl = video.youtubeUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : '');

  return (
    <>
      <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-50/60 via-amber-50/30 to-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full border border-rose-200">
                Recommended Video Guide
              </span>
              {video.channel && (
                <span className="text-[11px] font-semibold text-slate-500">
                  by {video.channel}
                </span>
              )}
              {video.duration && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {video.duration}
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Outfit']">
              {video.title}
            </h4>

            {video.whyWatch && (
              <p className="text-[11px] text-slate-600 mt-1 font-medium leading-relaxed">
                <span className="font-bold text-rose-900">Why watch:</span> {video.whyWatch}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {youtubeId ? (
            <button
              type="button"
              onClick={() => setIsPlayingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Video</span>
            </button>
          ) : targetUrl ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Watch on YouTube</span>
            </a>
          ) : null}
        </div>
      </div>

      {/* Embedded Video Modal */}
      {isPlayingModalOpen && youtubeId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col border border-slate-800">
            {/* Modal Top Bar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-500" />
                <span className="font-extrabold text-xs sm:text-sm truncate max-w-md font-['Outfit']">
                  {video.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {targetUrl && (
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition text-xs flex items-center gap-1"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setIsPlayingModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Caption */}
            <div className="p-3.5 bg-slate-950 text-slate-300 text-xs text-center border-t border-slate-800">
              {video.whyWatch || 'Watch this visual animation to anchor your understanding of the chapter.'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
