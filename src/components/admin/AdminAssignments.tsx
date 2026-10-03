import React, { useState, useRef } from 'react';
import { db } from "../../services/db";
import { Assignment, GRADE_LEVELS } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FolderKanban, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Calendar, 
  Award, 
  X, 
  UploadCloud, 
  FileCheck, 
  Users,
  GraduationCap
} from 'lucide-react';

interface Props {
  onViewSubmissions: (assignmentId?: string) => void;
}

export const AdminAssignments: React.FC<Props> = ({ onViewSubmissions }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [assignments, setAssignments] = useState<Assignment[]>(db.getAssignments());
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetGrade, setTargetGrade] = useState('All Grades');
  const [dueDate, setDueDate] = useState('');
  const [maxGrade, setMaxGrade] = useState(100);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshList = () => {
    setAssignments(db.getAssignments());
  };

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setTitle('');
    setDescription('');
    setTargetGrade('All Grades');
    // Default 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().slice(0, 16));
    setMaxGrade(100);
    setStatus('published');
    setBriefFile(null);
    setShowModal(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setTitle(asg.title);
    setDescription(asg.description);
    setTargetGrade(asg.target_grade || 'All Grades');
    setDueDate(new Date(asg.due_date).toISOString().slice(0, 16));
    setMaxGrade(asg.max_grade);
    setStatus(asg.status === 'published' ? 'published' : 'draft');
    setBriefFile(null);
    setShowModal(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
  e?.preventDefault();

  console.log('HANDLE SAVE IS RUNNING');

  console.log('CREATE ASSIGNMENT SUBMIT FIRED');
  console.log('FORM VALUES:', {
  title,
  description,
  dueDate,
  maxGrade,
  editingAssignment,
  briefFile,
  user
});
console.log('BRIEF FILE NAME:', briefFile?.name);
console.log('ADMIN USER ID:', user?.id);
console.log('BEFORE TRY');

  if (!title.trim()) {
    showToast({
      type: 'error',
      title: 'Missing Title',
      message: 'Please enter an assignment title.'
    });
    return;
  }

  if (!description.trim()) {
    showToast({
      type: 'error',
      title: 'Missing Description',
      message: 'Please enter the assignment description.'
    });
    return;
  }

  if (!dueDate) {
    showToast({
      type: 'error',
      title: 'Missing Due Date',
      message: 'Please select a due date and time.'
    });
    return;
  }

  if (!maxGrade || Number(maxGrade) <= 0) {
    showToast({
      type: 'error',
      title: 'Invalid Maximum Grade',
      message: 'Maximum marks must be greater than 0.'
    });
    return;
  }

  try {
    console.log('INSIDE TRY');
    let filePath = editingAssignment?.file_path;
    let fileName = editingAssignment?.file_name;

    if (briefFile) {
      if (!user) {
        throw new Error('Admin account was not found.');
      }
      console.log('BEFORE UPLOAD');

      const uploadRes = await db.uploadFile(
        'assignment-files',
        briefFile,
        user.id
      );
      console.log('AFTER UPLOAD:', uploadRes);

      filePath = uploadRes.path;
      fileName = briefFile.name;
    }

    if (editingAssignment) {
      await db.updateAssignment(
        editingAssignment.id,
        {
          title: title.trim(),
          description: description.trim(),
          target_grade: targetGrade,
          due_date: new Date(dueDate).toISOString(),
          max_grade: Number(maxGrade),
          status,
          file_path: filePath,
          file_name: fileName
        }
      );

      showToast({
        type: 'success',
        title: 'Assignment Updated',
        message: `"${title}" was updated successfully.`
      });

    } else {
      const created = await db.createAssignment({
        title: title.trim(),
        description: description.trim(),
        target_grade: targetGrade,
        due_date: new Date(dueDate).toISOString(),
        max_grade: Number(maxGrade),
        status,
        created_by: user?.id,
        file_path: filePath,
        file_name: fileName
      });

      console.log('ASSIGNMENT CREATED:', created);

      showToast({
        type: 'success',
        title: 'Assignment Created! ✅',
        message: `"${created.title}" was saved to Supabase.`
      });
    }

    await db.hydrateFromSupabase();

    refreshList();

    setShowModal(false);
    setBriefFile(null);

  } catch (err: any) {
    console.error('CREATE ASSIGNMENT ERROR:', err);

    showToast({
      type: 'error',
      title: 'Unable to Create Assignment',
      message:
        err?.message ||
        'Supabase could not save the assignment.'
    });
  }
};

const confirmDeleteAssignment = async () => {
  if (!assignmentToDelete) return;

  try {
    const deletedTitle =
      assignmentToDelete.title;

    await db.deleteAssignment(
      assignmentToDelete.id
    );

    await db.hydrateFromSupabase();

    refreshList();

    setAssignmentToDelete(null);

    showToast({
      type: 'success',
      title: 'Assignment Deleted',
      message:
        `Assignment "${deletedTitle}" was removed.`
    });

  } catch (err: any) {
    console.error(
      'Assignment deletion failed:',
      err
    );

    showToast({
      type: 'error',
      title: 'Delete Failed',
      message:
        err?.message ||
        'Could not delete the assignment.'
    });
  }
};
  const handleTogglePublish = async (
  asg: Assignment
) => {
  const next =
    asg.status === 'published'
      ? 'draft'
      : 'published';

  try {
    await db.updateAssignment(
      asg.id,
      {
        status: next
      }
    );

    await db.hydrateFromSupabase();

    refreshList();

    showToast({
      type: 'success',
      title: 'Status Updated',
      message:
        `Assignment set to ${next}.`
    });

  } catch (err: any) {
    console.error(
      'Assignment status update failed:',
      err
    );

    showToast({
      type: 'error',
      title: 'Unable to Update Status',
      message:
        err?.message ||
        'The assignment status could not be updated.'
    });
  }
};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assignment Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish coursework projects, attach specification briefs, set deadlines, and inspect submissions.
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
              <option value="All">All Grades ({assignments.length})</option>
              {GRADE_LEVELS.map(g => {
                const count = assignments.filter(a => a.target_grade === g).length;
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
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* Grid of assignments or Empty State */}
      {assignments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-xs">
            <Plus className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-black text-slate-900">No Assignments in Database</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your curriculum assignments catalog is clear. Click below to author your first assignment coursework, upload specification briefs, and set due dates.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md shadow-[#FF7A00]/25 inline-flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Assignment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments
            .filter(a => filterGrade === 'All' || a.target_grade === filterGrade || (!a.target_grade && filterGrade === 'All'))
            .map(asg => {
            const submissions = db.getAssignmentSubmissions().filter(s => s.assignment_id === asg.id);

            return (
              <div
                key={asg.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          asg.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {asg.status}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 border border-purple-200 text-purple-700 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-purple-600" />
                        <span>{asg.target_grade || 'All Grades'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(asg)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Assignment"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setAssignmentToDelete(asg)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {asg.description}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>Due: {new Date(asg.due_date).toLocaleDateString()}</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    Max: {asg.max_grade} pts
                  </span>
                </div>

                {asg.file_name && (
                  <button
                    onClick={() => db.downloadFile(asg.file_path || '', asg.file_name || undefined)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">Brief: {asg.file_name}</span>
                  </button>
                )}
              </div>

              {/* Submissions link and toggle status */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onViewSubmissions(asg.id)}
                  className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Student Submissions ({submissions.length})</span>
                </button>

                <button
                  onClick={() => handleTogglePublish(asg)}
                  className="w-full py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-bold text-[11px] transition-colors"
                >
                  {asg.status === 'published' ? 'Switch to Draft' : 'Publish to Students'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Create / Edit Modal (Section 27) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
             <button
  type="button"
  onClick={() => handleSave()}
  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
>
  {editingAssignment ? 'Save Changes' : 'Create Assignment'}
</button>
            </div>
            <form
  onSubmit={handleSave}
  noValidate
  className="space-y-4"
>

             
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Project 1: Memory Manager in C++"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Requirements
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailed guidelines and requirements..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 resize-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Target Student Grade
                  </label>
                  <span className="text-[10px] text-amber-600 font-semibold">Only enrolled students in this grade can view & submit</span>
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
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxGrade}
                    onChange={e => setMaxGrade(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Specification File upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specification Brief Document (PDF/DOCX)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.docx,.doc,.zip"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setBriefFile(f);
                  }}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-slate-300 hover:border-orange-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-orange-50/20 transition-colors"
                >
                  <UploadCloud className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-bold text-slate-700">
                    {briefFile ? briefFile.name : editingAssignment?.file_name ? `Current: ${editingAssignment.file_name} (Click to replace)` : 'Attach Specification Document'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF or Word file for students to download</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Publication Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['draft', 'published'] as const).map(st => (
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
                >
                  {editingAssignment ? 'Save Changes' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Assignment Confirmation Modal */}
      {assignmentToDelete && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Assignment</h3>
                <p className="text-xs text-slate-500">Permanent database action</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900 text-xs space-y-1.5">
              <p className="font-bold">Are you sure you want to permanently delete:</p>
              <p className="text-rose-800 font-semibold text-sm">"{assignmentToDelete.title}"</p>
              <p className="text-[11px] text-rose-600 pt-1 leading-relaxed">
                This will delete the coursework record and all student submissions for this assignment from the database. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignmentToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAssignment}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
