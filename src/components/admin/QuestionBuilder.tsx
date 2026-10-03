import React, { useState } from 'react';
import { db } from '../../services/db';
import { Exam, Question, QuestionOption, QuestionType } from '../../types/database';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Save, 
  X, 
  FileText, 
  Check, 
  HelpCircle 
} from 'lucide-react';

interface Props {
  examId: string;
  onBack: () => void;
}

export const QuestionBuilder: React.FC<Props> = ({ examId, onBack }) => {
  const { showToast } = useNotifications();
  const [exam, setExam] = useState<Exam | null>(db.getExam(examId) || null);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Form states for creating/editing a question
  const [type, setType] = useState<QuestionType>('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState<number>(5);
  
  // MCQ options state
  const [mcqOptions, setMcqOptions] = useState<string[]>([
    'Option A',
    'Option B',
    'Option C',
    'Option D'
  ]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);

  // True/False state
  const [tfCorrect, setTfCorrect] = useState<boolean>(true);

  const refreshExam = () => {
    const updated = db.getExam(examId);
    setExam(updated || null);
  };

  const handleOpenAddModal = (existing?: Question) => {
    if (existing) {
      setEditingQuestion(existing);
      setType(existing.type);
      setQuestionText(existing.question_text);
      setMarks(existing.marks);

      if (existing.type === 'multiple_choice' && existing.options) {
        setMcqOptions(existing.options.map(o => o.option_text));
        const correctIdx = existing.options.findIndex(o => o.is_correct);
        setCorrectOptionIndex(correctIdx !== -1 ? correctIdx : 0);
      } else if (existing.type === 'true_false' && existing.options) {
        const correct = existing.options.find(o => o.is_correct);
        setTfCorrect(correct?.option_text.toLowerCase() === 'true');
      }
    } else {
      setEditingQuestion({});
      setType('multiple_choice');
      setQuestionText('');
      setMarks(5);
      setMcqOptions(['', '', '', '']);
      setCorrectOptionIndex(0);
      setTfCorrect(true);
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      showToast({ type: 'error', title: 'Question Text Required', message: 'Please enter question prompt.' });
      return;
    }

    let optionsToSave: QuestionOption[] = [];

    if (type === 'multiple_choice') {
      const validOptions = mcqOptions.filter(o => o.trim().length > 0);
      if (validOptions.length < 2) {
        showToast({ type: 'error', title: 'Missing Options', message: 'Provide at least 2 valid options for Multiple Choice.' });
        return;
      }

      optionsToSave = mcqOptions.map((text, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        question_id: editingQuestion?.id || '',
        option_text: text.trim() || `Option ${String.fromCharCode(65 + idx)}`,
        is_correct: idx === correctOptionIndex,
        order_index: idx + 1
      }));
    } else if (type === 'true_false') {
      optionsToSave = [
        {
          id: `opt-${Date.now()}-true`,
          question_id: editingQuestion?.id || '',
          option_text: 'True',
          is_correct: tfCorrect,
          order_index: 1
        },
        {
          id: `opt-${Date.now()}-false`,
          question_id: editingQuestion?.id || '',
          option_text: 'False',
          is_correct: !tfCorrect,
          order_index: 2
        }
      ];
    }

    db.saveQuestion({
      id: editingQuestion?.id,
      exam_id: examId,
      type,
      question_text: questionText.trim(),
      marks: Number(marks) || 5,
      options: optionsToSave
    });

    showToast({
      type: 'success',
      title: editingQuestion?.id ? 'Question Updated' : 'Question Added',
      message: `Saved ${type.replace('_', ' ')} question with ${marks} marks.`
    });

    setEditingQuestion(null);
    refreshExam();
  };

  const confirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    db.deleteQuestion(questionToDelete.id);
    showToast({ type: 'info', title: 'Question Deleted', message: 'Removed question and recalculated exam marks.' });
    setQuestionToDelete(null);
    refreshExam();
  };

  const handleMoveQuestion = (qId: string, direction: 'up' | 'down') => {
    if (!exam?.questions) return;
    const list = [...exam.questions];
    const idx = list.findIndex(q => q.id === qId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    db.reorderQuestions(examId, list.map(q => q.id));
    refreshExam();
  };

  if (!exam) return null;
  const questions = exam.questions || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exam Management</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{exam.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic Question Builder • {questions.length} questions • Total: {exam.total_marks} marks
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 inline-flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No questions added yet</h3>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              Click the button above to add Multiple Choice, True/False, or Handwritten Essay questions.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md"
            >
              Add First Question
            </button>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                    {q.type === 'multiple_choice' ? 'Multiple Choice' : q.type === 'true_false' ? 'True / False' : 'Handwritten Essay'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-700">{q.marks} Marks</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveQuestion(q.id, 'up')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === questions.length - 1}
                    onClick={() => handleMoveQuestion(q.id, 'down')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenAddModal(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Edit question"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuestionToDelete(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {q.question_text}
              </h3>

              {/* Options display */}
              {q.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options?.map((opt, optIdx) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        opt.is_correct
                          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="truncate">{opt.option_text}</span>
                      </div>
                      {opt.is_correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'true_false' && (
                <div className="flex items-center gap-3 text-xs">
                  {q.options?.map(opt => (
                    <div
                      key={opt.id}
                      className={`px-4 py-2 rounded-xl border font-bold flex items-center gap-2 ${
                        opt.is_correct
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{opt.option_text}</span>
                      {opt.is_correct && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'essay' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Requires handwritten paper upload by student. Instructor manually evaluates and adds feedback.</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Question Builder Modal (Section 24) */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestion.id ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Question Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'multiple_choice', label: 'Multiple Choice' },
                    { id: 'true_false', label: 'True / False' },
                    { id: 'essay', label: 'Handwritten Essay' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as QuestionType)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        type === t.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marks & Question text */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={marks}
                    onChange={e => setMarks(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Multiple Choice Options Builder */}
              {type === 'multiple_choice' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Option Choices (Select the radio to mark the correct answer)
                  </label>
                  {mcqOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-option"
                        checked={correctOptionIndex === idx}
                        onChange={() => setCorrectOptionIndex(idx)}
                        className="accent-orange-500 w-4 h-4 cursor-pointer"
                        title="Mark this option as correct"
                      />
                      <span className="w-6 text-xs font-bold text-slate-500">
                        {String.fromCharCode(65 + idx)}:
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const updated = [...mcqOptions];
                          updated[idx] = e.target.value;
                          setMcqOptions(updated);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-slate-900"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* True/False Builder */}
              {type === 'true_false' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Correct Answer
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTfCorrect(true)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        tfCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      onClick={() => setTfCorrect(false)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        !tfCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      False
                    </button>
                  </div>
                </div>
              )}

              {/* Essay info */}
              {type === 'essay' && (
                <div className="p-3 rounded-xl bg-slate-50 text-slate-600 text-xs">
                  Students will be prompted to draw or write by hand on paper and upload a PDF/JPG/PNG.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Question Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Question</h3>
                <p className="text-xs text-slate-500">Remove from examination</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this question? Total exam marks will be automatically recalculated.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuestion}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors"
              >
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
