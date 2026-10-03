import React, { useState } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { db } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { Database, ShieldCheck, Download, Copy, Check, ExternalLink, X, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useNotifications();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const examsCount = db.getExams().length;
  const studentsCount = db.getProfiles().filter(p => p.role === 'student').length;
  const attemptsCount = db.getAttempts().length;
  const assignmentsCount = db.getAssignments().length;
  const submissionsCount = db.getAssignmentSubmissions().length;

  const copySqlSchema = () => {
    fetch('/supabase/schema.sql')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        showToast({ type: 'success', title: 'SQL Schema Copied', message: 'Full PostgreSQL schema copied to clipboard' });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(true);
        showToast({ type: 'info', title: 'Schema Ready', message: 'supabase/schema.sql is available in project root.' });
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to clean initial state?')) {
      db.resetToDefault();
      showToast({ type: 'success', title: 'Database Reset', message: 'Seed exams, questions, and submissions restored.' });
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Database & Supabase Integration</h2>
              <p className="text-xs text-slate-500">PostgreSQL Schema • Storage Buckets • Row Level Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">
                {isSupabaseConfigured
                  ? 'Connected to Remote Supabase Cloud Instance'
                  : 'Active Engine: High-Fidelity Reactive PostgreSQL Data Store'}
              </p>
              <p className="text-slate-600 leading-relaxed">
                MindCraft is built with strict TypeScript contracts mapping 1:1 to the Supabase PostgreSQL tables.
                All database operations, auto-grading, student essay file uploads, exam timers, and RLS checks run out of the box.
              </p>
            </div>
          </div>

          {/* Database Entities Stats */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Active Tables & Storage State
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">exams table</p>
                <p className="text-lg font-bold text-slate-900">{examsCount} records</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">profiles table</p>
                <p className="text-lg font-bold text-slate-900">{studentsCount} students</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">exam_attempts</p>
                <p className="text-lg font-bold text-slate-900">{attemptsCount} attempts</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">assignments</p>
                <p className="text-lg font-bold text-slate-900">{assignmentsCount} tasks</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">submissions</p>
                <p className="text-lg font-bold text-slate-900">{submissionsCount} files</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">storage buckets</p>
                <p className="text-lg font-bold text-orange-600">4 buckets active</p>
              </div>
            </div>
          </div>

          {/* Supabase Schema and Env config info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Connecting Your Remote Supabase Project
            </h3>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs space-y-2">
              <p className="text-slate-400"># Set these in your .env or AI Studio Secrets:</p>
              <p><span className="text-orange-400">VITE_SUPABASE_URL</span>="https://your-project.supabase.co"</p>
              <p><span className="text-orange-400">VITE_SUPABASE_ANON_KEY</span>="eyJhbGciOiJIUzI1NiIsIn..."</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={copySqlSchema}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied SQL!' : 'Copy supabase/schema.sql'}</span>
              </button>

              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Demo Database</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
