import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { interviewAPI, applicationAPI } from '../../api/v2';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ChevronDownIcon,
  PlusIcon,
  BriefcaseIcon as JobIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

/* ─── constants ─────────────────────────────────────────────────────────────── */
const ROUND_ORDER = ['aptitude', 'technical', 'hr'];

const roundMeta = {
  aptitude:  { label: 'Aptitude',  icon: PuzzlePieceIcon, color: 'violet', gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-50 text-violet-700 border-violet-200' },
  technical: { label: 'Technical', icon: CodeBracketIcon,  color: 'blue',   gradient: 'from-blue-500 to-indigo-600',  light: 'bg-blue-50 text-blue-700 border-blue-200'     },
  hr:        { label: 'HR',        icon: BriefcaseIcon,    color: 'emerald',gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const statusMeta = {
  pending:    { label: 'Pending',     cls: 'bg-gray-100 text-gray-600'    },
  in_progress:{ label: 'In Progress', cls: 'bg-blue-100 text-blue-700'    },
  completed:  { label: 'Completed',   cls: 'bg-amber-100 text-amber-700'  },
  evaluated:  { label: 'Evaluated',   cls: 'bg-green-100 text-green-700'  },
  expired:    { label: 'Expired',     cls: 'bg-red-100 text-red-600'      },
};

const recMeta = {
  strong_hire: { label: 'Strong Hire', cls: 'bg-emerald-100 text-emerald-700' },
  hire:         { label: 'Hire',        cls: 'bg-green-100 text-green-700'    },
  maybe:        { label: 'Maybe',       cls: 'bg-amber-100 text-amber-700'    },
  reject:       { label: 'Reject',      cls: 'bg-red-100 text-red-700'        },
};

/* ─── small helpers ─────────────────────────────────────────────────────────── */
function getRoundProgress(interview) {
  const cur = interview?.currentRound || 'aptitude';
  const curIdx = ROUND_ORDER.indexOf(cur);
  return ROUND_ORDER.map((r, i) => ({
    round: r,
    state: i < curIdx ? 'passed' : i === curIdx ? 'active' : 'pending',
  }));
}

function RoundPipeline({ interview, compact = false }) {
  const progress = getRoundProgress(interview);
  return (
    <div className={`flex items-center gap-1 ${compact ? 'gap-0.5' : 'gap-2'}`}>
      {progress.map(({ round, state }, i) => {
        const meta = roundMeta[round];
        const Icon = meta.icon;
        return (
          <React.Fragment key={round}>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
              state === 'passed'  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              state === 'active'  ? `bg-${meta.color}-50 border-${meta.color}-200 text-${meta.color}-700` :
              'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              {state === 'passed' ? (
                <CheckCircleIcon className="h-3 w-3 text-emerald-600" />
              ) : (
                <Icon className={`h-3 w-3 ${state === 'active' ? `text-${meta.color}-600` : 'text-gray-300'}`} />
              )}
              {!compact && <span>{meta.label}</span>}
            </div>
            {i < ROUND_ORDER.length - 1 && (
              <ArrowRightIcon className={`h-3 w-3 flex-shrink-0 ${state === 'passed' ? 'text-emerald-400' : 'text-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Start Round Modal ─────────────────────────────────────────────────────── */
function StartRoundModal({ interview, onClose, onStarted }) {
  const [round, setRound] = useState(interview?.currentRound || 'aptitude');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(interview?.applicationId?._id || interview?.applicationId || '');

  useEffect(() => {
    if (!interview) {
      // fetch applications to pick one
      applicationAPI.list({ limit: 50, status: 'shortlisted' })
        .then(r => setApplications(r.data.data || []))
        .catch(() => {});
    }
  }, [interview]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const appId = interview?.applicationId?._id || interview?.applicationId || selectedApp;
      await interviewAPI.start({ applicationId: appId, round });
      onStarted();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start round');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Start Interview Round</h3>
          <p className="text-gray-500 text-sm mt-1">
            {interview ? `Candidate: ${interview.candidateId?.name}` : 'Select an application and round'}
          </p>
        </div>

        {!interview && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Application</label>
            <select value={selectedApp} onChange={e => setSelectedApp(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
              <option value="">Select application…</option>
              {applications.map(a => (
                <option key={a._id} value={a._id}>{a.candidateId?.name} — {a.jobId?.title}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Round</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ROUND_ORDER.map(r => {
              const m = roundMeta[r];
              const Icon = m.icon;
              return (
                <button key={r} onClick={() => setRound(r)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold ${
                    round === r ? `border-${m.color}-400 bg-${m.color}-50 text-${m.color}-700` : 'border-gray-100 text-gray-500 hover:border-gray-300'
                  }`}>
                  <Icon className="h-5 w-5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`rounded-xl p-3 text-xs ${
          round === 'aptitude' ? 'bg-violet-50 text-violet-700' :
          round === 'technical' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {round === 'aptitude' && '📝 30 MCQ Questions · 45 minutes · Logical & Quantitative'}
          {round === 'technical' && '💻 35 MCQ Questions · 45 minutes · Domain knowledge'}
          {round === 'hr' && '🎥 Live video interview · 30–45 min · Culture fit session'}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleStart} disabled={loading || (!interview && !selectedApp)}
            className={`flex-1 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 bg-gradient-to-r ${
              round === 'aptitude' ? 'from-violet-500 to-purple-600' :
              round === 'technical' ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'
            }`}>
            {loading ? 'Starting…' : 'Start Round'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Evaluate Modal ────────────────────────────────────────────────────────── */
function EvaluateModal({ interview, onClose, onDone }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await interviewAPI.evaluate(interview._id);
      setResult(res.data.data);
      onDone();
    } catch (err) {
      alert(err.response?.data?.message || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto">
          <SparklesIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Evaluate Interview</h3>
          <p className="text-gray-500 text-sm mt-1">
            Run AI evaluation on <strong>{interview?.candidateId?.name}</strong>'s answers to generate scores and recommendation.
          </p>
        </div>

        {result && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-bold text-emerald-800">✅ Evaluation Complete</p>
            <p className="text-sm text-emerald-700">Score: <strong>{result.overallScore}%</strong></p>
            <p className="text-sm text-emerald-700">Recommendation: <strong>{result.recommendation?.replace('_', ' ')?.toUpperCase()}</strong></p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">
            Close
          </button>
          {!result && (
            <button onClick={handleEvaluate} disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold hover:opacity-90 disabled:opacity-60">
              {loading ? 'Evaluating…' : '✨ Run AI Eval'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Reject Modal ─────────────────────────────────────────────────────────── */
function RejectModal({ interview, onClose, onDone }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleReject = async () => {
    setLoading(true);
    try {
      await applicationAPI.updateStatus(interview.applicationId._id || interview.applicationId, {
        status: 'rejected',
        notes: reason || 'Did not meet requirements after interview evaluation.'
      });
      onDone();
      onClose();
    } catch (err) {
      alert('Failed to reject candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
          <XCircleIcon className="h-7 w-7 text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Reject Candidate?</h3>
          <p className="text-gray-500 text-sm mt-1">
            Are you sure you want to reject <strong>{interview?.candidateId?.name}</strong>? This will send an automated rejection email.
          </p>
        </div>
        
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Optional reason for rejection (internal notes)..."
          className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-red-500 focus:border-red-500 min-h-[80px]"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleReject} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Interview Row ─────────────────────────────────────────────────────────── */
function InterviewRow({ iv, onAction, navigate }) {
  const [open, setOpen] = useState(false);
  const status = statusMeta[iv.status] || statusMeta.pending;
  const rec = iv.recommendation ? recMeta[iv.recommendation] : null;
  const aptQs   = (iv.questions || []).filter(q => q.round === 'aptitude');
  const techQs  = (iv.questions || []).filter(q => q.round === 'technical');
  const aptDone  = aptQs.filter(q => q.answer).length;
  const techDone = techQs.filter(q => q.answer).length;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${open ? 'border-violet-200 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}>
      {/* Row summary */}
      <div className="flex items-center justify-between gap-4 p-5 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow">
            <span className="text-white font-bold text-sm">{iv.candidateId?.name?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{iv.candidateId?.name || 'Unknown'}</p>
            <p className="text-xs text-gray-500 truncate">{iv.candidateId?.email}</p>
          </div>
        </div>

        {/* Pipeline visual */}
        <div className="hidden md:block">
          <RoundPipeline interview={iv} />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {rec && (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${rec.cls}`}>{rec.label}</span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.cls}`}>{status.label}</span>
          {iv.overallScore != null && (
            <span className="text-sm font-extrabold text-violet-600">{iv.overallScore}%</span>
          )}
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Aptitude progress */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <PuzzlePieceIcon className="h-4 w-4 text-violet-600" />
                <span className="text-xs font-bold text-violet-700">Aptitude Round</span>
              </div>
              {aptQs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Not started</p>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-violet-600 mb-1">
                    <span>{aptDone}/{aptQs.length} answered</span>
                    <span className="font-bold">{Math.round((aptDone / aptQs.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-violet-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all"
                      style={{ width: `${(aptDone / aptQs.length) * 100}%` }} />
                  </div>
                </>
              )}
            </div>

            {/* Technical progress */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CodeBracketIcon className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700">Technical Round</span>
              </div>
              {techQs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Not started</p>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-blue-600 mb-1">
                    <span>{techDone}/{techQs.length} answered</span>
                    <span className="font-bold">{Math.round((techDone / techQs.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                      style={{ width: `${(techDone / techQs.length) * 100}%` }} />
                  </div>
                </>
              )}
            </div>

            {/* HR Round */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BriefcaseIcon className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">HR Round</span>
              </div>
              {iv.currentRound !== 'hr' ? (
                <p className="text-xs text-gray-400 italic">Pending previous rounds</p>
              ) : (
                <p className="text-xs text-emerald-600 font-medium">🎥 Ready for HR Interview</p>
              )}
            </div>
          </div>

          {/* Overall score if evaluated */}
          {iv.status === 'evaluated' && (
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-extrabold text-violet-600">{iv.overallScore}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Overall Score</p>
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${rec?.cls || 'bg-gray-100 text-gray-600'}`}>
                    {rec?.label || '—'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Recommendation</p>
                </div>
                <div className="sm:col-span-2 text-left">
                  <p className="text-xs text-gray-500 mb-1">Feedback Summary</p>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{iv.feedbackSummary || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to={`/app/interviews/${iv._id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors">
              <EyeIcon className="h-3.5 w-3.5" /> Full Exam View
            </Link>
            <button onClick={() => onAction('start', iv)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-100 text-violet-700 text-xs font-medium hover:bg-violet-200 transition-colors">
              <PlayIcon className="h-3.5 w-3.5" /> Start / Next Round
            </button>
            {(iv.status === 'completed' || iv.status === 'in_progress') && (
              <button onClick={() => onAction('evaluate', iv)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium hover:bg-indigo-200 transition-colors">
                <SparklesIcon className="h-3.5 w-3.5" /> AI Evaluate
              </button>
            )}
            {iv.currentRound === 'hr' && (
              <button onClick={() => onAction('hr_video', iv)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium hover:bg-emerald-200 transition-colors">
                🎥 Join HR Video Call
              </button>
            )}
            <button onClick={() => onAction('reject', iv)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors ml-auto">
                <XCircleIcon className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN HR Interview Management ──────────────────────────────────────────── */
const HRInterviewPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, evaluated: 0 });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRound, setFilterRound] = useState('');
  const [modal, setModal] = useState(null); // { type: 'start'|'evaluate', interview }
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterStatus) params.status = filterStatus;
      const res = await interviewAPI.list(params);
      const data = res.data.data || [];
      setInterviews(data);
      const meta = res.data.meta || {};
      setTotalPages(meta.pages || 1);

      // compute stats
      setStats({
        total: meta.total || data.length,
        pending:    data.filter(i => i.status === 'pending').length,
        inProgress: data.filter(i => i.status === 'in_progress').length,
        evaluated:  data.filter(i => i.status === 'evaluated').length,
        completed:  data.filter(i => i.status === 'completed').length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  const handleAction = (type, interview) => {
    if (type === 'hr_video') {
      navigate(`/app/interviews/${interview._id}`);
      return;
    }
    setModal({ type, interview });
  };

  const filtered = interviews.filter(iv => {
    const matchSearch = !search ||
      iv.candidateId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      iv.candidateId?.email?.toLowerCase().includes(search.toLowerCase());
    const matchRound = !filterRound || iv.currentRound === filterRound;
    return matchSearch && matchRound;
  });

  return (
    <>
      {/* Modals */}
      {modal?.type === 'start' && (
        <StartRoundModal
          interview={modal.interview}
          onClose={() => setModal(null)}
          onStarted={fetchInterviews}
        />
      )}
      {modal?.type === 'evaluate' && (
        <EvaluateModal
          interview={modal.interview}
          onClose={() => setModal(null)}
          onDone={fetchInterviews}
        />
      )}
      {modal?.type === 'reject' && (
        <RejectModal
          interview={modal.interview}
          onClose={() => setModal(null)}
          onDone={fetchInterviews}
        />
      )}

      <div className="space-y-6 pb-12">
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 border border-violet-200 rounded-full text-violet-700 text-xs font-semibold mb-2">
              <SparklesIcon className="h-3.5 w-3.5" /> HR Interview Management
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Interview Pipeline</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage all candidate interview rounds from one place</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal({ type: 'start', interview: null })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg">
              <PlusIcon className="h-4 w-4" /> Start New Round
            </button>
            <button onClick={fetchInterviews}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total,      icon: UserGroupIcon,           cls: 'from-slate-500 to-slate-700' },
            { label: 'Pending', value: stats.pending,  icon: ClockIcon,               cls: 'from-amber-400 to-orange-500' },
            { label: 'Active', value: stats.inProgress,icon: PlayIcon,                cls: 'from-blue-500 to-indigo-600'  },
            { label: 'Evaluated', value: stats.evaluated, icon: CheckCircleIcon,      cls: 'from-emerald-500 to-teal-600' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.cls} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Round progress overview ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Round Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            {ROUND_ORDER.map(r => {
              const m = roundMeta[r];
              const Icon = m.icon;
              const count = interviews.filter(iv => iv.currentRound === r).length;
              const pct = interviews.length ? Math.round((count / interviews.length) * 100) : 0;
              return (
                <div key={r} className={`rounded-xl border p-4 ${m.light}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-bold">{m.label}</span>
                    </div>
                    <span className="text-lg font-extrabold">{count}</span>
                  </div>
                  <div className={`w-full bg-${m.color}-100 h-1.5 rounded-full overflow-hidden`}>
                    <div className={`h-full bg-gradient-to-r ${m.gradient} transition-all`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] mt-1 opacity-70">{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search candidate name or email…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
            />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-200 py-2.5 px-3 text-sm focus:ring-2 focus:ring-violet-500 bg-white">
            <option value="">All Status</option>
            {Object.entries(statusMeta).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={filterRound} onChange={e => setFilterRound(e.target.value)}
            className="rounded-xl border border-gray-200 py-2.5 px-3 text-sm focus:ring-2 focus:ring-violet-500 bg-white">
            <option value="">All Rounds</option>
            {ROUND_ORDER.map(r => (
              <option key={r} value={r}>{roundMeta[r].label}</option>
            ))}
          </select>
          {(search || filterStatus || filterRound) && (
            <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterRound(''); }}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-red-50">
              Clear filters
            </button>
          )}
        </div>

        {/* ── Interview list ── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No interviews found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || filterStatus || filterRound ? 'Try clearing your filters' : 'Start a new interview round to get going'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium px-1">{filtered.length} interview{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map(iv => (
              <InterviewRow key={iv._id} iv={iv} onAction={handleAction} navigate={navigate} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                    Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HRInterviewPanel;
