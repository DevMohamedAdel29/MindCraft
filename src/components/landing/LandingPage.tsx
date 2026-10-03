import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MindcraftLogo } from '../common/MindcraftLogo';
import { BrandBackground } from '../common/BrandBackground';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Award, 
  BarChart3, 
  Clock, 
  UploadCloud,
  ChevronRight,
  GraduationCap,
  Code2,
  Cpu,
  Brain,
  Layers,
  Check,
  Lock
} from 'lucide-react';

interface Props {
  onNavigate: (view: string, params?: any) => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  const { user, role } = useAuth();

  const handleStartLearning = () => {
    if (user) {
      onNavigate(role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
    } else {
      onNavigate('login');
    }
  };

  const handleAdminLogin = () => {
    onNavigate('login', { requestedRole: 'admin' });
  };

  const features = [
    {
      title: 'Interactive Examinations',
      description: 'Engage with timed assessments featuring auto-scoring for multiple choice and true/false, alongside high-res handwritten essay submissions.',
      icon: Clock,
      tag: 'Real Countdown Engine',
      accent: 'border-l-4 border-l-[#FF7A00]'
    },
    {
      title: 'Digital Project Coursework',
      description: 'Download lab specifications, assignment briefs, and submit code repositories, design docs, and ZIP archives with drag-and-drop ease.',
      icon: FileText,
      tag: 'Curriculum Vault',
      accent: 'border-l-4 border-l-[#00B4D8]'
    },
    {
      title: 'Pedagogical Essay Grading',
      description: 'Instructors inspect student handwritten calculations and answer sheets with split-screen viewers, assigning rubric points and qualitative remarks.',
      icon: Award,
      tag: 'Handwritten Inspection',
      accent: 'border-l-4 border-l-[#0A2558]'
    },
    {
      title: 'Progressive Analytics',
      description: 'Track overall average, estimated GPA trajectory, subject mastery distributions, and real-time pass/fail milestones.',
      icon: BarChart3,
      tag: 'Real-time Metrics',
      accent: 'border-l-4 border-l-[#00B4D8]'
    },
    {
      title: 'Constructive Instructor Feedback',
      description: 'Personalized corrections directly connected to student questions, cultivating continuous academic growth and confidence.',
      icon: Sparkles,
      tag: 'Actionable Mentorship',
      accent: 'border-l-4 border-l-[#FF7A00]'
    },
    {
      title: 'Security & RLS Isolation',
      description: 'Enterprise architecture with Supabase PostgreSQL Row Level Security (RLS) guaranteeing strict student and instructor workspace separation.',
      icon: ShieldCheck,
      tag: 'Enterprise Standard',
      accent: 'border-l-4 border-l-[#0A2558]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      {/* Brand Hero Canvas with Authentic Reference Waves & Watermarks */}
      <BrandBackground variant="hero" className="pt-10 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Centered Brand Lockup */}
            <div className="inline-flex flex-col items-center justify-center p-3 rounded-3xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-slate-900/5 mb-2 hover:scale-[1.02] transition-transform">
              <MindcraftLogo variant="full" size="lg" showTagline={false} />
            </div>

            {/* Brand Motto Ribbon */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-[#0A2558] tracking-widest uppercase">
              <span className="text-[#FF7A00]">Code</span>
              <span className="text-[#00B4D8]">•</span>
              <span className="text-[#0A2558]">Create</span>
              <span className="text-[#00B4D8]">•</span>
              <span className="text-[#FF7A00]">Imagine</span>
              <span className="text-[#00B4D8]">•</span>
              <span className="text-[#0A2558]">Grow</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0A2558] leading-tight">
              Where Technology, Creativity & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#FF8800]">
                Intelligence Converge
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Mindcraft Academy delivers an intelligent educational environment for timed examinations, handwritten essay evaluation, project assignments, and continuous learning progression.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={handleStartLearning}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] hover:from-[#EA580C] hover:to-[#FF7A00] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#FF7A00]/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 group"
              >
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleAdminLogin}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0A2558] hover:bg-[#07193D] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#0A2558]/20 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
                <span>Admin & Educator Portal</span>
              </button>
            </div>

            {/* Enterprise Security & Privacy Trust Strip */}
            <div className="pt-6 border-t border-slate-200/60 max-w-xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span className="font-semibold text-slate-800">Admin Re-Authentication Guard</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-800">100% Student Data Privacy</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-2xs">
                  <Lock className="w-3.5 h-3.5 text-[#00B4D8]" />
                  <span className="font-semibold text-slate-800">Zero Role Escalation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Exam Mockup Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="relative rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs font-mono font-medium text-slate-400">mindcraft.academy/exam/session-live</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#FF7A00] bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60">
                  <Clock className="w-3.5 h-3.5 animate-spin text-[#FF7A00]" />
                  <span>Exam In Progress: 29:43</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FF7A00] uppercase tracking-wider">Question 4 of 4</span>
                    <span className="text-xs font-bold text-slate-500">Marks: 20 pts</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0A2558] leading-snug">
                    Explain the 3 foundational pillars of Object-Oriented Programming (OOP) with real-world examples. Upload your handwritten sheet.
                  </h3>

                  {/* Handwritten Essay Preview Simulation */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-dashed border-amber-200 flex flex-col items-center justify-center text-center py-6">
                    <UploadCloud className="w-8 h-8 text-[#FF7A00] mb-2" />
                    <p className="text-xs font-bold text-slate-800">Handwritten Answer Sheet Attached</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">alex_morgan_oop_essay.png (89 KB)</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Auto-Saved & Encrypted
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Question Navigator</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold text-center">1 ✓</div>
                      <div className="p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold text-center">2 ✓</div>
                      <div className="p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold text-center">3 ✓</div>
                      <div className="p-2.5 rounded-xl bg-[#FF7A00] text-white text-xs font-bold text-center ring-2 ring-orange-300">4 ●</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[11px] font-bold text-[#0A2558]">Auto-Score Status</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">30 / 30 pts auto-graded</p>
                    <p className="text-[10px] text-slate-500">Essay pending instructor evaluation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BrandBackground>

      {/* Brand Values Ribbon */}
      <section className="py-8 bg-[#0A2558] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-[#00B4D8]">CODE</span>
              <p className="text-xs text-slate-300 font-medium">Algorithmic thinking & programming foundations</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-[#FF7A00]">CREATE</span>
              <p className="text-xs text-slate-300 font-medium">Original software projects & coursework solutions</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-[#FBBF24]">IMAGINE</span>
              <p className="text-xs text-slate-300 font-medium">Visionary ideas, creative circuits & architecture</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-[#38BDF8]">GROW</span>
              <p className="text-xs text-slate-300 font-medium">Continuous academic progress & verified mastery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-[#FF7A00] uppercase tracking-widest">
              Mindcraft Academy Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-[#0A2558] tracking-tight">
              Engineered For Academic Excellence
            </p>
            <p className="text-sm text-slate-600">
              A comprehensive toolkit for both students and instructors to conduct rigorous examinations and foster continuous intellectual growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-[#FF7A00] transition-all duration-300 hover:shadow-xl hover:shadow-[#0A2558]/5 hover:-translate-y-1 flex flex-col justify-between ${feat.accent}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0A2558] group-hover:bg-[#0A2558] group-hover:text-white transition-colors shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-orange-50 group-hover:text-[#FF7A00] transition-colors">
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#FF7A00] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-[#0A2558] group-hover:text-[#FF7A00]">
                    <span>Explore feature</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Breakdown: Admin vs Student */}
      <section className="py-20 bg-[#F0F4F8] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-lg flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-[#00B4D8] text-xs font-bold mb-4 border border-cyan-200/60">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Portal</span>
                </div>
                <h3 className="text-2xl font-black text-[#0A2558] tracking-tight mb-3">
                  Take Exams & Submit Projects
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Experience a streamlined, distraction-free environment to take timed exams, upload handwritten diagrams, complete assignments, and monitor your academic trajectory.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Live countdown timer with urgency alerts & auto-submit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Handwritten answer sheets & PDF uploads with instant preview</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Assignment briefs download & file dropzone submission</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Direct teacher remarks and score breakdowns</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleStartLearning}
                className="w-full py-3.5 rounded-xl bg-[#00B4D8] hover:bg-[#0284C7] text-white font-bold text-xs shadow-md shadow-[#00B4D8]/20 transition-all hover:scale-[1.02]"
              >
                Launch Student Workspace
              </button>
            </div>

            {/* Admin Card */}
            <div className="p-8 rounded-3xl bg-[#0A2558] text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-[#FF7A00] text-xs font-bold mb-4 border border-orange-500/30">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Instructor & Admin Portal</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                  Author Exams & Grade Submissions
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Comprehensive educator dashboard to manage curricula, construct dynamic questions, review handwritten essays, and publish verified grades with real-time alerts.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 font-medium mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0" />
                    <span>Dynamic Question Builder (MCQ, True/False, Handwritten Essay)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0" />
                    <span>Split-screen essay grading with student document inspection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0" />
                    <span>Coursework grading with rubric feedback & downloadable files</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0" />
                    <span>Instant student notifications upon grade publishing</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleAdminLogin}
                className="w-full py-3.5 rounded-xl bg-[#FF7A00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md shadow-[#FF7A00]/25 transition-all hover:scale-[1.02]"
              >
                Launch Educator Command Center
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <MindcraftLogo variant="horizontal" size="sm" showTagline={true} />

          <p className="text-xs text-slate-500">
            © 2026 Mindcraft Academy. Code • Create • Imagine • Grow. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs font-semibold text-slate-600">
            <button onClick={() => onNavigate('login')} className="hover:text-[#FF7A00] transition-colors">
              Sign In
            </button>
            <button onClick={() => onNavigate('register')} className="hover:text-[#FF7A00] transition-colors">
              Registration
            </button>
            <button onClick={handleAdminLogin} className="hover:text-[#FF7A00] transition-colors">
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
