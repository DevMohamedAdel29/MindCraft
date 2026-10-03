import React, { useState } from 'react';
import { db } from '../../services/db';
import { Exam, GRADE_LEVELS } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FileQuestion, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Sliders, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Archive, 
  X,
  Send,
  GraduationCap
} from 'lucide-react';

interface Props {
  onOpenQuestionBuilder: (examId: string) => void;
}

export const AdminExams: React.FC<Props> = ({ onOpenQuestionBuilder }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [exams, setExams] = useState<Exam[]>(db.getExams());
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetGrade, setTargetGrade] = useState('All Grades');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalMarks, setTotalMarks] = useState(100);
  const [status, setStatus] = useState<'draft' | 'published' | 'closed'>('draft');

  const refreshList = () => {
    setExams(db.getExams());
  };

  const handleOpenCreate = () => {
    setEditingExam(null);
    setTitle('');
    setDescription('');
    setTargetGrade('All Grades');
    setDurationMinutes(30);
    setTotalMarks(100);
    setStatus('draft');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description);
    setTargetGrade(exam.target_grade || 'All Grades');
    setDurationMinutes(exam.duration_minutes);
    setTotalMarks(exam.total_marks);
    setStatus(exam.status);
    setShowCreateModal(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingExam) {
      await db.updateExam(editingExam.id, {
        title: title.trim(),
        description: description.trim(),
        target_grade: targetGrade,
        duration_minutes: Number(durationMinutes),
        total_marks: Number(totalMarks),
        status
      });
      showToast({ type: 'success', title: 'Exam Updated', message: `Saved changes to "${title}". Target: ${targetGrade}` });
    } else {
      const newExam = await db.createExam({
        title: title.trim(),
        description: description.trim(),
        target_grade: targetGrade,
        duration_minutes: Number(durationMinutes),
        total_marks: Number(totalMarks),
        status,
        created_by: user?.id
      });
      showToast({ type: 'success', title: 'Exam Created', message: `Created exam "${title}" for ${targetGrade}. Add questions next!` });
      onOpenQuestionBuilder(newExam.id);
    }

    setShowCreateModal(false);
    refreshList();
  };
const confirmDeleteExam = async () => {
  if (!examToDelete) return;

  try {
    await db.deleteExam(examToDelete.id);

    showToast({
      type: 'info',
      title: 'Exam Deleted',
      message: `Exam "${examToDelete.title}" and its questions were removed from the database.`
    });

    setExamToDelete(null);
    refreshList();
  } catch (error) {
    console.error(
      'Failed to delete exam:',
      error
    );

    showToast({
      type: 'error',
      title: 'Delete Failed',
      message: 'Could not delete the exam.'
    });
  }
};
  const handleDuplicate = async (examId: string) => {
  try {
    const dup = await db.duplicateExam(examId);

    showToast({
      type: 'success',
      title: 'Exam Duplicated',
      message: `Created copy: "${dup.title}"`
    });

    refreshList();
  } catch (error) {
    console.error('Failed to duplicate exam:', error);

    showToast({
      type: 'error',
      title: 'Duplicate Failed',
      message: 'Could not duplicate the exam.'
    });
  }
};
const handleToggleStatus = async (
  exam: Exam,
  newStatus: 'draft' | 'published' | 'closed'
) => {
  try {
    await db.updateExam(exam.id, {
      status: newStatus
    });

    showToast({
      type: 'success',
      title: 'Status Updated',
      message: `Exam status changed to ${newStatus}.`
    });

    refreshList();
  } catch (error) {
    console.error(
      'Failed to update exam status:',
      error
    );

    showToast({
      type: 'error',
      title: 'Update Failed',
      message: 'Could not update exam status.'
    });
  }
};
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Exam Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author assessments, manage dynamic question sets, configure timers, and publish to students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <GraduationCap className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-500">Filter Grade:</span>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="All">All Grades ({exams.length})</option>
              {GRADE_LEVELS.map(g => {
                const count = exams.filter(e => e.target_grade === g).length;
                return (
                  <option key={g} value={g}>
                    {g} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 inline-flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Exam</span>
          </button>
        </div>
      </div>

      {/* Grid of Exams or Empty State */}
      {exams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF7A00] border border-orange-100 flex items-center justify-center mx-auto shadow-xs">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-black text-slate-900">No Examinations in Database</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your database has zero tests. Click below to author your first assessment, configure the timer, set total marks, and add questions.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md shadow-[#FF7A00]/25 inline-flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Exam</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams
            .filter(e => filterGrade === 'All' || e.target_grade === filterGrade || (!e.target_grade && filterGrade === 'All'))
            .map(exam => {
            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          exam.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : exam.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {exam.status}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 border border-purple-200 text-purple-700 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-purple-600" />
                        <span>{exam.target_grade || 'All Grades'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(exam.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Duplicate Exam"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(exam)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Settings"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExamToDelete(exam)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
                  <div className="p-1.5 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Questions</p>
                    <p className="text-xs font-bold text-slate-800">{exam.question_count || 0}</p>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Duration</p>
                    <p className="text-xs font-bold text-slate-800">{exam.duration_minutes}m</p>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Marks</p>
                    <p className="text-xs font-bold text-slate-800">{exam.total_marks}</p>
                  </div>
                </div>
              </div>

              {/* Status toggles & Builder button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onOpenQuestionBuilder(exam.id)}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Build Questions ({exam.question_count || 0})</span>
                </button>

                <div className="flex items-center gap-1.5 pt-1">
                  {exam.status !== 'published' ? (
                    <button
                      onClick={() => handleToggleStatus(exam, 'published')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors"
                    >
                      Publish Exam
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(exam, 'draft')}
                      className="flex-1 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] transition-colors"
                    >
                      Unpublish
                    </button>
                  )}

                  {exam.status !== 'closed' && (
                    <button
                      onClick={() => handleToggleStatus(exam, 'closed')}
                      className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                      title="Close Exam"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Create / Edit Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingExam ? 'Edit Exam Metadata' : 'Create New Assessment'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Midterm: Data Structures & Algorithms"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Instructions
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Instructions for students taking this exam..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Target Student Grade
                  </label>
                  <span className="text-[10px] text-amber-600 font-semibold">Only enrolled students in this grade can take it</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4 text-orange-500" />
                  </div>
                  <select
                    value={targetGrade}
                    onChange={e => setTargetGrade(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 transition-all cursor-pointer appearance-none"
                  >
                    <option value="All Grades">All Grades (Open to every grade level)</option>
                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>
                        {g} Only
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Marks Target
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={totalMarks}
                    onChange={e => setTotalMarks(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['draft', 'published', 'closed'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`p-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                        status === st
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
                >
                  {editingExam ? 'Save Changes' : 'Proceed to Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Examination</h3>
                <p className="text-xs text-slate-500">Permanent database action</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900 text-xs space-y-1.5">
              <p className="font-bold">Are you sure you want to permanently delete:</p>
              <p className="text-rose-800 font-semibold text-sm">"{examToDelete.title}"</p>
              <p className="text-[11px] text-rose-600 pt-1 leading-relaxed">
                This will delete the exam record, its {examToDelete.question_count || 0} questions, and all submitted student attempts from the database. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteExam}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
