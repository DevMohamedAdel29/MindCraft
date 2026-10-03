import React, { useState, useRef } from 'react';

import { useAuth } from '../../context/AuthContext';

import { useNotifications } from '../../context/NotificationContext';

import { db } from '../../services/db';

import { Assignment } from '../../types/database';

import confetti from 'canvas-confetti';

import {
  FolderKanban,
  Download,
  UploadCloud,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Calendar,
  FileCheck,
  Award,
  GraduationCap
} from 'lucide-react';


export const StudentAssignments: React.FC = () => {
  const { user } = useAuth();

  const { showToast } = useNotifications();

  const [activeUploadAssignment, setActiveUploadAssignment] =
    useState<Assignment | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);


  const assignments =
    db.getAssignments(
      'student',
      user?.grade_level
    );

  const submissions =
    user
      ? db.getStudentAssignmentSubmissions(user.id)
      : [];


 const handleDownloadSpec = async (
  assignment: Assignment
) => {
  try {
    if (!assignment.file_path) {
      throw new Error(
        'No assignment file is attached.'
      );
    }

    console.log(
      'ASSIGNMENT FILE PATH:',
      assignment.file_path
    );

    await db.downloadFile(
      assignment.file_path,
      assignment.file_name ||
        `${assignment.title}_Specification.pdf`
    );

    showToast({
      type: 'success',
      title: 'Download Started',
      message:
        `Downloading "${assignment.file_name || assignment.title}".`
    });

  } catch (err: any) {
    console.error(
      'ASSIGNMENT DOWNLOAD ERROR:',
      err
    );

    showToast({
      type: 'error',
      title: 'Download Failed',
      message:
        err?.message ||
        'Could not download the assignment file.'
    });
  }
};

  const handleDrop = (
    e: React.DragEvent
  ) => {
    e.preventDefault();

    setIsDragging(false);

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {
      handleFileSelected(
        e.dataTransfer.files[0]
      );
    }
  };


  const handleFileSelected = (
    file: File
  ) => {
    const validExtensions = [
      '.pdf',
      '.jpg',
      '.jpeg',
      '.png',
      '.docx',
      '.zip'
    ];

    const fileName =
      file.name.toLowerCase();

    const isValid =
      validExtensions.some(ext =>
        fileName.endsWith(ext)
      );


    if (!isValid) {
      showToast({
        type: 'error',
        title: 'Unsupported File Format',
        message:
          'Please upload a PDF, JPG, PNG, DOCX, or ZIP archive.'
      });

      return;
    }


    if (
      file.size >
      25 * 1024 * 1024
    ) {
      showToast({
        type: 'error',
        title: 'File Too Large',
        message:
          'Maximum allowed submission size is 25MB.'
      });

      return;
    }


    setSelectedFile(file);
  };


  /*
   * Student Assignment Submission
   *
   * 1. Upload the selected file to Supabase Storage.
   * 2. Wait for the upload to finish.
   * 3. Save the submission row in Supabase.
   * 4. Wait for the database insert/update to finish.
   * 5. Only then show the success message.
   */
  const handleSubmitSolution = async () => {
    if (
      !activeUploadAssignment ||
      !selectedFile ||
      !user
    ) {
      return;
    }


    setUploading(true);


    try {
      // STEP 1:
      // Upload student's solution file to
      // the student-submissions Supabase bucket.
      const uploadRes =
        await db.uploadFile(
          'student-submissions',
          selectedFile,
          user.id
        );


      // STEP 2:
      // Save submission data in Supabase.
      // IMPORTANT:
      // We await this operation so the UI
      // cannot report success before Supabase
      // actually saves the submission.
      const submission =
        await db.submitAssignment({
          assignment_id:
            activeUploadAssignment.id,

          student_id:
            user.id,

          file_path:
            uploadRes.path,

          file_name:
            selectedFile.name,

          file_size:
            selectedFile.size,

          file_type:
            selectedFile.type
        });


      console.log(
        'Assignment submission saved:',
        submission
      );


      // Celebration only after
      // Supabase succeeds.
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: {
            y: 0.6
          }
        });
      } catch {}


      showToast({
        type: 'success',
        title:
          'Assignment Submitted! 🚀',
        message:
          `Your solution for "${activeUploadAssignment.title}" was submitted successfully.`
      });


      // Close modal and reset selected file.
      setActiveUploadAssignment(null);

      setSelectedFile(null);

    } catch (err: any) {
      console.error(
        'Assignment submission failed:',
        err
      );


      showToast({
        type: 'error',
        title:
          'Submission Failed',
        message:
          err?.message ||
          'Could not save your assignment submission to Supabase.'
      });

    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Curriculum Assignments
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Download assignment specification documents,
            complete your work, and upload your project solutions.
          </p>

        </div>


        {user?.grade_level && (

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold self-start sm:self-auto shadow-xs">

            <GraduationCap className="w-4 h-4 text-blue-600" />

            <span>
              Class: {user.grade_level}
            </span>

          </div>

        )}

      </div>


      {assignments.length === 0 ? (

        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-4">

          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-xs">

            <FolderKanban className="w-8 h-8" />

          </div>


          <div className="max-w-md mx-auto space-y-1.5">

            <h3 className="text-base font-black text-slate-900">
              No Coursework Assignments
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">

              There are currently no assignments assigned to{' '}

              <strong className="text-slate-800">
                {user?.grade_level ||
                  'your grade'}
              </strong>.

              {' '}
              As soon as your instructor posts a project brief,
              it will appear here.

            </p>

          </div>

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {assignments.map(
            assignment => {

              const submission =
                submissions.find(
                  s =>
                    s.assignment_id ===
                    assignment.id
                );

              const isSubmitted =
                Boolean(submission);

              const isGraded =
                submission?.status ===
                'graded';

              const isLate =
                submission?.status ===
                'late';

              const isPastDue =
                new Date() >
                new Date(
                  assignment.due_date
                );


              return (

                <div
                  key={assignment.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >

                  <div className="space-y-4">


                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-1.5">

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                          Coursework
                        </span>


                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">

                          <GraduationCap className="w-3 h-3 text-purple-600" />

                          {
                            assignment.target_grade ||
                            'All Grades'
                          }

                        </span>

                      </div>


                      {isGraded ? (

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">

                          <CheckCircle2 className="w-3 h-3" />

                          Graded:{' '}
                          {submission.grade}/
                          {assignment.max_grade}

                        </span>

                      ) : isSubmitted ? (

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isLate
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >

                          <CheckCircle2 className="w-3 h-3" />

                          {
                            isLate
                              ? 'Late Submission'
                              : 'Submitted'
                          }

                        </span>

                      ) : isPastDue ? (

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">

                          <AlertCircle className="w-3 h-3" />

                          Past Due Date

                        </span>

                      ) : (

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Pending
                        </span>

                      )}

                    </div>


                    <div>

                      <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">

                        {assignment.title}

                      </h3>


                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">

                        {
                          assignment.description
                        }

                      </p>

                    </div>


                    {/* Due Date & Max Grade */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">

                      <div className="flex items-center gap-1.5 text-slate-600">

                        <Calendar className="w-4 h-4 text-orange-500" />

                        <span>

                          Due:{' '}

                          {new Date(
                            assignment.due_date
                          ).toLocaleDateString()}

                        </span>

                      </div>


                      <span className="font-bold text-slate-800">

                        Max:{' '}
                        {assignment.max_grade}{' '}
                        pts

                      </span>

                    </div>


                    {/* Feedback preview if graded */}
                    {submission?.feedback && (

                      <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs">

                        <p className="font-bold text-orange-800 text-[11px] mb-0.5">
                          Instructor Feedback:
                        </p>

                        <p className="text-orange-950 text-[11px] leading-relaxed italic">

                          "
                          {
                            submission.feedback
                          }
                          "

                        </p>

                      </div>

                    )}

                  </div>


                  {/* Actions */}
                  <div className="pt-6 space-y-2">

                    <button
                      onClick={() =>
                        handleDownloadSpec(
                          assignment
                        )
                      }
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >

                      <Download className="w-4 h-4 text-slate-400" />

                      <span>
                        Download Assignment Brief
                      </span>

                    </button>


                    <button
                      onClick={() => {

                        setActiveUploadAssignment(
                          assignment
                        );

                        setSelectedFile(null);

                      }}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isSubmitted
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
                      }`}
                    >

                      <UploadCloud className="w-4 h-4" />

                      <span>

                        {
                          isSubmitted
                            ? 'Resubmit Solution'
                            : 'Upload Solution'
                        }

                      </span>

                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>

      )}


      {/* Drag & Drop Assignment Upload Modal */}
      {activeUploadAssignment && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">

          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">


            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  Solution Submission
                </span>


                <h3 className="text-base font-bold text-slate-900 mt-1">

                  {
                    activeUploadAssignment.title
                  }

                </h3>

              </div>


              <button
                type="button"
                onClick={() =>
                  setActiveUploadAssignment(
                    null
                  )
                }
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close dialog"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* Drag & drop dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.jpg,.jpeg,.png,.docx,.zip"
              onChange={e => {

                const file =
                  e.target.files?.[0];

                if (file) {
                  handleFileSelected(
                    file
                  );
                }

              }}
              className="hidden"
            />


            {!selectedFile ? (

              <div
                onDragOver={e => {

                  e.preventDefault();

                  setIsDragging(true);

                }}
                onDragLeave={() =>
                  setIsDragging(false)
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-orange-500 bg-orange-50/50 scale-102'
                    : 'border-slate-300 hover:border-orange-400 bg-slate-50/50 hover:bg-orange-50/20'
                }`}
              >

                <UploadCloud className="w-12 h-12 mx-auto text-slate-400 mb-3" />


                <p className="text-xs font-bold text-slate-800">
                  Drag & Drop your solution here
                </p>


                <p className="text-[11px] text-slate-500 mt-1">
                  or
                </p>


                <button
                  type="button"
                  className="mt-2 px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-orange-600 font-bold text-xs shadow-xs hover:bg-slate-50"
                >
                  Choose File
                </button>


                <p className="text-[10px] text-slate-400 mt-3">

                  Supported formats: PDF, JPG,
                  JPEG, PNG, DOCX, ZIP
                  (Max 25MB)

                </p>

              </div>

            ) : (

              /* Selected file display */
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">

                <div className="flex items-center justify-between gap-3">

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 shrink-0">

                      <FileCheck className="w-5 h-5" />

                    </div>


                    <div className="min-w-0">

                      <p className="text-xs font-bold text-slate-900 truncate">

                        {selectedFile.name}

                      </p>


                      <p className="text-[10px] text-slate-500">

                        {
                          (
                            selectedFile.size /
                            1024
                          ).toFixed(1)
                        }{' '}
                        KB •{' '}
                        {
                          selectedFile.type ||
                          'Document'
                        }

                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setSelectedFile(null)
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove file"
                  >

                    <X className="w-4 h-4" />

                  </button>

                </div>


                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">

                  <div className="bg-emerald-500 h-1.5 rounded-full w-full" />

                </div>

              </div>

            )}


            {/* Submission actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">

              <button
                type="button"
                onClick={() =>
                  setActiveUploadAssignment(
                    null
                  )
                }
                disabled={uploading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={
                  !selectedFile ||
                  uploading
                }
                onClick={
                  handleSubmitSolution
                }
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-40"
              >

                {
                  uploading
                    ? 'Uploading...'
                    : 'Submit Assignment'
                }

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};