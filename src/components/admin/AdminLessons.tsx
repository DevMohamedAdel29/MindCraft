import React, { useState } from 'react';
import { db } from '../../services/db';
import { Lesson, GRADE_LEVELS } from '../../types/database';
import { useNotifications } from '../../context/NotificationContext';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  X,
  GraduationCap,
  Video,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminLessons: React.FC = () => {
  const { showToast } = useNotifications();

  const [lessons, setLessons] =
    useState<Lesson[]>(db.getLessons());

  const [filterGrade, setFilterGrade] =
    useState('All');

  const [showModal, setShowModal] =
    useState(false);

  const [editingLesson, setEditingLesson] =
    useState<Lesson | null>(null);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [targetGrade, setTargetGrade] =
    useState('');

  const [videoUrl, setVideoUrl] =
    useState('');

  const [orderIndex, setOrderIndex] =
    useState(0);

  const [isPublished, setIsPublished] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const refreshLessons = () => {
    setLessons(db.getLessons());
  };

  const openCreate = () => {
    setEditingLesson(null);
    setTitle('');
    setDescription('');
    setTargetGrade('');
    setVideoUrl('');
    setOrderIndex(lessons.length + 1);
    setIsPublished(false);
    setShowModal(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);

    setTitle(lesson.title);
    setDescription(
      lesson.description || ''
    );
    setTargetGrade(
      lesson.target_grade || ''
    );
    setVideoUrl(
      lesson.video_url || ''
    );
    setOrderIndex(
      lesson.order_index || 0
    );
    setIsPublished(
      lesson.is_published
    );

    setShowModal(true);
  };

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast({
        type: 'error',
        title: 'Title Required',
        message:
          'Please enter a lesson title.'
      });
      return;
    }

    if (!targetGrade) {
      showToast({
        type: 'error',
        title: 'Grade Required',
        message:
          'Please select a grade.'
      });
      return;
    }

    setSaving(true);

    try {
      if (editingLesson) {
        await db.updateLesson(
          editingLesson.id,
          {
            title: title.trim(),
            description:
              description.trim(),
            target_grade:
              targetGrade,
            video_url:
              videoUrl.trim() || null,
            order_index:
              Number(orderIndex),
            is_published:
              isPublished
          }
        );

        showToast({
          type: 'success',
          title: 'Lesson Updated',
          message:
            `"${title}" was updated successfully.`
        });
      } else {
        await db.createLesson({
          title: title.trim(),
          description:
            description.trim(),
          target_grade:
            targetGrade,
          video_url:
            videoUrl.trim() || null,
          order_index:
            Number(orderIndex),
          is_published:
            isPublished
        });

        showToast({
          type: 'success',
          title: 'Lesson Created',
          message:
            `"${title}" was created successfully.`
        });
      }

      await db.hydrateFromSupabase();

      refreshLessons();

      setShowModal(false);

    } catch (err: any) {
      console.error(
        'LESSON SAVE ERROR:',
        err
      );

      showToast({
        type: 'error',
        title: 'Save Failed',
        message:
          err?.message ||
          'Could not save the lesson.'
      });

    } finally {
      setSaving(false);
    }
  };

  const handleDelete =
    async (lesson: Lesson) => {

      const confirmed =
        window.confirm(
          `Delete "${lesson.title}"?`
        );

      if (!confirmed) return;

      try {
        await db.deleteLesson(
          lesson.id
        );

        refreshLessons();

        showToast({
          type: 'success',
          title: 'Lesson Deleted',
          message:
            `"${lesson.title}" was deleted.`
        });

      } catch (err: any) {
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message:
            err?.message ||
            'Could not delete lesson.'
        });
      }
    };

  const handleTogglePublish =
    async (lesson: Lesson) => {

      try {
        await db.updateLesson(
          lesson.id,
          {
            is_published:
              !lesson.is_published
          }
        );

        await db.hydrateFromSupabase();

        refreshLessons();

      } catch (err: any) {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message:
            err?.message ||
            'Could not update lesson.'
        });
      }
    };

  const filteredLessons =
    filterGrade === 'All'
      ? lessons
      : lessons.filter(
          lesson =>
            lesson.target_grade ===
            filterGrade
        );

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-orange-500" />
            Lessons
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Create and manage lessons for each grade.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </button>

      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200">

        <div className="flex items-center gap-2">

          <GraduationCap className="w-4 h-4 text-orange-500" />

          <select
            value={filterGrade}
            onChange={e =>
              setFilterGrade(
                e.target.value
              )
            }
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
          >
            <option value="All">
              All Grades
            </option>

            {GRADE_LEVELS.map(
              grade => (
                <option
                  key={grade}
                  value={grade}
                >
                  {grade}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {filteredLessons.length === 0 ? (

        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">

          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />

          <h3 className="font-bold text-slate-700">
            No Lessons Yet
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Add your first lesson for this grade.
          </p>

        </div>

      ) : (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filteredLessons.map(
            lesson => (

              <div
                key={lesson.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      lesson.is_published
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {lesson.is_published
                      ? 'Published'
                      : 'Draft'}
                  </span>

                </div>

                <h3 className="font-black text-slate-900 mt-4">
                  {lesson.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                  {lesson.description ||
                    'No description'}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs">

                  <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">
                    {lesson.target_grade}
                  </span>

                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                    Lesson {lesson.order_index}
                  </span>

                </div>

                {lesson.video_url && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-red-500">
                    <Video className="w-4 h-4" />
                    Video attached
                  </div>
                )}

                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">

                  <button
                    onClick={() =>
                      handleTogglePublish(
                        lesson
                      )
                    }
                    className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    {lesson.is_published ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Publish
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      openEdit(lesson)
                    }
                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(lesson)
                    }
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            )
          )}

        </div>
      )}

      {showModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {editingLesson
                    ? 'Edit Lesson'
                    : 'Create Lesson'}
                </h2>

                <p className="text-xs text-slate-500">
                  Assign this lesson to a specific grade.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <form
              onSubmit={handleSave}
              className="space-y-4"
            >

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Lesson Title
                </label>

                <input
                  value={title}
                  onChange={e =>
                    setTitle(
                      e.target.value
                    )
                  }
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl"
                  placeholder="Lesson 1 - Introduction"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={e =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl resize-none"
                  placeholder="Lesson description..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Grade
                </label>

                <select
                  value={targetGrade}
                  onChange={e =>
                    setTargetGrade(
                      e.target.value
                    )
                  }
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl bg-white"
                >

                  <option value="">
                    Select Grade
                  </option>

                  {GRADE_LEVELS.map(
                    grade => (
                      <option
                        key={grade}
                        value={grade}
                      >
                        {grade}
                      </option>
                    )
                  )}

                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Video URL
                </label>

                <input
                  value={videoUrl}
                  onChange={e =>
                    setVideoUrl(
                      e.target.value
                    )
                  }
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Lesson Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={orderIndex}
                  onChange={e =>
                    setOrderIndex(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">

                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e =>
                    setIsPublished(
                      e.target.checked
                    )
                  }
                  className="w-4 h-4"
                />

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Publish Lesson
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Students in this grade will be able to see it.
                  </p>
                </div>

              </label>

              <div className="flex justify-end gap-3 pt-4 border-t">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingLesson
                    ? 'Save Changes'
                    : 'Create Lesson'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};