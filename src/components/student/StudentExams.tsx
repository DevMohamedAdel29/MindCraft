import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { FileQuestion, Clock, Award, CheckCircle2, ArrowRight, Play, Eye, GraduationCap } from 'lucide-react';

interface Props {
  onStartExam: (examId: string) => void;
  onViewResults: (attemptId: string) => void;
}

export const StudentExams: React.FC<Props> = ({ onStartExam, onViewResults }) => {
  const { user } = useAuth();
  const exams = db.getExams('student', user?.grade_level);
  const studentAttempts = user ? db.getStudentAttempts(user.id) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Online Exams</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select an assessment to begin. Ensure a stable environment; once started, the countdown timer runs continuously.
          </p>
        </div>

        {user?.grade_level && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold self-start sm:self-auto shadow-xs">
            <GraduationCap className="w-4 h-4 text-[#FF7A00]" />
            <span>Class: {user.grade_level}</span>
          </div>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF7A00] border border-orange-100 flex items-center justify-center mx-auto shadow-xs">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-black text-slate-900">No Active Exams for Your Grade</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              There are currently no examinations published for <strong className="text-slate-800">{user?.grade_level || 'your grade'}</strong>. When your instructor publishes an online assessment for your class, it will appear here immediately.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => {
          const attempt = studentAttempts.find(a => a.exam_id === exam.id);
          const isInProgress = attempt?.status === 'in_progress';
          const isSubmitted = attempt?.status === 'submitted';
          const isGraded = attempt?.status === 'graded';

          return (
            <div
              key={exam.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                      Official Exam
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-purple-600" />
                      {exam.target_grade || 'All Grades'}
                    </span>
                  </div>
                  {isGraded ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Graded
                    </span>
                  ) : isSubmitted ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Under Review
                    </span>
                  ) : isInProgress ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 animate-pulse">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Not Started
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Questions</p>
                    <p className="text-xs font-bold text-slate-800">{exam.question_count || 4}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Duration</p>
                    <p className="text-xs font-bold text-slate-800">{exam.duration_minutes}m</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Total Marks</p>
                    <p className="text-xs font-bold text-slate-800">{exam.total_marks} pts</p>
                  </div>
                </div>

                {isGraded && attempt && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-800">Your Score:</span>
                    <span className="font-black text-emerald-900 text-sm">
                      {attempt.final_score} / {exam.total_marks} ({Math.round((attempt.final_score / exam.total_marks) * 100)}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-6">
                {isGraded || isSubmitted ? (
                  <button
                    onClick={() => attempt && onViewResults(attempt.id)}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>View Submission Details</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onStartExam(exam.id)}
                    className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:gap-3"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isInProgress ? 'Resume Exam' : 'Start Exam'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
