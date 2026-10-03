import React, { useState } from 'react';
import { db } from '../../services/db';
import { ExamAttempt, Question } from '../../types/database';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText, 
  X, 
  Sparkles, 
  Download, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface Props {
  initialAttemptId?: string;
}

export const AdminExamSubmissions: React.FC<Props> = ({ initialAttemptId }) => {
  const { showToast } = useNotifications();

  const [search, setSearch] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeReviewAttemptId, setActiveReviewAttemptId] = useState<string | null>(initialAttemptId || null);

  // Active essay grading state in modal
  const [essayScores, setEssayScores] = useState<Record<string, number>>({});
  const [essayFeedbacks, setEssayFeedbacks] = useState<Record<string, string>>({});
  const [isFinalizing, setIsFinalizing] = useState(false);

  const attempts = db.getAttempts();
  const exams = db.getExams();
  const profiles = db.getProfiles();

  // Filter logic
  const filteredAttempts = attempts.filter(att => {
    const student = profiles.find(p => p.id === att.student_id);
    const exam = exams.find(e => e.id === att.exam_id);

    const matchesSearch = 
      (student?.full_name.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (student?.student_id?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (exam?.title.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesExam = selectedExamId === 'all' || att.exam_id === selectedExamId;
    const matchesStatus = selectedStatus === 'all' || att.status === selectedStatus;

    return matchesSearch && matchesExam && matchesStatus;
  });
const handleOpenReview = async (
  att: ExamAttempt
) => {
  try {
    // Reload the latest attempts + answers from Supabase
    await db.hydrateFromSupabase();
    console.log('NEW REVIEW CODE IS RUNNING');

    // Get the refreshed attempt from the updated cache
    const freshAttempt = db.getAttempt(att.id);

    if (!freshAttempt) {
      throw new Error(
        'Could not load the student submission.'
      );
    }

    const scores: Record<string, number> = {};
    const feedbacks: Record<string, string> = {};

    freshAttempt.answers?.forEach(ans => {
      if (
        ans.manual_score !== undefined &&
        ans.manual_score !== null
      ) {
        scores[ans.question_id] =
          ans.manual_score;
      }

      if (ans.feedback) {
        feedbacks[ans.question_id] =
          ans.feedback;
      }
    });

    setEssayScores(scores);
    setEssayFeedbacks(feedbacks);

    // Open only AFTER fresh data has loaded
    setActiveReviewAttemptId(
      freshAttempt.id
    );

  } catch (err: any) {
    console.error(
      'Failed to load latest submission:',
      err
    );

    showToast({
      type: 'error',
      title: 'Unable to Load Submission',
      message:
        err?.message ||
        'Could not load the latest student answers.'
    });
  }
};

const handleFinalizeGrade = async (att: ExamAttempt) => {
  setIsFinalizing(true);

  try {
    const exam = db.getExam(att.exam_id);

    const questions =
      exam?.questions ||
      db.getQuestionsForExam(att.exam_id);

    const essayQuestions = questions.filter(
      q => q.type === 'essay'
    );

    for (const q of essayQuestions) {
      const score = essayScores[q.id] ?? 0;
      const feedback =
        essayFeedbacks[q.id] ?? '';

      await db.gradeEssayAnswer(
        att.id,
        q.id,
        score,
        feedback
      );
    }

    const finalized =
      await db.finalizeExamAttempt(att.id);

    showToast({
      type: 'success',
      title: 'Grade Finalized & Published! 🎓',
      message:
        `Total score: ${finalized.final_score} pts. Student has been notified.`
    });

    setActiveReviewAttemptId(null);

  } catch (err: any) {
    console.error(
      'Failed to finalize exam grade:',
      err
    );

    showToast({
      type: 'error',
      title: 'Grading Error',
      message:
        err?.message ||
        'Could not finalize grading.'
    });

  } finally {
    setIsFinalizing(false);
  }
};

  // Active attempt for inspection
  const activeAttempt = activeReviewAttemptId ? db.getAttempt(activeReviewAttemptId) : null;
  const activeExam = activeAttempt ? db.getExam(activeAttempt.exam_id) : null;
  const activeStudent = activeAttempt ? db.getProfile(activeAttempt.student_id) : null;
  const activeQuestions = activeExam?.questions || (activeAttempt ? db.getQuestionsForExam(activeAttempt.exam_id) : []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Exam Submissions & Grading</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review automated objective question marks, inspect handwritten essay solution sheets, and award verified grades.
        </p>
      </div>

      {/* Filter Bar (Section 25) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, ID, or exam..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Filter by Exam */}
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
          >
            <option value="all">All Exams</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Needs Review (Submitted)</option>
            <option value="graded">Graded & Published</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Student ID</th>
                <th className="py-4 px-6">Exam</th>
                <th className="py-4 px-6">Submission Date</th>
                <th className="py-4 px-6">Auto Score</th>
                <th className="py-4 px-6">Final Score</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching exam submissions found.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map(att => {
                  const student = profiles.find(p => p.id === att.student_id);
                  const exam = exams.find(e => e.id === att.exam_id);
                  const isGraded = att.status === 'graded';

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <img
                            src={student?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                            alt="Avatar"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span>{student?.full_name || 'Student'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">
                        {student?.student_id || '—'}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {exam?.title || 'Exam'}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'In Session'}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-700">
                        {att.auto_score} pts
                      </td>
                      <td className="py-4 px-6 font-black text-slate-900">
                        {att.final_score} / {exam?.total_marks || 100}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                            isGraded
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'submitted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isGraded ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isGraded ? 'Graded' : att.status === 'submitted' ? 'Needs Review' : 'In Progress'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenReview(att)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all ${
                            isGraded
                              ? 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isGraded ? 'View Review' : 'Grade Essays'}</span>
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

      {/* Full Exam Review & Essay Grading Drawer / Modal (Section 26) */}
      {activeAttempt && activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  Submission Assessment
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{activeExam.title}</h2>
                <p className="text-xs text-slate-500">
                  Student: <strong className="text-slate-800">{activeStudent?.full_name}</strong> ({activeStudent?.student_id}) • Submitted: {activeAttempt.submitted_at ? new Date(activeAttempt.submitted_at).toLocaleString() : 'Recent'}
                </p>
              </div>

              <button
                onClick={() => setActiveReviewAttemptId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score summary pill */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Auto Score (MCQ/TF):</span>
                <span className="font-bold text-slate-900 ml-1.5">{activeAttempt.auto_score} pts</span>
              </div>
              <div>
                <span className="text-slate-500">Manual Essay Score:</span>
                <span className="font-bold text-orange-600 ml-1.5">
                  {Object.values(essayScores).reduce((a, b) => a + (Number(b) || 0), 0)} pts
                </span>
              </div>
              <div>
                <span className="text-slate-500">Total Exam Target:</span>
                <span className="font-black text-slate-900 ml-1.5">{activeExam.total_marks} pts</span>
              </div>
            </div>

            {/* Questions review */}
            <div className="space-y-6">
              {activeQuestions.map((q, idx) => {
                const ans = activeAttempt.answers?.find(a => a.question_id === q.id);
                const isObjective = q.type === 'multiple_choice' || q.type === 'true_false';
                const selectedOption = q.options?.find(opt => opt.id === ans?.selected_option_id);
                const correctOption = q.options?.find(opt => opt.is_correct);
                const isCorrect = isObjective && selectedOption?.is_correct === true;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200 space-y-3 bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Question {idx + 1} ({q.type.replace('_', ' ')}) • Max: {q.marks} pts
                      </span>
                      {isObjective ? (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isCorrect ? `+${q.marks} pts (Auto)` : '0 pts (Incorrect)'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                          Essay Requires Manual Score
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {q.question_text}
                    </p>

                    {/* Objective answers */}
                    {isObjective && (
                      <div className="text-xs space-y-1 text-slate-600">
                        <p>
                          Student Choice: <strong className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{selectedOption?.option_text || 'Unanswered'}</strong>
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-700 font-semibold">
                            Correct Answer: {correctOption?.option_text}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Essay answer sheet preview & manual grading fields (Section 26) */}
                    {q.type === 'essay' && (
                      <div className="space-y-4 pt-2 border-t border-slate-100">
                        {/* Student Document */}
                        {ans?.uploaded_file_path ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-5 h-5 text-orange-500" />
                              <div>
                                <p className="text-xs font-bold text-slate-800">
                                  {ans.uploaded_file_name || 'Handwritten_Solution.png'}
                                </p>
                                <p className="text-[10px] text-slate-400">Attached student handwritten scan</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const file = db.getFileByPath(ans.uploaded_file_path!);
                                if (file?.dataUrl) {
                                  window.open(file.dataUrl, '_blank');
                                } else {
                                  db.downloadFile(ans.uploaded_file_path!);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Inspect Document</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                            No handwritten document was attached for this essay question.
                          </div>
                        )}

                        {/* Grading Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                          <div className="sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Awarded Score
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                max={q.marks}
                                value={essayScores[q.id] ?? ans?.manual_score ?? 0}
                                onChange={e => {
                                  const val = Math.min(q.marks, Math.max(0, Number(e.target.value)));
                                  setEssayScores(prev => ({ ...prev, [q.id]: val }));
                                }}
                                className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-orange-500 outline-none"
                              />
                              <span className="text-xs font-bold text-slate-400">/ {q.marks}</span>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Teacher Feedback & Remarks
                            </label>
                            <input
                              type="text"
                              value={essayFeedbacks[q.id] ?? ans?.feedback ?? ''}
                              onChange={e => {
                                const val = e.target.value;
                                setEssayFeedbacks(prev => ({ ...prev, [q.id]: val }));
                              }}
                              placeholder="e.g. Accurate derivation and clear diagrams. Well explained."
                              className="w-full p-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-1 focus:ring-orange-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveReviewAttemptId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Close Without Saving
              </button>

              <button
                type="button"
                disabled={isFinalizing}
                onClick={() => handleFinalizeGrade(activeAttempt)}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isFinalizing ? 'Finalizing...' : 'Finalize & Publish Grade'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
