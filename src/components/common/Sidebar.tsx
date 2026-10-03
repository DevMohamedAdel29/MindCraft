import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { MindcraftLogo } from './MindcraftLogo';
import { 
  LayoutDashboard, 
  Users, 
  FileQuestion, 
  ClipboardCheck, 
  FolderKanban, 
  FileText, 
  Award, 
  Bell, 
  Settings, 
  LogOut, 
  X, 
  Compass, 
  UserCircle2, 
  CheckSquare, 
  BookOpen
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  isOpenMobile,
  onCloseMobile,
  currentView,
  onNavigate
}) => {
  const isMenuOpen = isOpenMobile ?? isOpen ?? false;
  const handleClose = onCloseMobile || onClose || (() => {});
  const { user, role, logout } = useAuth();

  // Compute pending counts for admin badges
  const attempts = db.getAttempts();
  const pendingExamReviews = attempts.filter(a => a.status === 'submitted').length;
  
  const submissions = db.getAssignmentSubmissions();
  const pendingAssignmentReviews = submissions.filter(s => s.status === 'submitted' || s.status === 'late').length;

  const adminNavItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-students', label: 'Students', icon: Users },
    { id: 'admin-exams', label: 'Exam Management', icon: FileQuestion },
    { 
      id: 'admin-exam-submissions', 
      label: 'Exam Submissions', 
      icon: ClipboardCheck,
      badge: pendingExamReviews > 0 ? pendingExamReviews : undefined 
    },
    { id: 'admin-assignments', label: 'Assignments', icon: FolderKanban },
    { 
      id: 'admin-assignment-submissions', 
      label: 'Assignment Submissions', 
      icon: FileText,
      badge: pendingAssignmentReviews > 0 ? pendingAssignmentReviews : undefined
    },
    { id: 'admin-settings', label: 'System & Database', icon: Settings },
  ];

  const studentNavItems: NavItem[] = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-exams', label: 'Exams', icon: FileQuestion },
    { id: 'student-assignments', label: 'Assignments', icon: FolderKanban },
    { id: 'student-submissions', label: 'My Submissions', icon: CheckSquare },
    { id: 'student-grades', label: 'My Grades', icon: Award },
    { id: 'student-profile', label: 'Profile', icon: UserCircle2 },
  ];

  const items = role === 'admin' ? adminNavItems : studentNavItems;

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    handleClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMenuOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header on mobile */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between md:hidden">
          <MindcraftLogo variant="horizontal" size="sm" />
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview banner */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={user?.full_name || 'User'}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-orange-500/20 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name || 'Guest'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block w-2 h-2 rounded-full ${role === 'admin' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                <span className="text-xs font-semibold text-slate-500 capitalize">
                  {role || 'Visitor'}
                </span>
                {user?.student_id && (
                  <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                    {user.student_id}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {role === 'admin' ? 'Administration' : 'Student Space'}
          </div>

          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#0A2558] text-white shadow-md shadow-[#0A2558]/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-transform group-hover:scale-105 ${
                      isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/30">
          <div className="rounded-xl p-3 bg-gradient-to-br from-orange-500/10 via-transparent to-slate-100 border border-orange-200/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span>MindCraft v2.4</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Real Exams, Essay Scans, Grading & Student Tracking.
            </p>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('landing');
              handleClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
