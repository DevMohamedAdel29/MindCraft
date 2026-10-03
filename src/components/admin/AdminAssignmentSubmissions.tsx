import React, { useState } from 'react';

import { db } from '../../services/db';

import { AssignmentSubmission } from '../../types/database';

import { useNotifications } from '../../context/NotificationContext';

import {
  FolderKanban,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Award,
  X,
  FileCheck
} from 'lucide-react';


interface Props {
  initialAssignmentId?: string;
}


export const AdminAssignmentSubmissions: React.FC<Props> = ({
  initialAssignmentId
}) => {
  const { showToast } = useNotifications();

  const [search, setSearch] = useState('');

  const [selectedAssignmentId,setSelectedAssignmentId] =
    useState<string>(initialAssignmentId || 'all');

  const [selectedStatus, setSelectedStatus] =
    useState<string>('all');

  const [activeGradingSub, setActiveGradingSub] =
    useState<AssignmentSubmission | null>(null);

  // Form states for grading
  const [gradeInput, setGradeInput] = useState<number>(0);

  const [feedbackInput, setFeedbackInput] =
    useState<string>('');

  const [saving, setSaving] = useState(false);


  const submissions = db.getAssignmentSubmissions();

  const assignments = db.getAssignments();

  const profiles = db.getProfiles();


  const filteredSubmissions = submissions.filter(sub => {
    const student = profiles.find(
      p => p.id === sub.student_id
    );

    const assignment = assignments.find(
      a => a.id === sub.assignment_id
    );

    const matchesSearch =
      (
        student?.full_name
          .toLowerCase()
          .includes(search.toLowerCase()) ?? false
      ) ||
      (
        student?.student_id
          ?.toLowerCase()
          .includes(search.toLowerCase()) ?? false
      ) ||
      (
        assignment?.title
          .toLowerCase()
          .includes(search.toLowerCase()) ?? false
      );

    const matchesAssignment =
      selectedAssignmentId === 'all' ||
      sub.assignment_id === selectedAssignmentId;

    const matchesStatus =
      selectedStatus === 'all' ||
      sub.status === selectedStatus;

    return matchesSearch && matchesAssignment && matchesStatus;
  });


const handleOpenGrading = async (
  sub: AssignmentSubmission
) => {
  try {
    await db.hydrateFromSupabase();

    const freshSubmission =
      db.getAssignmentSubmission(sub.id);

    if (!freshSubmission) {
      throw new Error(
        'Submission could not be loaded.'
      );
    }

    setActiveGradingSub(
      freshSubmission
    );

    setGradeInput(
      freshSubmission.grade !== null &&
      freshSubmission.grade !== undefined
        ? freshSubmission.grade
        : 0
    );

    setFeedbackInput(
      freshSubmission.feedback || ''
    );

  } catch (err: any) {
    console.error(
      'Failed to open assignment submission:',
      err
    );

    showToast({
      type: 'error',
      title: 'Unable to Load Submission',
      message:
        err?.message ||
        'Could not load the latest submission.'
    });
  }
};


  const handleSaveGrade = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!activeGradingSub) return;

    setSaving(true);

    try {
      const updatedSubmission =
        await db.gradeAssignmentSubmission(
          activeGradingSub.id,
          Number(gradeInput),
          feedbackInput.trim()
        );

      showToast({
        type: 'success',
        title: 'Assignment Graded! 📝',
        message: `Grade of ${updatedSubmission.grade} awarded. Student has been notified.`
      });

      setActiveGradingSub(null);

    } catch (err: any) {
      console.error(
        'Assignment grading failed:',
        err
      );

      showToast({
        type: 'error',
        title: 'Grading Error',
        message:
          err?.message ||
          'Could not save the grade to Supabase.'
      });

    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Assignment Submissions & Grading
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review coursework files, download student project archives,
          award points, and post actionable rubric remarks.
        </p>
      </div>


      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-3">

        <div className="relative flex-1 w-full">

          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, ID, or assignment..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
          />

        </div>


        <div className="flex items-center gap-2 w-full md:w-auto">

          {/* Assignment dropdown */}
          <select
            value={selectedAssignmentId}
            onChange={e =>
              setSelectedAssignmentId(e.target.value)
            }
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
          >

            <option value="all">
              All Assignments
            </option>

            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}

          </select>


          {/* Status dropdown */}
          <select
            value={selectedStatus}
            onChange={e =>
              setSelectedStatus(e.target.value)
            }
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
          >

            <option value="all">
              All Statuses
            </option>

            <option value="submitted">
              Submitted (Needs Grade)
            </option>

            <option value="late">
              Late Submission
            </option>

            <option value="graded">
              Graded
            </option>

          </select>

        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead>

              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">

                <th className="py-4 px-6">
                  Student
                </th>

                <th className="py-4 px-6">
                  Student ID
                </th>

                <th className="py-4 px-6">
                  Assignment
                </th>

                <th className="py-4 px-6">
                  Submitted File
                </th>

                <th className="py-4 px-6">
                  Submitted Date
                </th>

                <th className="py-4 px-6">
                  Status
                </th>

                <th className="py-4 px-6">
                  Grade
                </th>

                <th className="py-4 px-6 text-right">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100 text-slate-700">

              {filteredSubmissions.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-12 text-center text-slate-400"
                  >
                    No matching coursework submissions found.
                  </td>

                </tr>

              ) : (

                filteredSubmissions.map(sub => {

                  const student = profiles.find(
                    p => p.id === sub.student_id
                  );

                  const asg = assignments.find(
                    a => a.id === sub.assignment_id
                  );

                  const isGraded =
                    sub.status === 'graded';


                  return (

                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >

                      <td className="py-4 px-6 font-bold text-slate-900">

                        <div className="flex items-center gap-2">

                          <img
                            src={
                              student?.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                            }
                            alt="Avatar"
                            className="w-6 h-6 rounded-full object-cover"
                          />

                          <span>
                            {student?.full_name || 'Student'}
                          </span>

                        </div>

                      </td>


                      <td className="py-4 px-6 font-mono text-slate-600">
                        {student?.student_id || '—'}
                      </td>


                      <td className="py-4 px-6 font-medium text-slate-800">
                        {asg?.title || 'Assignment'}
                      </td>


                      <td className="py-4 px-6">

                        <button
                          onClick={() =>
                            db.downloadFile(
                              sub.file_path,
                              sub.file_name
                            )
                          }
                          className="text-orange-600 hover:underline flex items-center gap-1 font-medium truncate max-w-xs"
                          title="Click to download submission"
                        >

                          <Download className="w-3.5 h-3.5 shrink-0" />

                          <span className="truncate">
                            {sub.file_name}
                          </span>

                        </button>

                      </td>


                      <td className="py-4 px-6 text-slate-500">

                        {new Date(
                          sub.submitted_at
                        ).toLocaleDateString()}

                      </td>


                      <td className="py-4 px-6">

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                            isGraded
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >

                          {isGraded ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}

                          {sub.status}

                        </span>

                      </td>


                      <td className="py-4 px-6 font-bold text-slate-900">

                        {sub.grade !== null &&
                        sub.grade !== undefined ? (

                          `${sub.grade} / ${asg?.max_grade || 100}`

                        ) : (

                          <span className="text-slate-400 font-normal italic">
                            Pending
                          </span>

                        )}

                      </td>


                      <td className="py-4 px-6 text-right">

                        <div className="flex items-center justify-end gap-1.5">

                          <button
                            onClick={() =>
                              db.downloadFile(
                                sub.file_path,
                                sub.file_name
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Download Solution"
                          >

                            <Download className="w-4 h-4" />

                          </button>


                          <button
                            onClick={() =>
                              handleOpenGrading(sub)
                            }
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all ${
                              isGraded
                                ? 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                            }`}
                          >

                            <Award className="w-3.5 h-3.5" />

                            <span>
                              {isGraded
                                ? 'Edit Grade'
                                : 'Grade'}
                            </span>

                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* Assignment Grading Modal */}
      {activeGradingSub && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">

          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <h3 className="text-base font-bold text-slate-900">
                Grade Coursework Submission
              </h3>

              <button
                onClick={() =>
                  setActiveGradingSub(null)
                }
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close dialog"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* Student & Assignment Information */}
            {(() => {

              const student = profiles.find(
                p =>
                  p.id ===
                  activeGradingSub.student_id
              );

              const asg = assignments.find(
                a =>
                  a.id ===
                  activeGradingSub.assignment_id
              );

              const maxGrade =
                asg?.max_grade || 100;


              return (

                <form
                  onSubmit={handleSaveGrade}
                  className="space-y-4"
                >

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">

                    <div className="flex items-center justify-between">

                      <span className="text-slate-500">
                        Student:
                      </span>

                      <span className="font-bold text-slate-900">
                        {student?.full_name}{' '}
                        ({student?.student_id})
                      </span>

                    </div>


                    <div className="flex items-center justify-between">

                      <span className="text-slate-500">
                        Assignment:
                      </span>

                      <span className="font-bold text-slate-900">
                        {asg?.title}
                      </span>

                    </div>


                    <div className="flex items-center justify-between">

                      <span className="text-slate-500">
                        Submission Date:
                      </span>

                      <span className="text-slate-700">

                        {new Date(
                          activeGradingSub.submitted_at
                        ).toLocaleString()}

                      </span>

                    </div>

                  </div>


                  {/* Submitted file & download */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">

                    <div className="flex items-center gap-2.5 truncate">

                      <FileCheck className="w-5 h-5 text-orange-500 shrink-0" />

                      <div className="truncate">

                        <p className="text-xs font-bold text-slate-900 truncate">
                          {activeGradingSub.file_name}
                        </p>

                        <p className="text-[10px] text-slate-400">

                          {(
                            activeGradingSub.file_size
                              ? (
                                  activeGradingSub.file_size /
                                  1024
                                ).toFixed(1)
                              : '150.0'
                          )}{' '}
                          KB •{' '}
                          {activeGradingSub.file_type ||
                            'Document'}

                        </p>

                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        db.downloadFile(
                          activeGradingSub.file_path,
                          activeGradingSub.file_name
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center gap-1 shrink-0"
                    >

                      <Download className="w-3.5 h-3.5" />

                      <span>
                        Download File
                      </span>

                    </button>

                  </div>


                  {/* Grade input */}
                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Awarded Grade (Score)
                    </label>

                    <div className="flex items-center gap-2">

                      <input
                        type="number"
                        min={0}
                        max={maxGrade}
                        value={gradeInput}
                        onChange={e =>
                          setGradeInput(
                            Math.min(
                              maxGrade,
                              Math.max(
                                0,
                                Number(e.target.value)
                              )
                            )
                          )
                        }
                        className="w-32 p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        required
                      />

                      <span className="text-xs font-bold text-slate-500">
                        / {maxGrade} Maximum Points
                      </span>

                    </div>

                  </div>


                  {/* Feedback input */}
                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Instructor Feedback & Rubric Notes
                    </label>

                    <textarea
                      rows={4}
                      value={feedbackInput}
                      onChange={e =>
                        setFeedbackInput(
                          e.target.value
                        )
                      }
                      placeholder="Provide actionable feedback on architecture, efficiency, correctness, code style, or analysis..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
                    />

                  </div>


                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">

                    <button
                      type="button"
                      onClick={() =>
                        setActiveGradingSub(null)
                      }
                      disabled={saving}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-50"
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
                    >

                      {saving
                        ? 'Saving...'
                        : 'Save & Publish Grade'}

                    </button>

                  </div>

                </form>
              );
            })()}

          </div>

        </div>

      )}

    </div>
  );
};