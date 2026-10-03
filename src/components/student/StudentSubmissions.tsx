import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { CheckSquare, FileText, FileQuestion, Download, Eye, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  onViewExam: (attemptId: string) => void;
  onNavigateToAssignments: () => void;
}

export const StudentSubmissions: React.FC<Props> = ({ onViewExam, onNavigateToAssignments }) => {
  const { user } = useAuth();
  if (!user) return null;

  const attempts = db.getStudentAttempts(user.id);
  const submissions = db.getStudentAssignmentSubmissions(user.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Submissions</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Historical log of your submitted exam answer sheets and uploaded assignment project archives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exam Submissions */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Exam Attempts & Sheets</h2>
              <p className="text-xs text-slate-400">{attempts.length} attempts recorded</p>
            </div>
          </div>

          <div className="space-y-3">
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No exams submitted yet.</p>
            ) : (
              attempts.map(att => {
                const exam = db.getExam(att.exam_id);
                const isGraded = att.status === 'graded';

                return (
                  <div
                    key={att.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{exam?.title || 'Exam'}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'In Progress'}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isGraded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isGraded ? `Graded: ${att.final_score} pts` : 'Under Review'}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewExam(att.id)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Assignment Solution Files */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Assignment Uploads</h2>
              <p className="text-xs text-slate-400">{submissions.length} files submitted</p>
            </div>
          </div>

          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-2">No coursework submissions yet.</p>
                <button
                  onClick={onNavigateToAssignments}
                  className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
                >
                  Go to Assignments
                </button>
              </div>
            ) : (
              submissions.map(sub => {
                const assign = db.getAssignment(sub.assignment_id);

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {assign?.title || 'Assignment'}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        File: {sub.file_name}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {sub.status === 'graded' ? `Grade: ${sub.grade} pts` : sub.status}
                      </span>
                    </div>

                    <button
                      onClick={() => db.downloadFile(sub.file_path, sub.file_name)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 shadow-2xs shrink-0"
                      title="Download your submitted file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>File</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
