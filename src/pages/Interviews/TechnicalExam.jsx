import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../api/v2';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const EXAM_DURATION = 45 * 60; // 45 minutes

const TechnicalExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mcqSelections, setMcqSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const mcqRef = useRef({});
  const timerKey = `technical_timer_${id}`;

  /* ── fetch ── */
  const fetchInterview = useCallback(async () => {
    try {
      const res = await interviewAPI.get(id);
      const data = res.data.data.interview;
      setInterview(data);
      const techQs = (data.questions || []).filter(q => q.round === 'technical');
      if (techQs.length > 0 && techQs.every(q => q.answer)) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchInterview(); }, [fetchInterview]);

  /* ── timer ── */
  useEffect(() => {
    if (!interview || submitted) return;
    const techQs = (interview.questions || []).filter(q => q.round === 'technical');
    if (techQs.length === 0 || techQs.every(q => q.answer)) return;

    let startTime = localStorage.getItem(timerKey);
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem(timerKey, startTime);
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      const remaining = EXAM_DURATION - elapsed;
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        handleAutoSubmit(techQs);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview, submitted]);

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSelect = (questionId, option) => {
    setMcqSelections(prev => {
      const next = { ...prev, [questionId]: option };
      mcqRef.current = next;
      return next;
    });
  };

  const handleAutoSubmit = async (techQs) => {
    try {
      const promises = techQs
        .filter(q => !q.answer && mcqRef.current[q._id])
        .map(q => interviewAPI.answer(id, { questionId: q._id, answer: mcqRef.current[q._id] }));
      if (promises.length > 0) await Promise.all(promises);
      localStorage.removeItem(timerKey);
      setSubmitted(true);
      await fetchInterview();
    } catch (err) {
      console.error('Auto-submit failed', err);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const techQs = (interview.questions || []).filter(q => q.round === 'technical');
      const promises = techQs
        .filter(q => !q.answer && mcqSelections[q._id])
        .map(q => interviewAPI.answer(id, { questionId: q._id, answer: mcqSelections[q._id] }));
      if (promises.length > 0) await Promise.all(promises);
      localStorage.removeItem(timerKey);
      setSubmitted(true);
      await fetchInterview();
      setShowConfirm(false);
    } catch (err) {
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="text-gray-500 text-sm">Loading exam…</p>
      </div>
    );
  }

  if (!interview) {
    return <div className="text-center py-20 text-gray-500">Interview not found.</div>;
  }

  const techQs = (interview.questions || []).filter(q => q.round === 'technical');
  const answered = techQs.filter(q => q.answer || mcqSelections[q._id]).length;
  const isExpired = timeLeft === 0;
  const isUrgent = timeLeft !== null && timeLeft < 300;

  /* ── submitted screen ── */
  if (submitted || techQs.every(q => q.answer)) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
          <CheckCircleIcon className="h-12 w-12 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Technical Round Complete!</h1>
          <p className="text-gray-500 mt-2">Your answers have been submitted. Results will be available after AI evaluation.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Questions</span>
            <span className="font-bold text-gray-900">{techQs.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Answered</span>
            <span className="font-bold text-emerald-600">{techQs.filter(q => q.answer).length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duration</span>
            <span className="font-bold text-gray-900">45 minutes</span>
          </div>
        </div>
        <button onClick={() => navigate('/app/user/interviews')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg">
          <ArrowLeftIcon className="h-4 w-4" /> Back to My Interviews
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app/user/interviews')}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <CodeBracketIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-none">Technical Round</h1>
                <p className="text-xs text-gray-400 mt-0.5">{answered}/{techQs.length} answered</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                  style={{ width: `${(answered / techQs.length) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-700">{Math.round((answered / techQs.length) * 100)}%</span>
            </div>

            {/* Timer */}
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm border ${
                isExpired ? 'bg-red-100 text-red-700 border-red-300' :
                isUrgent  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' :
                'bg-blue-50 text-blue-700 border-blue-200'}`}>
                <ClockIcon className="h-4 w-4" />
                {isExpired ? 'Time Up!' : fmtTime(timeLeft)}
              </div>
            )}

            {/* Submit */}
            <button onClick={() => setShowConfirm(true)} disabled={answered === 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 shadow">
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* ── Questions ── */}
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <CodeBracketIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-blue-900">Technical Exam — {techQs.length} MCQ Questions</h2>
            <p className="text-blue-700 text-sm mt-0.5">45 minutes · Domain knowledge · Problem solving · Role-specific questions</p>
          </div>
          {isUrgent && !isExpired && (
            <div className="ml-auto flex items-center gap-1 text-red-600 text-xs font-bold">
              <ExclamationTriangleIcon className="h-4 w-4" /> Less than 5 min left!
            </div>
          )}
        </div>

        {techQs.map((q, i) => {
          const selected = q.answer || mcqSelections[q._id];
          const isAnswered = !!q.answer;
          const isCorrect = isAnswered && q.evaluation?.score > 0;

          return (
            <div key={q._id} className={`bg-white rounded-2xl border p-6 transition-all ${
              isAnswered
                ? isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-red-200 bg-red-50/20'
                : selected ? 'border-blue-300 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'
            }`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    q.difficulty === 'easy'   ? 'bg-green-50 text-green-700'  :
                    q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'}`}>
                    {q.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600 font-medium">
                    {q.category}
                  </span>
                </div>
                {isAnswered && q.evaluation?.score != null && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                )}
              </div>

              <p className="text-gray-900 font-semibold mb-4 leading-relaxed">{q.text}</p>

              <div className="space-y-2">
                {(q.options || []).map((opt, oi) => {
                  const isSelected = selected === opt;
                  const isSubmittedAnswer = q.answer === opt;
                  const isRight = isSubmittedAnswer && isCorrect;
                  const isWrong = isSubmittedAnswer && !isCorrect;

                  return (
                    <label key={oi}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isAnswered
                          ? isRight  ? 'border-emerald-300 bg-emerald-50 cursor-default' :
                            isWrong  ? 'border-red-300 bg-red-50 cursor-default' :
                            'border-gray-100 bg-white cursor-default opacity-60'
                          : isSelected ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}>
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        value={opt}
                        disabled={isAnswered}
                        checked={isSelected}
                        onChange={() => handleSelect(q._id, opt)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm flex-1 ${
                        isRight ? 'text-emerald-800 font-semibold' :
                        isWrong ? 'text-red-800' : 'text-gray-800'
                      }`}>{opt}</span>
                      {isRight && <CheckCircleIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                      {isWrong && <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />}
                    </label>
                  );
                })}
              </div>

              {isAnswered && q.evaluation?.feedback && (
                <p className={`mt-3 text-xs font-medium flex items-center gap-1 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isCorrect ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <XCircleIcon className="h-3.5 w-3.5" />}
                  {q.evaluation.feedback}
                </p>
              )}
            </div>
          );
        })}

        {/* Bottom submit */}
        <div className="flex justify-end pt-4">
          <button onClick={() => setShowConfirm(true)} disabled={answered === 0 || submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg shadow-blue-200">
            <PaperAirplaneIcon className="h-5 w-5" />
            Submit Technical Exam
          </button>
        </div>
      </div>

      {/* ── Confirm modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
              <PaperAirplaneIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Submit Technical Exam?</h3>
              <p className="text-gray-500 text-sm mt-1">
                You've answered <strong>{answered}/{techQs.length}</strong> questions. Once submitted you cannot change your answers.
              </p>
            </div>
            {answered < techQs.length && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
                ⚠️ {techQs.length - answered} question{techQs.length - answered > 1 ? 's' : ''} unanswered — they will be marked incorrect.
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} disabled={submitting}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Review
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalExam;
