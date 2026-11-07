import React, { useState } from 'react';
import { UserProfile } from '../types/recipe';
import {
  X,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  LogOut,
  Edit2,
  Check,
  ShieldCheck,
  ChefHat,
  Bookmark,
  Calendar,
  ShoppingBag,
} from 'lucide-react';

interface AuthModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, data?: any) => void;
  onLogout: () => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  recipeCount: number;
  cookbookCount: number;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=bktaylor',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Elena',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Chloe',
  'https://api.dicebear.com/7.x/notionists/svg?seed=ChefLeo',
  'https://api.dicebear.com/7.x/notionists/svg?seed=ZoeBakes',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onLoginSuccess,
  onLogout,
  onUpdateProfile,
  recipeCount,
  cookbookCount,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(
    currentUser ? 'profile' : 'login'
  );

  // Form states
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatarUrl || AVATAR_OPTIONS[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick fill demo user
  const handleSelectDemo = (demoId: string) => {
    setUserIdInput(demoId);
    setPasswordInput('recime123');
    setErrorMsg(null);
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.user, data.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdInput.trim(),
          password: passwordInput,
          name: nameInput.trim() || userIdInput.trim(),
          bio: bioInput.trim(),
          avatarUrl: selectedAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onLoginSuccess(data.user, data.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Edit Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          name: editName,
          bio: editBio,
          avatarUrl: editAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      onUpdateProfile(data.user);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#FAF8F5] dark:bg-stone-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF5A1F] flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                {mode === 'profile'
                  ? 'Your ReciMe Profile'
                  : mode === 'register'
                  ? 'Create Profile'
                  : 'Log in to ReciMe'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {mode === 'profile'
                  ? 'Manage account & cookbooks'
                  : 'Personalized recipes & meal planner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: ACTIVE PROFILE */}
        {mode === 'profile' && currentUser && (
          <div className="space-y-5">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Bio / Cooking Style
                  </label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                    Pick Avatar
                  </label>
                  <div className="flex gap-2 justify-between">
                    {AVATAR_OPTIONS.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Avatar"
                        onClick={() => setEditAvatar(url)}
                        className={`w-10 h-10 rounded-full cursor-pointer p-0.5 border-2 transition-all ${
                          editAvatar === url
                            ? 'border-[#FF5A1F] scale-110 shadow-sm'
                            : 'border-transparent hover:border-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Profile Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-14 h-14 rounded-full border border-orange-200 dark:border-stone-600 bg-orange-50 dark:bg-stone-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {currentUser.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#FEEFEA] dark:bg-orange-950 text-[#FF5A1F] font-semibold">
                          @{currentUser.userId}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        {currentUser.bio || 'Home cook on ReciMe'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                    title="Edit profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700 text-center">
                    <span className="text-xs text-stone-500 dark:text-stone-400 block mb-0.5">
                      Saved Recipes
                    </span>
                    <span className="text-xl font-bold font-serif text-[#FF5A1F] tabular-nums">
                      {recipeCount}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700 text-center">
                    <span className="text-xs text-stone-500 dark:text-stone-400 block mb-0.5">
                      Cookbooks
                    </span>
                    <span className="text-xl font-bold font-serif text-[#FF5A1F] tabular-nums">
                      {cookbookCount}
                    </span>
                  </div>
                </div>

                {/* Cloud Sync Status */}
                <div className="p-3.5 rounded-2xl bg-[#FEEFEA]/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Profile Data Synced</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#FF5A1F]">Active</span>
                </div>

                {/* Actions: Switch Profile / Logout */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      onLogout();
                      setMode('login');
                    }}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW 2: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                User ID
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                  @
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. bktaylor"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Log in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Logins for instant evaluation */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1.5 text-center">
                Or test with demo profiles:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectDemo('bktaylor')}
                  className="flex-1 py-1.5 px-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-orange-500 text-[11px] text-stone-700 dark:text-stone-300 transition-colors"
                >
                  <span className="font-bold text-[#FF5A1F]">@bktaylor</span> (Brian)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemo('chef_elena')}
                  className="flex-1 py-1.5 px-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-orange-500 text-[11px] text-stone-700 dark:text-stone-300 transition-colors"
                >
                  <span className="font-bold text-[#FF5A1F]">@chef_elena</span> (Elena)
                </button>
              </div>
              <span className="text-[10px] text-stone-400 block text-center mt-1">
                Password: <code className="text-stone-600 dark:text-stone-300">recime123</code>
              </span>
            </div>

            {/* Switch to Register */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 text-center">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Don't have a profile yet?{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('register');
                }}
                className="text-xs font-bold text-[#FF5A1F] hover:underline"
              >
                Register here
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Choose User ID *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                  @
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. foodlover99"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  autoFocus
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Lowercase letters, numbers, and underscores only.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Your Full / Display Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 4 characters"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">
                Choose Profile Avatar
              </label>
              <div className="flex gap-2 justify-between">
                {AVATAR_OPTIONS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Avatar"
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-9 h-9 rounded-full cursor-pointer p-0.5 border-2 transition-all ${
                      selectedAvatar === url
                        ? 'border-[#FF5A1F] scale-110 shadow-sm'
                        : 'border-transparent hover:border-stone-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Switch to Login */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-center">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Already have a profile?{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('login');
                }}
                className="text-xs font-bold text-[#FF5A1F] hover:underline"
              >
                Log in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
