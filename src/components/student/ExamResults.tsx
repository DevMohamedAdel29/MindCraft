import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  FileText, 
  Eye, 
  Download,
  AlertCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface Props {
  attemptId: string;
  onBack: () => void;
}

export const ExamResults: React.FC<Props> = ({ attemptId, onBack }) => {
  const { user } = useAuth();
  const attempt = db.getAttempt(attemptId);

  if (!attempt || (user && user.role === 'student' && attempt.student_id !== user.id)) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Private Assessment Record</h3>
        <p className="text-slate-500 text-xs">
          This examination submission belongs to another student and cannot be accessed from your account.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-[#0A2558] text-white text-xs font-bold hover:bg-[#0D3073] transition-colors"
        >
          Return to My Assessments
        </button>
      </div>
    );
  }

  const exam = db.getExam(attempt.exam_id);
  const questions = exam?.questions || db.getQuestionsForExam(attempt.exam_id);
  const totalMarks = exam?.total_marks || 100;
  const isGraded = attempt.status === 'graded';
  const scorePercent = Math.round((attempt.final_score / totalMarks) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Exams</span>
      </button>

      {/* Main Score Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
              Exam Submission Summary
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {exam?.title || 'Exam Results'}
            </h1>
            <p className="text-xs text-slate-500">
              Submitted on {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : 'Recently'}
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                isGraded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isGraded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {isGraded ? 'Grading Completed' : 'Pending Manual Essay Evaluation'}
            </span>
          </div>
        </div>

        {/* Score metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Automatic Score (MCQ / TF)</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{attempt.auto_score} pts</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Objective questions evaluated instantly</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Manual Score (Essay)</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {isGraded ? `${attempt.manual_score} pts` : 'Under Review'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Assigned by instructor review</p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
            <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Final Total Score</p>
            <p className="text-2xl font-black text-orange-600 mt-1">
  {isGraded
    ? `${attempt.final_score} / ${totalMarks}`
    : 'Pending Review'}
</p>

<p className="text-[10px] font-bold text-orange-700 mt-0.5">
  {isGraded
    ? `${scorePercent}% Overall Performance`
    : 'Final grade will appear after teacher evaluation'}
</p>
          </div>
        </div>
      </div>

      {/* Question Details List */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900">Question Evaluation Breakdown</h2>

        {questions.map((q, idx) => {
          const ans = attempt.answers?.find(a => a.question_id === q.id);
          const isObjective = q.type === 'multiple_choice' || q.type === 'true_false';
          const selectedOption = q.options?.find(opt => opt.id === ans?.selected_option_id);
          const correctOption = q.options?.find(opt => opt.is_correct);
          const isCorrect = isObjective && selectedOption?.is_correct === true;

          return (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {idx + 1} • {q.type === 'multiple_choice' ? 'Multiple Choice' : q.type === 'true_false' ? 'True / False' : 'Essay'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    Max Marks: {q.marks}
                  </span>
                  {isObjective ? (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {ans?.auto_score || 0} / {q.marks} pts
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isGraded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isGraded ? `${ans?.manual_score || 0} / ${q.marks} pts` : 'Pending Grade'}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {q.question_text}
              </h3>

              {/* Objective options detail */}
              {isObjective && (
                <div className="space-y-2 pt-1 text-xs">
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Your selection: </span>
                    <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {selectedOption?.option_text || 'None selected'}
                    </span>
                  </p>
                  {!isCorrect && correctOption && (
                    <p className="text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 font-medium">
                      ✓ Correct Answer: <span className="font-bold">{correctOption.option_text}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Essay handwritten preview & feedback */}
              {q.type === 'essay' && (
                <div className="space-y-3 pt-1">
                  {ans?.uploaded_file_path ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {ans.uploaded_file_name || 'Handwritten_Solution.png'}
                          </p>
                          <p className="text-[10px] text-slate-400">Attached student document</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const file = db.getFileByPath(ans.uploaded_file_path!);
                          if (file?.dataUrl) {
                            window.open(file.dataUrl, '_blank');
                          } else {
                            db.downloadFile(ans.uploaded_file_path!);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Answer Sheet</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-500 italic">No answer sheet was uploaded for this question.</p>
                  )}

                  {ans?.feedback && (
                    <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs text-orange-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-orange-800">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <span>Instructor Rubric & Feedback:</span>
                      </div>
                      <p className="leading-relaxed pl-5 font-normal">
                        "{ans.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
