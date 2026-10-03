import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { MindcraftLogo } from '../common/MindcraftLogo';
import { BrandBackground } from '../common/BrandBackground';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound,
  ShieldAlert
} from 'lucide-react';

interface Props {
  onNavigate: (view: string, params?: any) => void;
  params?: {
    requestedRole?: 'admin' | 'student';
    returnView?: string;
    reason?: string;
  };
}

export const Login: React.FC<Props> = ({ onNavigate, params }) => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdminRequired = params?.requestedRole === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your educational email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(trimmedEmail, password);
      
      // Verification check: if this was an admin gate, ensure user is indeed admin
      if (isAdminRequired && user.role !== 'admin') {
        throw new Error('Access Denied: You authenticated with a student account. Faculty administrator privileges are required.');
      }

      showToast({
        type: 'success',
        title: `Welcome, ${user.full_name}!`,
        message: user.role === 'admin' 
          ? 'Administrator session verified.'
          : `Signed in as student (${user.student_id || 'Active'}).`
      });

      if (params?.returnView && (user.role === 'admin' || !params.returnView.startsWith('admin-'))) {
        onNavigate(params.returnView);
      } else if (user.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('student-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your email and password.');
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Invalid email or password.'
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
            {isAdminRequired ? 'Administrator Portal Sign-In' : 'Academy Portal Sign-In'}
          </h2>
          <p className="text-xs text-slate-500">
            {isAdminRequired 
              ? 'Elevated faculty authentication is required to access system settings and grading.'
              : 'Sign in to access your assessments, assignments, coursework, and grades.'}
          </p>
        </div>

        {/* Admin Required Alert Notice if redirected */}
        {isAdminRequired && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Administrator Verification Required</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Faculty credentials must be verified each time administrative views are accessed. Student accounts cannot unlock this area.
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/5 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@mindcraft.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] hover:from-[#EA580C] hover:to-[#FF7A00] active:scale-98 text-white font-bold text-xs shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{isAdminRequired ? 'Authenticate as Admin' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have a student account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-[#FF7A00] font-bold hover:underline"
              >
                Enroll as Student
              </button>
            </p>
          </div>
        </div>
      </div>
    </BrandBackground>
  );
};
