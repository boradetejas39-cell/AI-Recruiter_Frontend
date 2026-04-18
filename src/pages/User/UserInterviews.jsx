import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  MicrophoneIcon as MicSolid,
  VideoCameraIcon as CamSolid,
} from '@heroicons/react/24/solid';
import HRVideoRoom from '../../components/Interviews/HRVideoRoom';

/* ─── constants ─────────────────────────────────────────────────────────────── */
const ROUND_ORDER = ['aptitude', 'technical', 'hr'];

const roundMeta = {
  aptitude: {
    label: 'Aptitude Round',
    short: 'Aptitude',
    icon: PuzzlePieceIcon,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50 text-violet-700 border-violet-200',
    desc: '30 MCQ questions · 45 min · Logical & Quantitative reasoning',
  },
  technical: {
    label: 'Technical Round',
    short: 'Technical',
    icon: CodeBracketIcon,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: '35 MCQ questions · 45 min · Domain knowledge & problem solving',
  },
  hr: {
    label: 'HR Round',
    short: 'HR',
    icon: BriefcaseIcon,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Live video interview · 30–45 min · Culture fit & expectations',
  },
};

/* ─── round state logic ─────────────────────────────────────────────────────── */
function getRoundStates(interview) {
  const cur = interview?.currentRound || 'aptitude';
  const rec = interview?.recommendation;
  const status = interview?.status;
  const curIdx = ROUND_ORDER.indexOf(cur);

  return ROUND_ORDER.map((r, i) => {
    if (i < curIdx) return { round: r, state: 'passed' };
    if (i === curIdx) {
      if (status === 'completed' || status === 'evaluated') {
        return { round: r, state: rec === 'reject' ? 'failed' : 'passed' };
      }
      return { round: r, state: 'active' };
    }
    return { round: r, state: rec === 'reject' ? 'locked' : 'pending' };
  });
}

