import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  BookOpen,
  GraduationCap,
 
  Video
} from 'lucide-react';
const getEmbedUrl = (url: string) => {
  if (!url) return '';

  // YouTube normal link
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = new URL(url).searchParams.get('v');

    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : '';
  }

  // YouTube short link
  if (url.includes('youtu.be/')) {
    const videoId =
      url.split('youtu.be/')[1]?.split('?')[0];

    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : '';
  }

  // YouTube already embedded
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Google Drive
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([^/]+)/);

    if (match?.[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }

    const idMatch = url.match(/[?&]id=([^&]+)/);

    if (idMatch?.[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  }

  return url;
};

export const StudentLessons: React.FC = () => {
  const { user } = useAuth();

  const lessons = db.getLessons(    
    'student',
    user?.grade_level
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-500" />
          My Lessons
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Lessons available for your grade.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-orange-500" />

        <span className="text-sm font-bold text-slate-700">
          {user?.grade_level || 'Grade not assigned'}
        </span>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">

          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />

          <h3 className="font-bold text-slate-700">
            No Lessons Available
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            There are no published lessons for your grade yet.
          </p>

        </div>
      ) : (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

          {lessons.map(lesson => (
            <div
              key={lesson.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm"
            >

              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">

                <BookOpen className="w-6 h-6 text-orange-500" />

              </div>

              <div className="mt-4">

                <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
                  Lesson {lesson.order_index}
                </span>

                <h3 className="text-lg font-black text-slate-900 mt-3">
                  {lesson.title}
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {lesson.description || 'No description available.'}
                </p>

              </div>
{lesson.video_url && (
  <div className="mt-5">
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-sm">

      <iframe
        src={getEmbedUrl(lesson.video_url)}
        title={lesson.title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

    </div>

    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3">
      <Video className="w-3.5 h-3.5" />
      Lesson Video
    </div>
  </div>
)}

              {lesson.video_url && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-3">
                  <Video className="w-3 h-3" />
                  Video lesson
                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
};