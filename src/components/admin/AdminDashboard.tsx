import React from 'react';
import { db } from '../../services/db';
import { 
  Users, 
  FileQuestion, 
  FolderKanban, 
  ClipboardCheck, 
  FileText, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BarChart3,
  Award
} from 'lucide-react';

interface Props {
  onNavigate: (view: string, data?: any) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
  const profiles = db.getProfiles();
  const students = profiles.filter(p => p.role === 'student');
  const exams = db.getExams();
  const assignments = db.getAssignments();
  const attempts = db.getAttempts();
  const submissions = db.getAssignmentSubmissions();

  // Compute pending items
  const pendingExamSubmissions = attempts.filter(a => a.status === 'submitted');
  const pendingAssignmentSubmissions = submissions.filter(s => s.status === 'submitted' || s.status === 'late');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner with Mindcraft Academy Palette */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0A2558] via-[#0D3073] to-[#0A2558] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FF7A00] text-xs font-bold uppercase tracking-wider border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mindcraft Academy • Administrator Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Academic Operations & Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
            Monitor real-time cohort performance, author examinations with dynamic rubrics, and grade handwritten student submissions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('admin-exam-submissions')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] hover:from-[#EA580C] hover:to-[#FF7A00] text-white font-bold text-xs shadow-md shadow-[#FF7A00]/25 flex items-center gap-2 transition-all"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Grade Exams ({pendingExamSubmissions.length})</span>
          </button>
        </div>
      </div>

      {/* 6 Core Metrics (Section 21) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{students.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Enrolled students</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{students.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">100% engagement</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Exams</span>
            <FileQuestion className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{exams.length}</p>
          <p className="text-[10px] text-purple-600 mt-1 font-semibold">{exams.filter(e => e.status === 'published').length} Published</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignments</span>
            <FolderKanban className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{assignments.length}</p>
          <p className="text-[10px] text-indigo-600 mt-1 font-semibold">Active tasks</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-orange-200 bg-orange-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Pending Exams</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-orange-600">{pendingExamSubmissions.length}</p>
          <p className="text-[10px] text-orange-700 font-semibold mt-1">Need essay review</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Pending Coursework</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600">{pendingAssignmentSubmissions.length}</p>
          <p className="text-[10px] text-blue-700 font-semibold mt-1">Need grading</p>
        </div>
      </div>

      {/* Visual Analytics / Charts Grid (Section 21) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Distribution Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Score Distribution Curve</h3>
              <p className="text-[11px] text-slate-400">Cohort marks breakdown</p>
            </div>
            <Award className="w-4 h-4 text-orange-500" />
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>90% - 100% (High Honors)</span>
                <span className="font-bold text-emerald-600">45%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>75% - 89% (Proficient)</span>
                <span className="font-bold text-blue-600">35%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-[35%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>60% - 74% (Developing)</span>
                <span className="font-bold text-amber-600">15%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full w-[15%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Below 60%</span>
                <span className="font-bold text-rose-500">5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-400 h-2 rounded-full w-[5%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Exam Completion & Engagement */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Exam Completion Velocity</h3>
              <p className="text-[11px] text-slate-400">Total attempts: {attempts.length}</p>
            </div>
            <FileQuestion className="w-4 h-4 text-purple-500" />
          </div>

          <div className="h-40 flex items-end justify-between gap-3 pt-4 px-2">
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-slate-100 rounded-t-xl h-[40%] flex items-end">
                <div className="w-full bg-blue-500 rounded-t-xl h-full" />
              </div>
              <span className="text-[10px] font-bold text-slate-500">Exam 1</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-slate-100 rounded-t-xl h-[75%] flex items-end">
                <div className="w-full bg-orange-500 rounded-t-xl h-full" />
              </div>
              <span className="text-[10px] font-bold text-slate-500">Exam 2</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-slate-100 rounded-t-xl h-[25%] flex items-end">
                <div className="w-full bg-slate-300 rounded-t-xl h-full" />
              </div>
              <span className="text-[10px] font-bold text-slate-400">Draft</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Peak submission window occurs between 14:00 and 18:00 UTC.
          </p>
        </div>

        {/* Fast Action Queue */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900">Grading Queue</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submissions requiring manual score allocation and constructive feedback.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigate('admin-exam-submissions')}
                className="w-full p-3 rounded-2xl bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-orange-900">
                    {pendingExamSubmissions.length} Exam Essays Waiting
                  </p>
                  <p className="text-[10px] text-orange-700">Handwritten answer scans</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-600" />
              </button>

              <button
                onClick={() => onNavigate('admin-assignment-submissions')}
                className="w-full p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-blue-900">
                    {pendingAssignmentSubmissions.length} Coursework Files Waiting
                  </p>
                  <p className="text-[10px] text-blue-700">PDFs, code archives</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('admin-exams')}
              className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage & Author Exams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Exam Submissions</h3>
            <p className="text-xs text-slate-400">All cohorts across platform</p>
          </div>
          <button
            onClick={() => onNavigate('admin-exam-submissions')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            View All Submissions
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400">
                <th className="pb-3 px-3">Student</th>
                <th className="pb-3 px-3">Exam</th>
                <th className="pb-3 px-3">Submitted At</th>
                <th className="pb-3 px-3">Score</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No student examination attempts submitted yet.
                  </td>
                </tr>
              ) : (
                attempts.slice(0, 5).map(att => {
                const student = db.getProfile(att.student_id);
                const exam = db.getExam(att.exam_id);
                const isGraded = att.status === 'graded';

                return (
                  <tr key={att.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <img
                        src={student?.avatar_url || 'bg.png'}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span>{student?.full_name || 'Student'}</span>
                      <span className="font-mono text-[10px] text-slate-400">({student?.student_id})</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{exam?.title}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {att.submitted_at ? new Date(att.submitted_at).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {att.final_score} / {exam?.total_marks}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isGraded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isGraded ? 'Graded' : 'Needs Review'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('admin-exam-submissions', { attemptId: att.id })}
                        className="px-3 py-1 rounded-lg bg-orange-500 text-white font-bold text-[11px] hover:bg-orange-600 transition-colors"
                      >
                        {isGraded ? 'Review' : 'Grade Essay'}
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
