import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
  Database,
  ShieldCheck,
  Download,
  Server,
  FileCode,
  CheckCircle2
} from 'lucide-react';

interface Props {
  onOpenSupabaseModal: () => void;
}

export const AdminSettings: React.FC<Props> = ({
  onOpenSupabaseModal
}) => {
  const { showToast } = useNotifications();

  const handleExportState = () => {
    showToast({
      type: 'info',
      title: 'Supabase Database',
      message:
        'System data is stored directly in Supabase. Local JSON export is disabled.'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Architecture & Settings
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review database health, security controls,
          Supabase PostgreSQL schema, and storage configuration.
        </p>
      </div>

      {/* Cloud & Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Database Engine
            </span>

            <Database className="w-4 h-4 text-emerald-500" />
          </div>

          <p className="text-lg font-black text-slate-900">
            Supabase PostgreSQL
          </p>

          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Cloud Database Active
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Row Level Security
            </span>

            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>

          <p className="text-lg font-black text-slate-900">
            Enforced by Role
          </p>

          <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Admin vs Student Policies
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Object Storage
            </span>

            <Server className="w-4 h-4 text-purple-500" />
          </div>

          <p className="text-lg font-black text-slate-900">
            Supabase Storage
          </p>

          <p className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Storage Buckets Configured
          </p>
        </div>

      </div>

      {/* Supabase Schema */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0F172A] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">

        <div className="space-y-2">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <FileCode className="w-3.5 h-3.5" />
            <span>SQL Schema & RLS Policies</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            Supabase PostgreSQL Schema
          </h3>

          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Review the production database structure,
            authentication configuration, storage buckets,
            and Row Level Security policies.
          </p>

        </div>

        <button
          onClick={onOpenSupabaseModal}
          className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto"
        >
          <Database className="w-4 h-4" />
          <span>View Supabase Status & SQL</span>
        </button>

      </div>

      {/* Data Operations */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">

        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Maintenance & Data Operations
        </h3>

        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Database Storage
            </h4>

            <p className="text-[11px] text-slate-500 mt-1">
              Exams, questions, submissions, student accounts,
              grades and uploaded files are stored in Supabase.
            </p>
          </div>

          <button
            onClick={handleExportState}
            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Database Information</span>
          </button>

        </div>

      </div>

    </div>
  );
};