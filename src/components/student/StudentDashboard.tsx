import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { 
  FileQuestion, 
  FolderKanban, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Sparkles,
  Download,
  BookOpen
} from 'lucide-react';

interface Props {
  onNavigate: (view: string, data?: any) => void;
}

export const StudentDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  if (!user) return null;

  const exams = db.getExams('student', user.grade_level);
  const studentAttempts = db.getStudentAttempts(user.id);
  const assignments = db.getAssignments('student', user.grade_level);
  const submissions = db.getStudentAssignmentSubmissions(user.id);

  // Statistics calculation
  const completedAttempts = studentAttempts.filter(a => a.status === 'graded');
  const pendingAssignments = assignments.filter(
    a => !submissions.some(s => s.assignment_id === a.id)
  );

  // Calculate average score percentage
  let totalScoreEarned = 0;
  let totalPossibleMarks = 0;

  completedAttempts.forEach(att => {
    const exam = db.getExam(att.exam_id);
    if (exam && exam.total_marks > 0) {
      totalScoreEarned += att.final_score;
      totalPossibleMarks += exam.total_marks;
    }
  });

  const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);
  gradedSubmissions.forEach(sub => {
    const assign = db.getAssignment(sub.assignment_id);
    if (assign && assign.max_grade > 0) {
      totalScoreEarned += sub.grade!;
      totalPossibleMarks += assign.max_grade;
    }
  });

  const averageScorePercent = totalPossibleMarks > 0 
    ? Math.round((totalScoreEarned / totalPossibleMarks) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner with Mindcraft Academy Palette */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A2558] via-[#0D3073] to-[#0A2558] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#FF7A00]/25 to-transparent pointer-events-none" />
        <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full border-4 border-white/5 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FF7A00] text-xs font-bold uppercase tracking-wider backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mindcraft Academy • Term 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user.full_name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            Ready to test your knowledge? You have <strong className="text-[#FF7A00] font-bold">{exams.length} published exams</strong> and <strong className="text-[#38BDF8] font-bold">{pendingAssignments.length} pending assignments</strong> waiting for your solution.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300 font-medium">
            <span>Student ID: <span className="font-mono text-white font-bold">{user.student_id || 'MC-2026'}</span></span>
            <span>•</span>
            <span>Grade: <span className="font-bold text-[#FF7A00]">{user.grade_level || 'Grade 9'}</span></span>
            <span>•</span>
            <span>Track: Computer Science & Algorithmic Systems</span>
          </div>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Exams</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{exams.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ready to take anytime</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Exams</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{studentAttempts.length}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
            {completedAttempts.length} Graded & Verified
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Assignments</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{pendingAssignments.length}</p>
          <p className="text-[11px] text-orange-600 mt-1 font-semibold">
            {submissions.length} Submitted to date
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{averageScorePercent}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(averageScorePercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Action Cards (Take an Exam & Submit Assignment) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Take an Exam */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-orange-300 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100/80 text-orange-600 flex items-center justify-center shadow-xs">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Take an Exam</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Test what you've learned." Timed online assessments featuring multiple choice, true/false, and handwritten essay uploads.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('student-exams')}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all group-hover:gap-3"
            >
              <span>View Exams</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submit an Assignment */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Submit an Assignment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Download your assignment and upload your solution." Access problem briefs and submit your project archives before deadline.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('student-assignments')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all group-hover:gap-3"
            >
              <span>View Assignments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Grades & Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Grades */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Grades & Feedback</h3>
              <p className="text-xs text-slate-400">Latest assessments reviewed by instructors</p>
            </div>
            <button
              onClick={() => onNavigate('student-grades')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              View All
            </button>
          </div>

          {studentAttempts.length === 0 && submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No graded assessments yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Take an exam to see your verified scores here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentAttempts.map(att => {
                const exam = db.getExam(att.exam_id);
                const percent = exam ? Math.round((att.final_score / exam.total_marks) * 100) : 0;
                return (
                  <div
                    key={att.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {exam?.title || 'Exam'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          att.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {att.status === 'graded' ? 'Graded' : 'Under Review'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Submitted: {att.submitted_at ? new Date(att.submitted_at).toLocaleDateString() : 'In Progress'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-base font-black text-slate-900">
                          {att.final_score} <span className="text-xs font-normal text-slate-400">/ {exam?.total_marks}</span>
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600">{percent}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {submissions.map(sub => {
                const assign = db.getAssignment(sub.assignment_id);
                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {assign?.title || 'Assignment'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">
                        File: {sub.file_name}
                      </p>
                      {sub.feedback && (
                        <p className="text-[11px] text-orange-700 bg-orange-50 p-2 rounded-lg mt-1 italic">
                          "{sub.feedback}"
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {sub.grade !== null ? (
                        <div>
                          <p className="text-base font-black text-slate-900">
                            {sub.grade} <span className="text-xs font-normal text-slate-400">/ {assign?.max_grade}</span>
                          </p>
                          <p className="text-[10px] font-bold text-emerald-600">Graded</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Pending Grade</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Learning Trajectory Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-bold text-slate-900">Academic Progress</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Syllabus Completion</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full w-3/4" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Objective Accuracy</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Assignment Submissions</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-1">Instructor Note:</p>
              <p className="text-[11px] leading-relaxed">
                "Keep up the consistent effort. Ensure your handwriting on essay submissions is legible with high-contrast lighting."
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onNavigate('student-exams')}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              Browse Active Exam Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
