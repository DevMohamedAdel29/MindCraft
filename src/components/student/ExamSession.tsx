import React, {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';

import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { db } from '../../services/db';

import {
  Exam,
  Question,
  ExamAttempt,
  Answer
} from '../../types/database';

import confetti from 'canvas-confetti';

import {
  Clock,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  FileCheck,
  Check,
  AlertCircle
} from 'lucide-react';


interface Props {
  examId: string;
  onFinish: (attemptId: string) => void;
  onExit: () => void;
}


export const ExamSession: React.FC<Props> = ({
  examId,
  onFinish,
  onExit
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [exam, setExam] = useState<Exam | null>(null);

  const [attempt, setAttempt] =
    useState<ExamAttempt | null>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<Record<string, Partial<Answer>>>({});

  const [uploading, setUploading] =
    useState(false);

  const [remainingSeconds, setRemainingSeconds] =
    useState<number | null>(null);

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  const [hasWarned10m, setHasWarned10m] =
    useState(false);

  const [hasWarned5m, setHasWarned5m] =
    useState(false);

  const [hasWarned1m, setHasWarned1m] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);


  // =========================================================
  // INITIALIZE / RESUME EXAM
  // =========================================================

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const initializeExam = async () => {
      try {
        const loadedExam = db.getExam(examId);

        if (!loadedExam) {
          showToast({
            type: 'error',
            title: 'Exam Not Found',
            message:
              'The requested exam could not be loaded.'
          });

          onExit();
          return;
        }

        setExam(loadedExam);

        // Start or resume real Supabase attempt
        const activeAttempt =
          await db.startExamAttempt(
            examId,
            user.id
          );

        if (cancelled) return;

        setAttempt(activeAttempt);

        // Restore previously saved answers
        const existingMap:
          Record<string, Partial<Answer>> = {};

        if (activeAttempt.answers) {
          activeAttempt.answers.forEach(ans => {
            existingMap[ans.question_id] = ans;
          });
        }

        setAnswers(existingMap);

      } catch (err: any) {
        console.error(
          'Failed to initialize exam:',
          err
        );

        if (!cancelled) {
          showToast({
            type: 'error',
            title: 'Could Not Start Exam',
            message:
              err?.message ||
              'Could not create or resume your exam attempt.'
          });

          onExit();
        }
      }
    };

    initializeExam();

    return () => {
      cancelled = true;
    };
  }, [
    examId,
    user,
    onExit,
    showToast
  ]);


  // =========================================================
  // COUNTDOWN TIMER
  // =========================================================

  useEffect(() => {
    if (!exam || !attempt) return;

    const calculateRemaining = () => {
      const startTime =
        new Date(
          attempt.started_at
        ).getTime();

      const totalDurationMs =
        exam.duration_minutes *
        60 *
        1000;

      const endTime =
        startTime + totalDurationMs;

      const diffSec =
        Math.max(
          0,
          Math.floor(
            (endTime - Date.now()) /
            1000
          )
        );

      return diffSec;
    };


    const initialSec =
      calculateRemaining();

    setRemainingSeconds(initialSec);


    const timer = setInterval(() => {
      const sec =
        calculateRemaining();

      setRemainingSeconds(sec);


      if (
        sec <= 600 &&
        sec > 300 &&
        !hasWarned10m
      ) {
        setHasWarned10m(true);

        showToast({
          type: 'warning',
          title: '10 Minutes Remaining',
          message:
            'Please review your answers and finish essay uploads.'
        });

      } else if (
        sec <= 300 &&
        sec > 60 &&
        !hasWarned5m
      ) {
        setHasWarned5m(true);

        showToast({
          type: 'warning',
          title: '5 Minutes Remaining',
          message:
            'Time is running out. Complete remaining questions.'
        });

      } else if (
        sec <= 60 &&
        sec > 0 &&
        !hasWarned1m
      ) {
        setHasWarned1m(true);

        showToast({
          type: 'error',
          title: '1 Minute Remaining!',
          message:
            'Exam will be submitted automatically when timer expires.'
        });
      }


      if (sec <= 0) {
        clearInterval(timer);

        handleFinalSubmit(true);
      }

    }, 1000);


    return () =>
      clearInterval(timer);

  }, [
    exam,
    attempt,
    hasWarned10m,
    hasWarned5m,
    hasWarned1m
  ]);


  // =========================================================
  // SAVE MCQ / TRUE-FALSE ANSWER
  // =========================================================

  const handleSelectOption = async (
    questionId: string,
    optionId: string
  ) => {
    if (!attempt) return;

    const previousAnswer =
      answers[questionId];

    const updated: Partial<Answer> = {
      ...previousAnswer,
      question_id: questionId,
      selected_option_id: optionId
    };


    // Optimistic UI update
    setAnswers(prev => ({
      ...prev,
      [questionId]: updated
    }));


    try {
      const savedAnswer =
        await db.saveAnswer(
          attempt.id,
          updated
        );

      setAnswers(prev => ({
        ...prev,
        [questionId]: savedAnswer
      }));

    } catch (err: any) {
      console.error(
        'Failed to save answer:',
        err
      );


      // Rollback if Supabase fails
      setAnswers(prev => {
        const next = { ...prev };

        if (previousAnswer) {
          next[questionId] =
            previousAnswer;
        } else {
          delete next[questionId];
        }

        return next;
      });


      showToast({
        type: 'error',
        title: 'Answer Not Saved',
        message:
          err?.message ||
          'Your answer could not be saved. Please select it again.'
      });
    }
  };


  // =========================================================
  // ESSAY FILE UPLOAD
  // =========================================================

  const handleFileUpload = async (
    questionId: string,
    file: File
  ) => {
    if (!attempt || !user) return;


    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf'
    ];


    if (!validTypes.includes(file.type)) {
      showToast({
        type: 'error',
        title: 'Unsupported File Type',
        message:
          'Please upload a photo (JPG, PNG) or PDF of your handwritten answer.'
      });

      return;
    }


    if (
      file.size >
      15 * 1024 * 1024
    ) {
      showToast({
        type: 'error',
        title: 'File Too Large',
        message:
          'Maximum allowed file size is 15MB.'
      });

      return;
    }


    setUploading(true);


    try {
      // Upload physical file to Supabase Storage
      const uploadResult =
        await db.uploadFile(
          'exam-answers',
          file,
          user.id
        );


      const updated: Partial<Answer> = {
        ...answers[questionId],

        question_id:
          questionId,

        uploaded_file_path:
          uploadResult.path,

        uploaded_file_name:
          file.name
      };


      // Save answer record in Supabase
      const savedAnswer =
        await db.saveAnswer(
          attempt.id,
          updated
        );


      setAnswers(prev => ({
        ...prev,
        [questionId]: savedAnswer
      }));


      showToast({
        type: 'success',
        title:
          'Handwritten Answer Uploaded',
        message:
          `Attached "${file.name}" successfully.`
      });

    } catch (err: any) {
      console.error(
        'Essay answer upload/save failed:',
        err
      );


      showToast({
        type: 'error',
        title: 'Upload Failed',
        message:
          err?.message ||
          'Could not upload and save your answer. Please try again.'
      });

    } finally {
      setUploading(false);
    }
  };


  // =========================================================
  // FINAL EXAM SUBMISSION
  // =========================================================

  const handleFinalSubmit =
    useCallback(
      async (
        isAutoTimeout = false
      ) => {
        if (!attempt) return;


        try {
          const submittedAttempt =
            await db.submitExamAttempt(
              attempt.id
            );


          setAttempt(
            submittedAttempt
          );


          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: {
                y: 0.6
              }
            });
          } catch {}


          showToast({
            type: 'success',

            title:
              isAutoTimeout
                ? 'Time Expired - Exam Auto-Submitted'
                : 'Exam Submitted Successfully! 🎉',

            message:
              `Your objective score is ${submittedAttempt.auto_score ?? 0} pts. Essays have been queued for teacher review.`
          });


          onFinish(
            submittedAttempt.id
          );

        } catch (err: any) {
          console.error(
            'Exam submission failed:',
            err
          );


          showToast({
            type: 'error',
            title: 'Submission Error',
            message:
              err?.message ||
              'Could not submit exam. Please try again.'
          });
        }
      },
      [
        attempt,
        onFinish,
        showToast
      ]
    );


  // =========================================================
  // LOADING
  // =========================================================

  if (
    !exam ||
    !exam.questions ||
    exam.questions.length === 0
  ) {
    return (
      <div className="py-20 text-center">

        <p className="text-slate-500 text-sm">
          Loading exam questions...
        </p>

      </div>
    );
  }


  const questions =
    exam.questions;

  const currentQuestion =
    questions[currentIndex];

  const currentAnswer =
    currentQuestion
      ? answers[currentQuestion.id]
      : undefined;


  // =========================================================
  // TIMER FORMAT
  // =========================================================

  const formatTime = (
    totalSeconds: number | null
  ) => {
    if (totalSeconds === null) {
      return '--:--';
    }

    const m =
      Math.floor(
        totalSeconds / 60
      );

    const s =
      totalSeconds % 60;

    return `${m
      .toString()
      .padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };


  // =========================================================
  // ANSWER STATE
  // =========================================================

  const isQuestionAnswered = (
    q: Question
  ) => {
    const ans =
      answers[q.id];

    if (!ans) return false;


    if (
      q.type ===
        'multiple_choice' ||
      q.type ===
        'true_false'
    ) {
      return Boolean(
        ans.selected_option_id
      );
    }


    if (q.type === 'essay') {
      return Boolean(
        ans.uploaded_file_path
      );
    }


    return false;
  };


  const answeredCount =
    questions.filter(
      isQuestionAnswered
    ).length;

  const unansweredCount =
    questions.length -
    answeredCount;


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in">


      {/* Exam Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm sticky top-16 z-30 flex items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
              Exam Session
            </span>

            <span className="text-xs font-bold text-slate-400">
              •
            </span>

            <span className="text-xs font-bold text-slate-600 truncate max-w-xs">
              {exam.title}
            </span>

          </div>


          <p className="text-xs font-bold text-slate-900 mt-1">

            Question{' '}
            {currentIndex + 1}{' '}
            /{' '}
            {questions.length}

          </p>

        </div>


        <div className="flex items-center gap-3">

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-black transition-colors ${
              (remainingSeconds || 0) <
              300
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                : (remainingSeconds ||
                    0) < 600
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-[#0F172A]'
            }`}
          >

            <Clock className="w-4 h-4 text-orange-500" />

            <span className="text-sm">
              {formatTime(
                remainingSeconds
              )}
            </span>

          </div>


          <button
            onClick={() =>
              setShowSubmitModal(
                true
              )
            }
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
          >

            <Send className="w-3.5 h-3.5" />

            <span>
              Finish & Submit
            </span>

          </button>

        </div>

      </div>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">


        {/* Main Question Area */}
        <div className="lg:col-span-3 space-y-6">

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">


            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">

                Question{' '}
                {currentIndex + 1}{' '}

                (
                {
                  currentQuestion.type ===
                  'multiple_choice'
                    ? 'Multiple Choice'
                    : currentQuestion.type ===
                      'true_false'
                    ? 'True / False'
                    : 'Handwritten Essay'
                }
                )

              </span>


              <span className="text-xs font-bold text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100">

                {
                  currentQuestion.marks
                }{' '}
                Marks

              </span>

            </div>


            {/* Question Text */}
            <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">

              {
                currentQuestion.question_text
              }

            </h2>


            {/* Multiple Choice */}
            {currentQuestion.type ===
              'multiple_choice' && (

              <div className="space-y-3 pt-2">

                {currentQuestion.options?.map(
                  (
                    option,
                    optIdx
                  ) => {

                    const letter =
                      String.fromCharCode(
                        65 + optIdx
                      );

                    const isSelected =
                      currentAnswer
                        ?.selected_option_id ===
                      option.id;


                    return (

                      <button
                        key={option.id}
                        onClick={() =>
                          handleSelectOption(
                            currentQuestion.id,
                            option.id
                          )
                        }
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/50 text-slate-900 ring-2 ring-orange-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                        }`}
                      >

                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >

                          {letter}

                        </div>


                        <span className="flex-1">

                          {
                            option.option_text
                          }

                        </span>


                        {isSelected && (

                          <Check className="w-4 h-4 text-orange-600 shrink-0" />

                        )}

                      </button>
                    );
                  }
                )}

              </div>

            )}


            {/* True / False */}
            {currentQuestion.type ===
              'true_false' && (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                {currentQuestion.options?.map(
                  option => {

                    const isSelected =
                      currentAnswer
                        ?.selected_option_id ===
                      option.id;

                    const isTrue =
                      option.option_text
                        .toLowerCase() ===
                      'true';


                    return (

                      <button
                        key={option.id}
                        onClick={() =>
                          handleSelectOption(
                            currentQuestion.id,
                            option.id
                          )
                        }
                        className={`p-5 rounded-2xl border text-center font-bold text-sm sm:text-base transition-all flex flex-col items-center justify-center gap-2 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/60 text-slate-900 ring-2 ring-orange-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                        }`}
                      >

                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >

                          {
                            isTrue
                              ? 'T'
                              : 'F'
                          }

                        </span>


                        <span>
                          {
                            option.option_text
                          }
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

            )}


            {/* Essay */}
            {currentQuestion.type ===
              'essay' && (

              <div className="space-y-4 pt-2">


                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">

                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />

                  <div>

                    <p className="font-bold">
                      Handwritten Response Required
                    </p>

                    <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">

                      Write your complete response neatly by hand on paper.
                      Take a well-lit photo or scan
                      (JPG, JPEG, PNG, or PDF)
                      and upload it below.
                      Text typing is disabled for this question.

                    </p>

                  </div>

                </div>


                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => {

                    const file =
                      e.target.files?.[0];

                    if (file) {
                      handleFileUpload(
                        currentQuestion.id,
                        file
                      );
                    }

                  }}
                  className="hidden"
                />


                <div
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-orange-50/20 group"
                >

                  <UploadCloud className="w-10 h-10 mx-auto text-slate-400 group-hover:text-orange-500 transition-colors mb-2" />

                  <p className="text-xs font-bold text-slate-800 group-hover:text-orange-600">

                    {
                      uploading
                        ? 'Processing File...'
                        : 'Click to Upload Handwritten Answer Sheet'
                    }

                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">

                    Supports JPG, JPEG,
                    PNG photos or multi-page
                    PDF documents (Max 15MB)

                  </p>

                </div>


                {/* Uploaded File */}
                {currentAnswer
                  ?.uploaded_file_path && (

                  <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">

                        <FileCheck className="w-5 h-5" />

                      </div>


                      <div className="min-w-0">

                        <p className="text-xs font-bold text-slate-800 truncate">

                          {
                            currentAnswer
                              .uploaded_file_name ||
                            'Handwritten_Solution.png'
                          }

                        </p>


                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">

                          <CheckCircle2 className="w-3 h-3" />

                          Attached & Saved to Exam Attempt

                        </p>

                      </div>

                    </div>


                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !currentAnswer
                              .uploaded_file_path
                          ) {
                            return;
                          }

                          db.downloadFile(
                            currentAnswer
                              .uploaded_file_path,

                            currentAnswer
                              .uploaded_file_name ||
                              'Handwritten_Answer'
                          );
                        }}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1"
                        title="Preview uploaded document"
                      >

                        <Eye className="w-4 h-4" />

                        <span className="hidden sm:inline">
                          Preview
                        </span>

                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-xl hover:bg-orange-50"
                      >
                        Replace
                      </button>

                    </div>

                  </div>

                )}

              </div>

            )}


            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">

              <button
                onClick={() =>
                  setCurrentIndex(
                    prev =>
                      Math.max(
                        0,
                        prev - 1
                      )
                  )
                }
                disabled={
                  currentIndex === 0
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >

                <ChevronLeft className="w-4 h-4" />

                <span>
                  Previous
                </span>

              </button>


              {currentIndex <
              questions.length - 1 ? (

                <button
                  onClick={() =>
                    setCurrentIndex(
                      prev =>
                        Math.min(
                          questions.length -
                            1,
                          prev + 1
                        )
                    )
                  }
                  className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >

                  <span>
                    Next Question
                  </span>

                  <ChevronRight className="w-4 h-4" />

                </button>

              ) : (

                <button
                  onClick={() =>
                    setShowSubmitModal(
                      true
                    )
                  }
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
                >

                  <Send className="w-4 h-4" />

                  <span>
                    Review & Submit
                  </span>

                </button>

              )}

            </div>

          </div>

        </div>


        {/* Question Navigator */}
        <div className="space-y-4">

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">

            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Question Navigator
            </h3>


            <div className="grid grid-cols-4 gap-2">

              {questions.map(
                (q, idx) => {

                  const isCurrent =
                    idx === currentIndex;

                  const isAnswered =
                    isQuestionAnswered(q);


                  let btnClass =
                    'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';


                  if (isCurrent) {
                    btnClass =
                      'bg-orange-500 border-orange-500 text-white ring-2 ring-orange-300 font-black shadow-xs';

                  } else if (
                    isAnswered
                  ) {
                    btnClass =
                      'bg-emerald-500 border-emerald-500 text-white font-bold';
                  }


                  return (

                    <button
                      key={q.id}
                      onClick={() =>
                        setCurrentIndex(
                          idx
                        )
                      }
                      className={`h-11 rounded-xl border text-xs flex items-center justify-center gap-0.5 transition-all ${btnClass}`}
                      title={`Go to Question ${idx + 1}`}
                    >

                      <span>
                        {idx + 1}
                      </span>


                      {isCurrent ? (

                        <span className="text-[10px]">
                          ●
                        </span>

                      ) : isAnswered ? (

                        <span className="text-[10px]">
                          ✓
                        </span>

                      ) : null}

                    </button>
                  );
                }
              )}

            </div>


            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">

              <div className="flex items-center gap-2">

                <span className="w-3 h-3 rounded-md bg-orange-500 shrink-0" />

                <span>
                  Current Question
                </span>

              </div>


              <div className="flex items-center gap-2">

                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />

                <span>
                  Answered ({answeredCount})
                </span>

              </div>


              <div className="flex items-center gap-2">

                <span className="w-3 h-3 rounded-md bg-slate-200 shrink-0" />

                <span>
                  Unanswered ({unansweredCount})
                </span>

              </div>

            </div>


            <button
              onClick={() =>
                setShowSubmitModal(
                  true
                )
              }
              className="w-full mt-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
            >
              Submit Exam
            </button>

          </div>

        </div>

      </div>


      {/* Submit Confirmation Modal */}
      {showSubmitModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">

          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">


            <div className="text-center space-y-2">

              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">

                <Send className="w-6 h-6" />

              </div>


              <h3 className="text-lg font-black text-slate-900">
                Submit Your Exam?
              </h3>


              <p className="text-xs text-slate-500 leading-relaxed">

                "Are you sure you want to submit your exam?"
                Once submitted, you cannot modify your answers
                or re-upload files.

              </p>

            </div>


            {/* Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">


              <div className="flex justify-between items-center text-slate-700">

                <span className="flex items-center gap-1.5 font-medium">

                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                  Answered Questions:

                </span>

                <span className="font-bold text-emerald-600">

                  {answeredCount}
                  {' '}of{' '}
                  {questions.length}

                </span>

              </div>


              <div className="flex justify-between items-center text-slate-700">

                <span className="flex items-center gap-1.5 font-medium">

                  <AlertCircle className="w-4 h-4 text-amber-500" />

                  Unanswered Questions:

                </span>

                <span className="font-bold text-amber-600">
                  {unansweredCount}
                </span>

              </div>


              <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-200">

                <span className="flex items-center gap-1.5 font-medium">

                  <Clock className="w-4 h-4 text-slate-400" />

                  Remaining Time:

                </span>

                <span className="font-mono font-bold text-slate-900">

                  {formatTime(
                    remainingSeconds
                  )}

                </span>

              </div>

            </div>


            {unansweredCount > 0 && (

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">

                Warning: You have{' '}
                {unansweredCount}{' '}
                unanswered questions.
                Unanswered questions will
                receive 0 marks.

              </div>

            )}


            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    false
                  )
                }
                className="w-1/2 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >

                Cancel & Review

              </button>


              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(
                    false
                  );

                  handleFinalSubmit(
                    false
                  );
                }}
                className="w-1/2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
              >

                Submit Exam

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};