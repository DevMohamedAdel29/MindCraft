import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { MindcraftLogo } from '../common/MindcraftLogo';
import { BrandBackground } from '../common/BrandBackground';
import { User, Mail, Hash, Lock, ArrowRight, AlertCircle, ShieldAlert, CheckCircle2, GraduationCap } from 'lucide-react';
import { GRADE_LEVELS } from '../../types/database';

interface Props {
  onNavigate: (view: string, params?: any) => void;
}

export const Register: React.FC<Props> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showToast } = useNotifications();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>('Grade 9');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full legal name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid educational or personal email address.');
      return;
    }

    if (!studentId.trim() || studentId.trim().length < 3) {
      setError('Please enter a valid Student ID (e.g. MC-2026-004).');
      return;
    }

    if (!gradeLevel) {
      setError('Please select your educational grade level.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(fullName, email, studentId, password, gradeLevel);
      showToast({
        type: 'success',
        title: 'Registration Successful! 🎉',
        message: `Welcome to Mindcraft Academy, ${newUser.full_name} (${gradeLevel}). Student ID: ${newUser.student_id}`
      });
      onNavigate('student-dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Unable to register.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandBackground variant="subtle" className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header with Mindcraft Academy Logo Lockup */}
        <div className="text-center space-y-3">
          <div
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center cursor-pointer group hover:scale-[1.02] transition-transform"
          >
            <MindcraftLogo variant="full" size="md" showTagline={true} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0A2558] tracking-tight">
            Student Enrollment Registration
          </h2>
          <p className="text-xs text-slate-500">
            Create your private academic profile to access examinations, coursework, and grades
          </p>
        </div>

        {/* Security Isolation Notice */}
        <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-cyan-900">Student Portal Enrollment Only</p>
            <p className="text-[11px] text-cyan-700 mt-0.5">
              No user can join as an administrator through enrollment. Your submissions, attempts, and grades will remain strictly private to you.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/5 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jordan.hayes@mindcraft.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Student ID Number
                </label>
                <span className="text-[10px] text-slate-400">Institutional ID</span>
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value.toUpperCase())}
                  placeholder="MC-2026-004"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] text-xs font-medium text-slate-900 font-mono transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Grade / Class Level
                </label>
                <span className="text-[10px] text-amber-600 font-semibold">Customizes Tests & Assignments</span>
              </div>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={gradeLevel}
                  onChange={e => setGradeLevel(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] text-xs font-medium text-slate-900 transition-all cursor-pointer appearance-none"
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
              <p className="text-[10px] text-slate-400 mt-1">
                You will only be presented with online exams and assignments designated for your selected grade.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Assigned Role: <strong className="text-slate-800">Student</strong> (Protected isolation)</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] hover:from-[#EA580C] hover:to-[#FF7A00] active:scale-98 text-white font-bold text-xs shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Registering Student Account...</span>
              ) : (
                <>
                  <span>Complete Enrollment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-[#FF7A00] font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </BrandBackground>
  );
};
