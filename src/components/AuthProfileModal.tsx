import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Phone,
  Sparkles,
  CheckCircle2,
  LogIn,
  UserPlus,
  Users,
  ShieldCheck,
  Download,
  Upload,
  BookOpen,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: StudentProfile[];
  activeProfile: StudentProfile | null;
  onSignUp: (profile: Omit<StudentProfile, 'id' | 'createdAt' | 'lastLoginAt'>) => void;
  onLogin: (phoneNumber: string) => boolean;
  onSwitchProfile: (profileId: string) => void;
  onDeleteProfile?: (profileId: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalKitsForActiveProfile: number;
}

const AVATAR_OPTIONS = ['🚀', '🦊', '🔬', '⚡', '🦁', '🌟', '🦄', '🎯', '🦖', '🎨', '🧠', '🌿'];

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfile,
  onSignUp,
  onLogin,
  onSwitchProfile,
  onDeleteProfile,
  onExportData,
  onImportData,
  totalKitsForActiveProfile,
}) => {
  // Tabs: 'active' (view current profile/switch), 'signup' (create new), 'login' (login with phone)
  const [tab, setTab] = useState<'active' | 'signup' | 'login'>(() => {
    return activeProfile ? 'active' : profiles.length > 0 ? 'login' : 'signup';
  });

  // Sign up fields
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(6);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🚀');

  // Login field
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!phoneNumber.trim()) return;

    onSignUp({
      name: name.trim(),
      grade,
      phoneNumber: phoneNumber.trim(),
      avatarEmoji,
    });

    setSignupSuccess(true);
    setTimeout(() => {
      setSignupSuccess(false);
      onClose();
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginPhone.trim()) {
      setLoginError('Please enter your phone number.');
      return;
    }

    const success = onLogin(loginPhone.trim());
    if (success) {
      onClose();
    } else {
      setLoginError('No student profile found with this phone number. Please sign up or check digits.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
              Student Accounts & Permanent Library
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
            {activeProfile ? `Hi, ${activeProfile.name}! 👋` : 'Student Sign-Up & Login'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign up with your Name, Grade, and Phone Number (used as your password). Your study kits stay permanent!
          </p>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-slate-800/80 border border-slate-700/80">
            {activeProfile && (
              <button
                type="button"
                onClick={() => {
                  setTab('active');
                  setLoginError('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  tab === 'active'
                    ? 'bg-teal-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{activeProfile.avatarEmoji || '🎓'}</span>
                <span>My Profile</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setLoginError('');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                tab === 'signup'
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{profiles.length > 0 ? '+ New Student' : 'Sign Up'}</span>
            </button>

            {profiles.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setLoginError('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  tab === 'login'
                    ? 'bg-teal-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* ----------------------------------------------------------- */}
          {/* TAB 1: ACTIVE PROFILE & SWITCHER */}
          {/* ----------------------------------------------------------- */}
          {tab === 'active' && activeProfile && (
            <div className="space-y-4">
              {/* Active Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 border border-teal-200 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-teal-100 border-2 border-teal-300 flex items-center justify-center text-2xl shadow-xs">
                    {activeProfile.avatarEmoji || '🎓'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                        {activeProfile.name}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Class / Grade <strong>{activeProfile.grade}</strong> • Phone: <span className="font-mono font-bold text-slate-700">{activeProfile.phoneNumber}</span>
                    </p>
                    <p className="text-[11px] text-teal-700 font-semibold mt-1">
                      📚 {totalKitsForActiveProfile} permanent study kit{totalKitsForActiveProfile === 1 ? '' : 's'} saved
                    </p>
                  </div>
                </div>
              </div>

              {/* Profiles Switcher if multiple students */}
              {profiles.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Switch Student Profile:
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {profiles.map((p) => {
                      const isCurrent = p.id === activeProfile.id;
                      return (
                        <div
                          key={p.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                            isCurrent
                              ? 'bg-teal-50 border-teal-300'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{p.avatarEmoji || '🎓'}</span>
                            <div>
                              <div className="font-bold text-xs text-slate-900">{p.name}</div>
                              <div className="text-[10px] text-slate-500">
                                Grade {p.grade} • Phone: {p.phoneNumber}
                              </div>
                            </div>
                          </div>

                          {!isCurrent ? (
                            <button
                              type="button"
                              onClick={() => {
                                onSwitchProfile(p.id);
                                onClose();
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition cursor-pointer"
                            >
                              Select
                            </button>
                          ) : (
                            <span className="text-xs font-extrabold text-teal-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Permanent Storage & Backup Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">
                      Permanent Data & Device Storage
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      All your study kits, analogies, quizzes, and retrieval answers remain permanently stored on this device under your profile phone number.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onExportData}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Backup Library</span>
                  </button>

                  <label className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    <span>Restore Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={onImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 2: SIGN UP NEW STUDENT */}
          {/* ----------------------------------------------------------- */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Mascot Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Choose Student Mascot / Avatar:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatarEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                        avatarEmoji === emoji
                          ? 'bg-teal-500/20 border-2 border-teal-500 scale-110 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Name:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav, Sarah, Alex..."
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                  />
                </div>
              </div>

              {/* Grade / Class */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class / Grade:
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        grade === g
                          ? 'bg-teal-500 text-slate-950 border-teal-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Gr {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number (Used as Password) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Phone Number (Password & Login Key):
                  </label>
                  <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                    Used as your secret PIN
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 9876543210 or 555-0199"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Use this phone number whenever you log in or switch accounts on this device.
                </p>
              </div>

              {signupSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile created! Loading your personal study kit vault...</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Student Profile & Save Permanently</span>
              </button>
            </form>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 3: LOG IN WITH PHONE NUMBER */}
          {/* ----------------------------------------------------------- */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Your Registered Phone Number (Password):
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    autoFocus
                    value={loginPhone}
                    onChange={(e) => {
                      setLoginPhone(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In & Restore My Study Kits</span>
              </button>

              {profiles.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-400 mb-2">
                    Or select from registered profiles on this browser:
                  </span>
                  <div className="space-y-1.5">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSwitchProfile(p.id);
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left flex items-center justify-between transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.avatarEmoji || '🎓'}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{p.name}</div>
                            <div className="text-[10px] text-slate-500">Grade {p.grade}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
