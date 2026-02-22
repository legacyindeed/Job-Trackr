'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Sidekick, SidekickSelector, PersonalityType } from '../components/Sidekick';

// Icons as a component
const Icon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'dashboard': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
    case 'logout': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
    case 'briefcase': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
    case 'search': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
    case 'refresh': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
    case 'pipeline': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
    case 'bulb': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2v1" /><path d="M12 14c-2.5 0-4-1.5-4-4a4 4 0 0 1 8 0c0 2.5-1.5 4-4 4z" /><path d="M19.07 4.93L17.66 6.34" /><path d="M4.93 4.93L6.34 6.34" /></svg>;
    case 'download': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
    case 'trash': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
    case 'edit': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
    case 'x': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    case 'check': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
    case 'alert': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
    case 'eye': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
    case 'eye-slash': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
    case 'plus': return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
    default: return null;
  }
};

const motivationalQuotes = [
  "Believe you can and you're halfway there.",
  "Your talent determines what you can do. Your motivation determines how much you're willing to do.",
  "Opportunities don't happen, you create them.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future depends on what you do today."
];

const interviewTips = [
  "Research the company thoroughly before your interview.",
  "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.",
  "Prepare thoughtful questions to ask the interviewer.",
  "Follow up with a thank-you email within 24 hours.",
  "Be ready to discuss your weaknesses as areas for growth."
];

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeFrame, setTimeFrame] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quote, setQuote] = useState('');
  const [dailyTips, setDailyTips] = useState<string[]>([]);
  const [isAnonymized, setIsAnonymized] = useState(false);

  // Sidekick State
  const [personality, setPersonality] = useState<PersonalityType | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trackr_personality') as PersonalityType;
    }
    return null;
  });
  const [sidekickEvent, setSidekickEvent] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [aiHeader, setAiHeader] = useState<string>("Intel Brief");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const fetchSidekickMessage = async (event: string, context?: any) => {
    if (!personality) return;
    setIsAiThinking(true);
    try {
      const res = await fetch('/api/sidekick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality, event, context })
      });
      const data = await res.json();
      setAiMessage(data.text);
      if (data.header) setAiHeader(data.header);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiThinking(false);
    }
  };

  useEffect(() => {
    if (sidekickEvent) {
      const context = sidekickEvent === 'add_job' ? addForm : undefined;
      fetchSidekickMessage(sidekickEvent, context);
      const timer = setTimeout(() => setSidekickEvent(null), 12000);
      return () => clearTimeout(timer);
    }
  }, [sidekickEvent]);

  // Refresh AI Intelligence on Dashboard mount
  useEffect(() => {
    if (personality && activeTab === 'dashboard') {
      fetchSidekickMessage('refresh');
    }
  }, [personality, activeTab]);

  const handleSelectPersonality = (p: PersonalityType) => {
    setPersonality(p);
    localStorage.setItem('trackr_personality', p);
    setSidekickEvent('welcome');
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL Sync for Tabs
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['dashboard', 'applications', 'pipeline'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(pathname + '?' + params.toString());
  };

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', company: '', status: '', salary: '', location: '', notes: '', url: '' });

  // Add State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', company: '', status: 'Applied', salary: '', location: '', jobType: 'Full-time', url: '' });

  const handleAddSubmit = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(addForm)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setAddForm({ title: '', company: '', status: 'Applied', salary: '', location: '', jobType: 'Full-time', url: '' });
        fetchJobs();
        setSidekickEvent('add_job');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Goals State
  const [dailyGoal, setDailyGoal] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dailyGoal') ? parseInt(localStorage.getItem('dailyGoal')!) : 5;
    }
    return 5;
  });
  const [showGoalEdit, setShowGoalEdit] = useState(false);

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState({ type: '30d', startDate: '', endDate: '' });

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      const data = await res.json().catch(() => ({ error: 'Failed to parse response' }));

      if (res.status === 401) {
        if (data.error === 'Unauthorized' || data.error === 'Invalid token') {
          const auth = getFirebaseAuth();
          if (auth) await signOut(auth);
          router.push('/login');
          return;
        }
      }

      if (res.status === 500) {
        setServerError(data.error || 'Internal Server Error');
        setJobs([]);
      } else {
        setJobs(Array.isArray(data) ? data : []);
        setServerError(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // One-time check to link any jobs tracked before authentication
      const claimJobs = async () => {
        try {
          const idToken = await user.getIdToken();
          await fetch('/api/claim-jobs', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          fetchJobs(); // Refresh jobs after claiming
        } catch (e) {
          console.error("Claim failed", e);
        }
      };

      claimJobs();
      fetchJobs();
      const interval = setInterval(fetchJobs, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const rotateQuote = () => {
      fetchSidekickMessage('daily_mission');
    };

    // Initial set
    rotateQuote();

    // Rotate every 45 seconds (slow delay)
    const interval = setInterval(rotateQuote, 45000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading]);

  const filteredJobs = jobs.filter(job => {
    if (timeFrame === 'all') return true;
    const date = new Date(job.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeFrame === '7d') return diffDays <= 7;
    if (timeFrame === '30d') return diffDays <= 30;
    return true;
  });

  const appliedCount = filteredJobs.length;

  // Stats for Dashboard
  const statusCounts = filteredJobs.reduce((acc: any, job: any) => {
    const s = job.status || 'Applied';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Goal calculation
  const today = new Date().toLocaleDateString();
  const todayJobs = jobs.filter(j => new Date(j.date).toLocaleDateString() === today).length;
  const goalProgress = Math.min(100, (todayJobs / dailyGoal) * 100);

  const handleGoalChange = (newGoal: number) => {
    setDailyGoal(newGoal);
    localStorage.setItem('dailyGoal', newGoal.toString());
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const performExport = () => {
    let jobsToExport = [...jobs];
    // Implement actual export logic if needed
    console.log("Exporting...", jobsToExport);
  };

  const handleDeleteJob = async (url: string) => {
    if (!user || !confirm('Are you sure you want to delete this job?')) return;
    try {
      const idToken = await user.getIdToken();
      await fetch('/api/jobs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ url })
      });
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragStart = (e: any, job: any) => {
    e.dataTransfer.setData('jobUrl', job.url);
  };

  const handleDrop = async (e: any, newStatus: string) => {
    e.preventDefault();
    if (!user) return;
    const url = e.dataTransfer.getData('jobUrl');
    const job = jobs.find(j => j.url === url);
    if (!job || job.status === newStatus) return;

    try {
      const idToken = await user.getIdToken();
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ ...job, status: newStatus })
      });
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const getHeaderStyles = (status: string) => {
    switch (status) {
      case 'Applied': return 'text-slate-600 bg-slate-100';
      case 'Interviewing': return 'text-blue-600 bg-blue-100';
      case 'Offer': return 'text-purple-600 bg-purple-100';
      case 'Rejected': return 'text-slate-400 bg-slate-50';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const handleEditClick = (job: any) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || '',
      company: job.company || '',
      status: job.status || 'Applied',
      salary: job.salary || '',
      location: job.location || '',
      notes: job.notes || '',
      url: job.url || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingJob || !user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ ...editingJob, ...editForm })
      });
      setIsEditModalOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch (e) {
      console.error("Failed to save edit", e);
    }
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-6 text-slate-900">
      {/* Error Banner */}
      {serverError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon name="alert" className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Server Configuration Error</p>
                <p className="text-sm opacity-80">{serverError}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-xs font-bold transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => handleTabChange('applications')}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-left hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="text-slate-500 text-sm font-medium mb-1 group-hover:text-blue-500 transition-colors">Total Applications</div>
          <div className="text-3xl font-bold text-slate-800">{appliedCount}</div>
          <div className="mt-2 text-xs text-green-600 font-medium">+ Updated just now</div>
        </button>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 bg-gradient-to-br from-blue-50 to-white">
          <div className="text-blue-600 text-sm font-medium mb-1">Interviewing</div>
          <div className="text-3xl font-bold text-blue-900">{statusCounts['Interviewing'] || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 bg-gradient-to-br from-purple-50 to-white">
          <div className="text-purple-600 text-sm font-medium mb-1">Offers</div>
          <div className="text-3xl font-bold text-purple-900">{statusCounts['Offer'] || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium mb-1">Rejected</div>
          <div className="text-3xl font-bold text-slate-400">{statusCounts['Rejected'] || 0}</div>
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-800">Recent Applications</h3>
              <button
                onClick={() => setIsAnonymized(!isAnonymized)}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 group"
                title={isAnonymized ? "Show names" : "Anonymize names"}
              >
                <Icon name={isAnonymized ? "eye-slash" : "eye"} className="w-4 h-4 group-hover:text-blue-500" />
              </button>
            </div>
            <button onClick={() => handleTabChange('applications')} className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 text-lg italic">
                    {job.company?.[0]?.toUpperCase() || 'J'}
                  </div>
                  <div>
                    <p className={`font-bold text-sm text-slate-800 transition-all duration-300 ${isAnonymized ? 'blur-[4px] select-none opacity-50' : ''}`}>
                      {isAnonymized ? 'Role Hidden' : job.title}
                    </p>
                    <p className={`text-xs text-slate-400 font-medium transition-all duration-300 ${isAnonymized ? 'blur-[4px] select-none opacity-40' : ''}`}>
                      {isAnonymized ? 'Company Hidden' : job.company}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight ${getHeaderStyles(job.status)}`}>
                  {job.status}
                </span>
              </div>
            ))}
            {jobs.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic">No applications found yet.</p>}
          </div>
        </div>

        {/* Motivational Quote & Tips */}
        <div className="space-y-6">


          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Icon name="check" className="w-5 h-5 text-green-500" />
              Interview Tip of the Day
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
              {interviewTips[Math.floor(new Date().getDate() % interviewTips.length)]}
            </p>
          </div>

          {/* Daily Goal Bar */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-medium text-slate-800">Daily Goal</h3>
                <p className="text-[10px] text-slate-500">Apply: {dailyGoal} positions today</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-lg font-black text-blue-600">{todayJobs}</span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="text-sm font-bold text-slate-400">{dailyGoal}</span>
                </div>
                <button
                  onClick={() => setShowGoalEdit(!showGoalEdit)}
                  className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"
                >
                  <Icon name="edit" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {showGoalEdit && (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="range" min="1" max="20"
                  value={dailyGoal}
                  onChange={(e) => handleGoalChange(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-bold text-blue-600 w-6">{dailyGoal}</span>
              </div>
            )}

            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                style={{ width: `${goalProgress}%` }}
              >
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Job Pipeline</h2>
          <p className="text-sm text-slate-500">Manage and track your application status</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-xl rounded-none shadow-sm border border-slate-200 overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Job Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Salary</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {jobs.filter(j =>
              j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              j.company.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((job, i) => (
              <tr
                key={i}
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => window.open(job.url, '_blank')}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-slate-800 font-medium">{job.title}</p>
                    {job.url && <span className="text-slate-300 text-[10px]" title={job.url}>🔗</span>}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{job.company} • {job.location || 'Remote'}</p>
                </td>
                <td className="px-6 py-4">
                  {job.salary ? <span className="text-sm text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-lg">{job.salary}</span> : <span className="text-slate-300 text-xs">-</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-wide ${getHeaderStyles(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                  {new Date(job.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(job); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.url); }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <div className="p-20 text-center">
            <Icon name="briefcase" className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No applications found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPipeline = () => {
    const statuses = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Visual Pipeline</h2>
          <p className="text-sm text-slate-500">Drag and drop jobs to change their status</p>
        </div>

        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {statuses.map(status => (
            <div
              key={status}
              className="flex-shrink-0 w-80 bg-slate-100/50 rounded-2xl border border-slate-200/50 flex flex-col p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex justify-between items-center mb-4 select-none">
                <h4 className={`font-bold text-sm uppercase tracking-wide ${getHeaderStyles(status).split(' ')[0]}`}>{status}</h4>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getHeaderStyles(status)}`}>{statusCounts[status] || 0}</span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 min-h-[200px]">
                {filteredJobs.filter((j: any) => (j.status || 'Applied') === status).map((job: any, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job)}
                    onClick={() => window.open(job.url, '_blank')}
                    className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-blue-300 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-sm font-medium text-slate-800 leading-snug">{job.title}</h5>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.url); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1 -mt-1 -mr-1"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 mb-3 font-medium">{job.company}</p>

                    <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                        {new Date(job.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {job.salary && <span className="text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">{job.salary.replace(/.*(\$[\d,]+k?).*/i, '$1')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-40 pb-safe">
      <button
        onClick={() => handleTabChange('dashboard')}
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'}`}
      >
        <Icon name="dashboard" className="w-6 h-6" />
        Dashboard
      </button>
      <button
        onClick={() => handleTabChange('applications')}
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTab === 'applications' ? 'text-blue-600' : 'text-slate-500'}`}
      >
        <Icon name="briefcase" className="w-6 h-6" />
        Applications
      </button>
      <button
        onClick={() => handleTabChange('pipeline')}
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTab === 'pipeline' ? 'text-blue-600' : 'text-slate-500'}`}
      >
        <Icon name="pipeline" className="w-6 h-6" />
        Pipeline
      </button>
    </div>
  );

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 pb-16 md:pb-0">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <span className="font-bold text-lg text-slate-800">Trackr</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => handleTabChange('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Icon name="dashboard" className="w-5 h-5" />
            Dashboard
          </button>
          <button onClick={() => handleTabChange('applications')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'applications' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Icon name="briefcase" className="w-5 h-5" />
            Applications
          </button>
          <button onClick={() => handleTabChange('pipeline')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pipeline' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Icon name="pipeline" className="w-5 h-5" />
            Pipeline
          </button>
        </nav>

        <div className="px-4 pb-4">
          <a href="#" target="_blank" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 bg-slate-50/50">
            <Icon name="download" className="w-5 h-5 text-slate-400" />
            Get Extension
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="px-8 h-20 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h1>

            <div className="flex items-center gap-4">
              {activeTab === 'applications' && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 border border-white/10"
                >
                  <Icon name="plus" className="w-3.5 h-3.5" />
                  Add Job
                </button>
              )}
              <button onClick={fetchJobs} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Refresh">
                <Icon name="refresh" className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={handleExportClick} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Export">
                <Icon name="download" className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-800">{user?.displayName?.split(' ')[0] || 'User'}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                    {user?.email ? (
                      user.email.replace(/(.{1,2})(.*)(@.*)/, '$1***$3')
                    ) : '***@***.***'}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const auth = getFirebaseAuth();
                    if (auth) await signOut(auth);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Log Out"
                >
                  <Icon name="logout" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'applications' && renderApplications()}
          {activeTab === 'pipeline' && renderPipeline()}
        </div>

        {activeTab === 'dashboard' && personality && (
          <div className="hidden sm:block fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[640px] px-3 sm:px-4 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/40 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl sm:rounded-full py-3 px-4 sm:py-3.5 sm:px-6 flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pointer-events-auto group hover:shadow-[0_12px_50px_rgba(0,0,0,0.15)] transition-all">

              {/* Profile Bubble (Left) */}
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex-shrink-0 flex items-center justify-center text-xl sm:text-2xl shadow-md border border-white/50 relative overflow-hidden ${personality === 'serge' ? 'bg-emerald-500' : personality === 'jax' ? 'bg-indigo-500' : 'bg-teal-500'
                }`}>
                <span className="relative z-10 transition-transform group-hover:scale-110 duration-300">
                  {personality === 'serge' && '🎖️'}{personality === 'jax' && '🎸'}{personality === 'luna' && '🌙'}
                </span>
              </div>

              {/* Content Area (Right) */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 leading-none mb-0.5 sm:mb-1">
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-colors ${isAiThinking ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`}>
                    {isAiThinking ? 'Analyzing' : aiHeader}
                  </span>
                  <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-slate-200"></div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-300 uppercase italic">{personality}</span>
                </div>

                <div className="relative">
                  <p className="text-[15px] sm:text-[21px] font-normal text-slate-700 leading-snug line-clamp-2 group-hover:line-clamp-none transition-all duration-300 italic pr-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    "{aiMessage || "Connecting..."}"
                  </p>

                  {isAiThinking && (
                    <div className="absolute inset-0 bg-white/60 flex items-center gap-1 sm:gap-1.5">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!personality && (
          <SidekickSelector onSelect={handleSelectPersonality} />
        )}
      </main>

      {/* Add Modal */}
      {
        isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">Add New Application</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Job Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Frontend Engineer"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={addForm.title}
                      onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={addForm.company}
                      onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. New York, NY"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={addForm.location}
                      onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Salary</label>
                    <input
                      type="text"
                      placeholder="e.g. $120k"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={addForm.salary}
                      onChange={(e) => setAddForm({ ...addForm, salary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Job Type</label>
                    <select
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={addForm.jobType}
                      onChange={(e) => setAddForm({ ...addForm, jobType: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                {/* Job URL - full width */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Job Posting URL</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔗</span>
                    <input
                      type="url"
                      placeholder="https://jobs.company.com/role"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={addForm.url}
                      onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={!addForm.title || !addForm.company}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Entry
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Modal */}
      {
        isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">Edit Application</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Salary</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. $120k"
                      value={editForm.salary}
                      onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>

                {/* Job URL - full width */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Job Posting URL</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔗</span>
                    <input
                      type="url"
                      placeholder="https://jobs.company.com/role"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.url || ''}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                  <textarea
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Icon name="check" className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Export Modal */}
      {
        isExportModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">Export Options</h3>
                <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      checked={exportConfig.type === '7d'}
                      onChange={() => setExportConfig({ ...exportConfig, type: '7d' })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Last 7 Days</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      checked={exportConfig.type === '30d'}
                      onChange={() => setExportConfig({ ...exportConfig, type: '30d' })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Last 30 Days</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      checked={exportConfig.type === 'custom'}
                      onChange={() => setExportConfig({ ...exportConfig, type: 'custom' })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Custom Range (Max 90 days)</span>
                  </label>
                </div>

                {exportConfig.type === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={exportConfig.startDate}
                        onChange={(e) => setExportConfig({ ...exportConfig, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">End Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={exportConfig.endDate}
                        onChange={(e) => setExportConfig({ ...exportConfig, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={performExport}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        )
      }
      {renderMobileNav()}

      {/* Mobile Floating Add Button */}
      {
        activeTab === 'applications' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="md:hidden fixed bottom-24 right-6 w-12 h-12 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center z-40 active:scale-90 transition-transform"
          >
            <Icon name="plus" className="w-6 h-6" />
          </button>
        )
      }
    </div >
  );
}
