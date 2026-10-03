import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Profile, GRADE_LEVELS } from '../../types/database';
import { Users, Search, GraduationCap, Award, Eye, Calendar, Mail, Hash, X, ShieldAlert } from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const { user, isAdminAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);

  if (!user || user.role !== 'admin' || !isAdminAuthenticated) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Student directory access is strictly restricted to authenticated administrators.
        </p>
      </div>
    );
  }

  const profiles = db.getProfiles(true);
  const students = profiles.filter(p => p.role === 'student');

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.student_id && s.student_id.toLowerCase().includes(search.toLowerCase()));

    const matchesGrade = 
      filterGrade === 'All' || 
      (s.grade_level && s.grade_level.toLowerCase() === filterGrade.toLowerCase());

    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse enrolled student profiles, academic identifiers, grade levels, and cumulative performance.
          </p>
        </div>

        {/* Filter & Search Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <GraduationCap className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-500">Grade:</span>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="All">All Grades ({students.length})</option>
              {GRADE_LEVELS.map(g => {
                const count = students.filter(s => s.grade_level === g).length;
                return (
                  <option key={g} value={g}>
                    {g} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Student ID</th>
                <th className="py-4 px-6">Grade Level</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Enrolled Date</th>
                <th className="py-4 px-6">Exams</th>
                <th className="py-4 px-6">Coursework</th>
                <th className="py-4 px-6">Avg Score</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const attempts = db.getStudentAttempts(student.id);
                  const submissions = db.getStudentAssignmentSubmissions(student.id);
                  const completedAttempts = attempts.filter(a => a.status === 'graded');

                  let earned = 0;
                  let max = 0;
                  completedAttempts.forEach(att => {
                    const ex = db.getExam(att.exam_id);
                    if (ex) {
                      earned += att.final_score;
                      max += ex.total_marks;
                    }
                  });

                  submissions.forEach(sub => {
                    const asg = db.getAssignment(sub.assignment_id);
                    if (asg && sub.grade) {
                      earned += sub.grade;
                      max += asg.max_grade;
                    }
                  });

                  const avg = max > 0 ? Math.round((earned / max) * 100) : 90;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                            alt={student.full_name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="font-bold text-slate-900">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-slate-600">
                        {student.student_id || '—'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-purple-600" />
                          <span>{student.grade_level || 'Grade 9'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{student.email}</td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {completedAttempts.length} / {attempts.length}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {submissions.length} submitted
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {avg}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Performance</span>
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

      {/* Student Performance Modal (Section 22) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={selectedStudent.full_name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedStudent.full_name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {selectedStudent.grade_level || 'Grade 9'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedStudent.student_id || 'MC-2026'} • {selectedStudent.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance breakdown */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Exam Attempts History
              </h4>
              <div className="space-y-2">
                {db.getStudentAttempts(selectedStudent.id).map(att => {
                  const exam = db.getExam(att.exam_id);
                  return (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{exam?.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {att.submitted_at ? new Date(att.submitted_at).toLocaleDateString() : 'Active'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{att.final_score} / {exam?.total_marks} pts</span>
                        <p className="text-[10px] text-emerald-600 font-semibold capitalize">{att.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pt-2">
                Coursework Submissions
              </h4>
              <div className="space-y-2">
                {db.getStudentAssignmentSubmissions(selectedStudent.id).map(sub => {
                  const asg = db.getAssignment(sub.assignment_id);
                  return (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{asg?.title}</p>
                        <p className="text-[10px] text-slate-400">File: {sub.file_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">
                          {sub.grade !== null ? `${sub.grade} / ${asg?.max_grade}` : 'Pending Grade'}
                        </span>
                        <p className="text-[10px] text-blue-600 font-semibold capitalize">{sub.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
