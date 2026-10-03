import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { SupabaseModal } from './components/common/SupabaseModal';

// Landing & Auth
import { LandingPage } from './components/landing/LandingPage';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentExams } from './components/student/StudentExams';
import { ExamSession } from './components/student/ExamSession';
import { ExamResults } from './components/student/ExamResults';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentGrades } from './components/student/StudentGrades';
import { StudentSubmissions } from './components/student/StudentSubmissions';
import { StudentProfile } from './components/student/StudentProfile';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminExams } from './components/admin/AdminExams';
import { QuestionBuilder } from './components/admin/QuestionBuilder';
import { AdminExamSubmissions } from './components/admin/AdminExamSubmissions';
import { AdminAssignments } from './components/admin/AdminAssignments';
import { AdminAssignmentSubmissions } from './components/admin/AdminAssignmentSubmissions';
import { AdminSettings } from './components/admin/AdminSettings';

const MainContent: React.FC = () => {
  const { user, loading, isAdminAuthenticated } = useAuth();
  const { showToast } = useNotifications();

  // Navigation route state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const handleNavigate = (view: string, params?: any) => {
    // Admin Route Protection
    if (view.startsWith('admin-')) {
      if (!user || user.role !== 'admin' || !isAdminAuthenticated) {
        showToast({
          type: 'warning',
          title: 'Administrator Verification Required',
          message: 'Every time the Admin Portal is accessed, administrator credentials must be verified.'
        });
        setCurrentView('login');
        setViewParams({ requestedRole: 'admin', returnView: view, ...params });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Student Route Protection
    if (view.startsWith('student-')) {
      if (!user) {
        showToast({
          type: 'info',
          title: 'Student Authentication Required',
          message: 'Please sign in to access your student coursework and assessments.'
        });
        setCurrentView('login');
        setViewParams({ requestedRole: 'student', returnView: view, ...params });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setCurrentView(view);
    if (params) setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-[#0A2558] rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#0A2558] tracking-wider uppercase">Loading Mindcraft Academy...</p>
        </div>
      </div>
    );
  }

  // Determine if full-screen mode (e.g. landing, login, register, active exam session)
  const isLandingOrAuth = currentView === 'landing' || currentView === 'login' || currentView === 'register';
  const isExamInProgress = currentView === 'student-exam-session';
  const showAppShell = !isLandingOrAuth && !isExamInProgress;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 flex w-full">
        {/* App Sidebar (Only for authenticated student / admin app views) */}
        {showAppShell && (
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            isOpenMobile={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Routed Content Area */}
        <main
          className={`flex-1 transition-all duration-200 ${
            showAppShell ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : 'w-full'
          }`}
        >
          {/* Landing & Authentication */}
          {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {currentView === 'login' && <Login onNavigate={handleNavigate} params={viewParams} />}
          {currentView === 'register' && <Register onNavigate={handleNavigate} />}

          {/* Student Experiences */}
          {currentView === 'student-dashboard' && (
            <StudentDashboard onNavigate={handleNavigate} />
          )}

          {currentView === 'student-exams' && (
            <StudentExams
              onStartExam={examId => handleNavigate('student-exam-session', { examId })}
              onViewResults={attemptId => handleNavigate('student-exam-results', { attemptId })}
            />
          )}

          {currentView === 'student-exam-session' && viewParams.examId && (
            <div className="p-4 sm:p-6 lg:p-8">
              <ExamSession
                examId={viewParams.examId}
                onFinish={attemptId => handleNavigate('student-exam-results', { attemptId })}
                onExit={() => handleNavigate('student-exams')}
              />
            </div>
          )}

          {currentView === 'student-exam-results' && viewParams.attemptId && (
            <ExamResults
              attemptId={viewParams.attemptId}
              onBack={() => handleNavigate('student-exams')}
            />
          )}

          {currentView === 'student-assignments' && <StudentAssignments />}

          {currentView === 'student-grades' && (
            <StudentGrades
              onViewExamResults={attemptId => handleNavigate('student-exam-results', { attemptId })}
            />
          )}

          {currentView === 'student-submissions' && (
            <StudentSubmissions
              onViewExam={attemptId => handleNavigate('student-exam-results', { attemptId })}
              onNavigateToAssignments={() => handleNavigate('student-assignments')}
            />
          )}

          {currentView === 'student-profile' && <StudentProfile />}

          {/* Admin Experiences */}
          {currentView === 'admin-dashboard' && (
            <AdminDashboard onNavigate={handleNavigate} />
          )}

          {currentView === 'admin-students' && <AdminStudents />}

          {currentView === 'admin-exams' && (
            <AdminExams
              onOpenQuestionBuilder={examId => handleNavigate('admin-question-builder', { examId })}
            />
          )}

          {currentView === 'admin-question-builder' && viewParams.examId && (
            <QuestionBuilder
              examId={viewParams.examId}
              onBack={() => handleNavigate('admin-exams')}
            />
          )}

          {currentView === 'admin-exam-submissions' && (
            <AdminExamSubmissions initialAttemptId={viewParams.attemptId} />
          )}

          {currentView === 'admin-assignments' && (
            <AdminAssignments
              onViewSubmissions={asgId => handleNavigate('admin-assignment-submissions', { assignmentId: asgId })}
            />
          )}

          {currentView === 'admin-assignment-submissions' && (
            <AdminAssignmentSubmissions initialAssignmentId={viewParams.assignmentId} />
          )}

          {currentView === 'admin-settings' && (
            <AdminSettings onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
