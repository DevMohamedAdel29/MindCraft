import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Award, FileQuestion, FolderKanban, CheckCircle2, Clock, Eye, TrendingUp, BarChart2 } from 'lucide-react';

interface Props {
  onViewExamResults: (attemptId: string) => void;
}

export const StudentGrades: React.FC<Props> = ({ onViewExamResults }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'exams' | 'assignments'>('exams');

  if (!user) return null;

  const attempts = db.getStudentAttempts(user.id);
  const submissions = db.getStudentAssignmentSubmissions(user.id);

  // Overall performance calculations
  let totalPointsEarned = 0;
  let totalPossible = 0;

  attempts.forEach(att => {
    const exam = db.getExam(att.exam_id);
    if (exam && att.status === 'graded') {
      totalPointsEarned += att.final_score;
      totalPossible += exam.total_marks;
    }
  });

  submissions.forEach(sub => {
    const assign = db.getAssignment(sub.assignment_id);
    if (assign && sub.grade !== null && sub.grade !== undefined) {
      totalPointsEarned += sub.grade;
      totalPossible += assign.max_grade;
    }
  });

  const cumulativeAverage = totalPossible > 0 ? Math.round((totalPointsEarned / totalPossible) * 100) : 0;
  const gpa = totalPossible > 0 ? (cumulativeAverage / 25).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Gradebook</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review verified exam results, teacher essay remarks, and coursework scores.
        </p>
      </div>

      {/* Overall Performance Section (Section 19) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400">
              Cumulative Standing
            </span>
            <h2 className="text-xl font-bold tracking-tight">Overall Academic Performance</h2>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Based on completed examination milestones and validated coursework submissions.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Cumulative GPA</p>
              <p className="text-2xl font-black text-orange-400 mt-0.5">{gpa} / 4.0</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Average Score</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">{cumulativeAverage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Exams vs Assignments */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'exams'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>Exams ({attempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'assignments'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Assignments ({submissions.length})</span>
        </button>
      </div>

      {/* Tab 1: Exams Table */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Exam Title</th>
                  <th className="py-4 px-6">Date Taken</th>
                  <th className="py-4 px-6">Score</th>
                  <th className="py-4 px-6">Percentage</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No exam attempts found. Go to Exams to take one!
                    </td>
                  </tr>
                ) : (
                  attempts.map(att => {
                    const exam = db.getExam(att.exam_id);
                    const totalMarks = exam?.total_marks || 100;
                    const percent = Math.round((att.final_score / totalMarks) * 100);
                    const isGraded = att.status === 'graded';

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {exam?.title || 'Exam'}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {att.submitted_at ? new Date(att.submitted_at).toLocaleDateString() : 'In Progress'}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {att.final_score} / {totalMarks} pts
                        </td>
                        <td className="py-4 px-6 font-semibold text-emerald-600">
                          {percent}%
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              isGraded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isGraded ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {isGraded ? 'Graded' : 'Under Review'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => onViewExamResults(att.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Breakdown</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Assignments Table */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Assignment</th>
                  <th className="py-4 px-6">Submission Date</th>
                  <th className="py-4 px-6">Grade</th>
                  <th className="py-4 px-6">Feedback</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No assignment submissions found.
                    </td>
                  </tr>
                ) : (
                  submissions.map(sub => {
                    const assign = db.getAssignment(sub.assignment_id);
                    const isGraded = sub.status === 'graded';

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {assign?.title || 'Assignment'}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {sub.grade !== null && sub.grade !== undefined ? (
                            `${sub.grade} / ${assign?.max_grade || 100}`
                          ) : (
                            <span className="text-slate-400 font-normal italic">Pending Grade</span>
                          )}
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          {sub.feedback ? (
                            <p className="text-[11px] text-orange-900 bg-orange-50/80 p-2 rounded-lg italic">
                              "{sub.feedback}"
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">None yet</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              isGraded
                                ? 'bg-emerald-100 text-emerald-700'
                                : sub.status === 'late'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
