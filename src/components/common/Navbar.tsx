import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { MindcraftLogo } from './MindcraftLogo';
import { 
  Compass, 
  Bell, 
  Menu, 
  X, 
  Database, 
  UserCheck, 
  ChevronDown, 
  LogOut, 
  User, 
  GraduationCap, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface Props {
  onToggleSidebar: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  onToggleSidebar,
  onNavigate,
  onOpenSupabaseModal
}) => {
  const { user, role, logout, lockAdminSession } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile sidebar toggle + Brand */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={onToggleSidebar}
                className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div
              onClick={() => onNavigate(user ? (role === 'admin' ? 'admin-dashboard' : 'student-dashboard') : 'landing')}
              className="flex items-center cursor-pointer group hover:opacity-95 transition-opacity"
            >
              <MindcraftLogo variant="horizontal" size="sm" showTagline={false} />
            </div>
          </div>

          {/* Right actions: Supabase status, Notifications, Profile / Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase backend status pill */}
            <button
              onClick={onOpenSupabaseModal}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:bg-slate-50 border-slate-200 text-slate-700"
              title="View Supabase Database & Security Status"
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'PostgreSQL Engine'}</span>
            </button>

            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF7A00] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 transition-all bg-white"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{user.full_name}</p>
                      <p className="text-[10px] text-slate-400 capitalize font-medium">
                        {user.role === 'admin' ? 'Faculty Admin' : user.student_id || 'Student'}
                      </p>
                    </div>
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover border border-[#FF7A00]/30 ring-2 ring-[#FF7A00]/10"
                    />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-[#0A2558]">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                            user.role === 'admin' ? 'bg-[#FF7A00]/10 text-[#FF7A00]' : 'bg-[#00B4D8]/10 text-[#00B4D8]'
                          }`}>
                            {user.role}
                          </span>
                          {user.student_id && (
                            <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {user.student_id}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-slate-500" />
                        Dashboard
                      </button>

                      {user.role === 'student' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('student-profile');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          My Profile
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            lockAdminSession();
                            onNavigate('login');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Lock Admin Session
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          onNavigate('landing');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 font-semibold text-xs transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] text-white font-bold text-xs shadow-md shadow-[#FF7A00]/20 hover:from-[#EA580C] hover:to-[#FF7A00] transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