/* ─── RoundCard (live pipeline) ─────────────────────────────────────────────── */
function RoundCard({ round, state, index, onStartHR, interviewId }) {
  const meta = roundMeta[round];
  const Icon = meta.icon;

  const cfg = {
    passed:  { ring: 'ring-2 ring-emerald-400', badge: 'bg-emerald-100 text-emerald-700', badgeText: 'Passed ✓',           iconBg: `bg-gradient-to-br ${meta.gradient}`, cardBg: 'bg-white',      connector: 'bg-emerald-400' },
    active:  { ring: `ring-2 ring-${meta.color}-400 shadow-lg`, badge: `bg-${meta.color}-100 text-${meta.color}-700`, badgeText: 'In Progress', iconBg: `bg-gradient-to-br ${meta.gradient}`, cardBg: 'bg-white',      connector: 'bg-gray-200'   },
    pending: { ring: 'ring-1 ring-gray-200',    badge: 'bg-amber-50 text-amber-600',    badgeText: 'Upcoming',             iconBg: 'bg-gray-100',                         cardBg: 'bg-white',      connector: 'bg-gray-200'   },
    locked:  { ring: 'ring-1 ring-red-200',     badge: 'bg-red-50 text-red-600',        badgeText: 'Locked',               iconBg: 'bg-gray-100',                         cardBg: 'bg-red-50/30',  connector: 'bg-gray-200'   },
    failed:  { ring: 'ring-2 ring-red-300',     badge: 'bg-red-100 text-red-700',       badgeText: 'Not Cleared',          iconBg: 'bg-red-100',                          cardBg: 'bg-red-50/40',  connector: 'bg-gray-200'   },
  }[state] || {};

  const isPassed  = state === 'passed';
  const isActive  = state === 'active';
  const isLocked  = state === 'locked' || state === 'failed';
  const isPending = state === 'pending';

  return (
    <div className="flex flex-col items-center">
      {index > 0 && (
        <div className={`w-1 h-8 rounded-full ${cfg.connector} transition-all duration-500`} />
      )}
      <div className={`w-full rounded-2xl p-6 transition-all duration-300 ${cfg.cardBg} ${cfg.ring}`}>
        <div className="flex items-start gap-5">
          {/* Icon */}
          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
            {isPassed ? (
              <CheckCircleIcon className="h-8 w-8 text-white" />
            ) : isLocked ? (
              <LockClosedIcon className="h-7 w-7 text-gray-400" />
            ) : (
              <Icon className={`h-7 w-7 ${isActive ? 'text-white' : 'text-gray-400'}`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className={`text-lg font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                {meta.label}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                {cfg.badgeText}
              </span>
              {isActive && (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                  <ClockIcon className="h-3.5 w-3.5" /> Live Now
                </span>
              )}
            </div>
            <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>{meta.desc}</p>

            {isActive && round !== 'hr' && (
              <a href={interviewId ? `/app/interviews/${interviewId}/${round}` : '/app/interviews'}
                className={`mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${meta.gradient} hover:opacity-90 transition-opacity shadow-md`}>
                Start Exam <ArrowRightIcon className="h-4 w-4" />
              </a>
            )}
            {isActive && round === 'hr' && (
              <button onClick={onStartHR}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-opacity shadow-md">
                <VideoCameraIcon className="h-5 w-5" /> Join HR Video Interview
              </button>
            )}
            {isPending && (
              <p className="mt-3 text-xs text-gray-400 italic flex items-center gap-1">
                <LockClosedIcon className="h-3.5 w-3.5" /> Unlocks after clearing the previous round
              </p>
            )}
            {isPassed && round !== 'hr' && (
              <p className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" /> Round cleared — next round unlocked
              </p>
            )}
            {isPassed && round === 'hr' && (
              <p className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
                <SparklesIcon className="h-4 w-4" /> HR round complete — awaiting final decision
              </p>
            )}
            {state === 'failed' && (
              <p className="mt-3 text-xs text-red-500 font-medium flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" /> Did not clear this round
              </p>
            )}
          </div>

          {/* Step number */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
            ${isPassed ? 'border-emerald-400 text-emerald-600 bg-emerald-50' :
              isActive  ? `border-${meta.color}-400 text-${meta.color}-600 bg-${meta.color}-50` :
              'border-gray-200 text-gray-400 bg-gray-50'}`}>
            {index + 1}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PreviewRoundCard (empty/no-interview state) ───────────────────────────── */
function PreviewRoundCard({ round, index, isFirst, onTryVideo }) {
  const meta = roundMeta[round];
  const Icon = meta.icon;
  const gradients = { aptitude: 'from-violet-500 to-purple-600', technical: 'from-blue-500 to-indigo-600', hr: 'from-emerald-500 to-teal-600' };
  const acc = {
    aptitude: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', border: 'border-violet-100' },
    technical: { bg: 'bg-blue-50',  text: 'text-blue-700',   ring: 'ring-blue-200',   border: 'border-blue-100'  },
    hr:        { bg: 'bg-emerald-50',text: 'text-emerald-700',ring: 'ring-emerald-200',border: 'border-emerald-100'},
  }[round];

  return (
    <div className="flex flex-col items-stretch">
      {index > 0 && (
        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full" />
        </div>
      )}
      <div className={`relative rounded-2xl border ${acc.border} bg-white p-6 hover:shadow-md transition-all`}>
        {isFirst && (
          <div className="absolute -top-3 left-6">
            <span className="inline-flex items-center gap-1 bg-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
              <SparklesIcon className="h-3 w-3" /> Starts Here
            </span>
          </div>
        )}
        <div className="flex items-start gap-5">
          <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${gradients[round]} flex items-center justify-center shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h3 className="text-base font-bold text-gray-900">{meta.label}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${acc.bg} ${acc.text}`}>
                {round === 'hr' ? 'Live Video' : 'MCQ Exam'}
              </span>
            </div>
            <p className="text-sm text-gray-500">{meta.desc}</p>
            {round === 'hr' && (
              <div className="mt-3 space-y-2">
                <p className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                  <VideoCameraIcon className="h-4 w-4" />
                  Camera + Microphone required — like Google Meet
                </p>
                <button onClick={onTryVideo}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 transition-colors">
                  <VideoCameraIcon className="h-3.5 w-3.5" /> Preview Video Room →
                </button>
              </div>
            )}
          </div>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${acc.bg} ring-2 ${acc.ring} flex items-center justify-center text-sm font-bold ${acc.text}`}>
            {index + 1}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────────── */
const UserInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showHRRoom, setShowHRRoom] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { interviewAPI } = await import('../../api/v2');
        const res = await interviewAPI.list({ limit: 20 });
        const data = res.data.data || [];
        setInterviews(data);
        if (data.length > 0) setSelected(data[0]._id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentInterview = interviews.find(iv => iv._id === selected);
  const roundStates = currentInterview ? getRoundStates(currentInterview) : [];
  const overallProgress = roundStates.length
    ? Math.round((roundStates.filter(r => r.state === 'passed').length / ROUND_ORDER.length) * 100)
    : 0;

  return (
    <>
      {showHRRoom && <HRVideoRoom userName={user?.name} onClose={() => setShowHRRoom(false)} />}

      <div className="space-y-8 pb-12">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 border border-violet-200 rounded-full text-violet-700 text-xs font-semibold mb-2">
              <SparklesIcon className="h-3.5 w-3.5" /> AI-Powered Interview Pipeline
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Interviews</h1>
            <p className="text-gray-500 mt-1 text-sm">Track your progress through each interview round</p>
          </div>
          {interviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
              <UserGroupIcon className="h-4 w-4 text-violet-500" />
              {interviews.length} interview{interviews.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
          </div>

        /* ── No interviews: preview ── */
        ) : interviews.length === 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Info + How it works */}
            <div className="xl:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">No interviews yet</h2>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    Once you apply for a job and get shortlisted, your 3-round pipeline will appear here automatically.
                  </p>
                </div>
                <a href="/app/user/jobs"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg w-full">
                  Browse Jobs <ArrowRightIcon className="h-4 w-4" />
                </a>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">How it works</h3>
                {[
                  { icon: '📄', title: 'Apply for a Job', desc: 'Submit your resume & application' },
                  { icon: '✅', title: 'Get Shortlisted', desc: 'HR reviews and schedules your interview' },
                  { icon: '🎯', title: 'Complete 3 Rounds', desc: 'Aptitude → Technical → HR Video' },
                  { icon: '🏆', title: 'Get Selected', desc: 'Receive your offer letter' },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{s.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline preview */}
            <div className="xl:col-span-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-4">
                Your Interview Journey — Preview
              </p>
              {ROUND_ORDER.map((r, i) => (
                <PreviewRoundCard
                  key={r}
                  round={r}
                  index={i}
                  isFirst={i === 0}
                  onTryVideo={() => setShowHRRoom(true)}
                />
              ))}
            </div>
          </div>

        /* ── Has interviews: live pipeline ── */
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Interview selector */}
            <div className="xl:col-span-1 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                Your Applications
              </p>
              {interviews.map(iv => {
                const isSel = iv._id === selected;
                const rs = getRoundStates(iv);
                const passedCt = rs.filter(r => r.state === 'passed').length;
                const cur = roundMeta[iv.currentRound || 'aptitude'];
                return (
                  <button key={iv._id} onClick={() => setSelected(iv._id)}
                    className={`w-full text-left rounded-xl p-4 border transition-all ${
                      isSel ? 'bg-white border-violet-300 shadow-md ring-2 ring-violet-200'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {iv.jobId?.title || 'Job Application'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {iv.jobId?.company || iv.candidateId?.email || ''}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cur.light}`}>
                        {cur.short}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{passedCt}/{ROUND_ORDER.length} rounds</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-700"
                          style={{ width: `${(passedCt / ROUND_ORDER.length) * 100}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Round pipeline */}
            <div className="xl:col-span-2 space-y-4">
              {currentInterview && (
                <>
                  {/* Progress header */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="font-bold text-gray-900">
                          {currentInterview.jobId?.title || 'Interview Pipeline'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Round {ROUND_ORDER.indexOf(currentInterview.currentRound || 'aptitude') + 1} of 3
                          &nbsp;·&nbsp;
                          <span className="capitalize font-medium text-violet-600">
                            {currentInterview.currentRound || 'aptitude'} Round
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-violet-600">{overallProgress}%</p>
                        <p className="text-[10px] text-gray-400">Complete</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 transition-all duration-1000 rounded-full"
                        style={{ width: `${overallProgress}%` }} />
                    </div>
                    <div className="flex justify-between mt-2.5 px-1">
                      {ROUND_ORDER.map((r, i) => {
                        const rs = roundStates[i];
                        return (
                          <div key={r} className="flex flex-col items-center gap-0.5">
                            <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                              rs?.state === 'passed' ? 'bg-emerald-500 border-emerald-500' :
                              rs?.state === 'active' ? 'bg-violet-500 border-violet-500 ring-2 ring-violet-200' :
                              'bg-white border-gray-300'}`} />
                            <span className={`text-[9px] font-semibold ${
                              rs?.state === 'active'  ? 'text-violet-600' :
                              rs?.state === 'passed'  ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {roundMeta[r].short}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3 Round cards */}
                  <div className="flex flex-col">
                    {roundStates.map(({ round, state }, i) => (
                      <RoundCard key={round} round={round} state={state} index={i}
                        interviewId={currentInterview._id}
                        onStartHR={() => setShowHRRoom(true)} />
                    ))}
                  </div>

                  {/* HR info */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <VideoCameraIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900 text-sm">About the HR Round</h4>
                        <p className="text-emerald-700 text-xs mt-0.5 leading-relaxed">
                          The HR round is a live video session — similar to Google Meet. You'll need
                          camera and microphone access. Make sure you're in a quiet, well-lit environment.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserInterviews;
