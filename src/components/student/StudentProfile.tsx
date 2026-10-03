import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { db } from '../../services/db';
import { User, Mail, Hash, Calendar, Camera, Check, ShieldCheck, Lock, GraduationCap } from 'lucide-react';
import { GRADE_LEVELS } from '../../types/database';

export const StudentProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [gradeLevel, setGradeLevel] = useState(user?.grade_level || 'Grade 9');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const quickAvatars = [
    {
      id: 'cartoon-1',
      name: 'Avatar 1',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'
    },
    {
      id: 'cartoon-2',
      name: 'Avatar 2',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna'
    },
    {
      id: 'cartoon-3',
      name: 'Avatar 3',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Omar'
    },
    {
      id: 'cartoon-4',
      name: 'Avatar 4',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sara'
    },
    {
      id: 'cartoon-5',
      name: 'Avatar 5',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mina'
    }
  ];

  const avatarOptions = quickAvatars.map((avatar) => avatar.url);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    try {
      await updateUser({
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        grade_level: gradeLevel
      });
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information was saved successfully.'
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not update profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const res = await db.uploadFile('avatars', file, user.id);
        const stored = db.getFileByPath(res.path);
        if (stored?.dataUrl) {
          setAvatarUrl(stored.dataUrl);
        }
        showToast({
          type: 'success',
          title: 'Photo Uploaded',
          message: 'Avatar image updated.'
        });
      } catch {
        showToast({
          type: 'error',
          title: 'Upload Error',
          message: 'Failed to process avatar file.'
        });
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your student identity, avatar, and academic credentials.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Avatar customizer */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative group">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={user.full_name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-500/20 shadow-md"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full cursor-pointer shadow-md hover:bg-orange-600 transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Choose Quick Avatar</h3>
            <div className="flex items-center gap-2">
              {avatarOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(opt)}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                    avatarUrl === opt ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-transparent'
                  }`}
                >
                  <img src={opt} alt="Option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">Or click the camera button to upload your own picture</p>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Protected
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Student ID Number</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Unique Key
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={user.student_id || 'Not Assigned'}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Educational Grade Level
              </label>
              <span className="text-[10px] text-amber-600 font-medium">Tests and assignments are customized for this grade</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <GraduationCap className="w-4 h-4 text-orange-500" />
              </div>
              <select
                value={gradeLevel}
                onChange={e => setGradeLevel(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 transition-all cursor-pointer appearance-none"
              >
                {GRADE_LEVELS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned Platform Role
              </label>
              <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 flex items-center gap-2 text-xs font-bold text-orange-800 capitalize">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>{user.role}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registration Date
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
