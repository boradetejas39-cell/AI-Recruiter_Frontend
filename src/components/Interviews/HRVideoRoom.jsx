import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  VideoCameraIcon,
  ComputerDesktopIcon,
  PhoneXMarkIcon,
} from '@heroicons/react/24/outline';
import {
  MicrophoneIcon as MicSolid,
  VideoCameraIcon as CamSolid,
} from '@heroicons/react/24/solid';

const HRVideoRoom = ({ onClose, userName }) => {
  const localVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [camError, setCamError] = useState(false);
  const [joined, setJoined] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let s = null;
    (async () => {
      try {
        s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      } catch (err) {
        console.error("Media error:", err);
        setCamError(true);
      }
    })();
    return () => {
      if (s) s.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Dedicated cleanup for state-held stream and screen share
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      screenStream?.getTracks().forEach(t => t.stop());
    };
  }, [stream, screenStream]);

  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream, joined, camOn]);

  useEffect(() => {
    if (joined) timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [joined]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const toggleCam = useCallback(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(v => !v);
  }, [stream]);

  const toggleMic = useCallback(() => {
    if (!stream) return;
    stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(v => !v);
  }, [stream]);

  const toggleScreen = useCallback(async () => {
    if (screenSharing) {
      screenStream?.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setScreenSharing(false);
    } else {
      try {
        const ss = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(ss);
        setScreenSharing(true);
        ss.getVideoTracks()[0].onended = () => { setScreenSharing(false); setScreenStream(null); };
      } catch { /* cancelled */ }
    }
  }, [screenSharing, screenStream]);

  const handleLeave = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    onClose();
  }, [stream, screenStream, onClose]);

  /* ── Lobby ── */
  if (!joined) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto">
            <VideoCameraIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">HR Interview Room</h2>
            <p className="text-gray-400 mt-1 text-sm">AI Recruiter · Live Session</p>
          </div>

          <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-video">
            {camError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                <VideoCameraIcon className="h-10 w-10" />
                <p className="text-xs">Camera unavailable</p>
              </div>
            ) : (
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded-lg text-xs text-white font-medium">
              {userName} (You)
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={toggleMic}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white'}`}>
              <MicSolid className="h-5 w-5" />
            </button>
            <button onClick={toggleCam}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${camOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white'}`}>
              <CamSolid className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button onClick={() => setJoined(true)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
              Join Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── In-call ── */
  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <VideoCameraIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">HR Interview — AI Recruiter</p>
            <p className="text-gray-400 text-xs">Live · {fmt(elapsed)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-medium">REC</span>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-white">
        {/* HR side Placeholder */}
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-xl">
              <span className="text-4xl font-bold text-white">IV</span>
            </div>
            <p className="text-gray-300 font-medium">Interview Partner</p>
            <p className="text-xs text-gray-500">Waitng for others to join...</p>
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded-lg text-xs text-white font-medium">
            Interview Partner
          </div>
        </div>

        {/* Local feed */}
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden">
          {camError || !camOn ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-300">{userName?.charAt(0)?.toUpperCase()}</span>
              </div>
              <p className="text-sm text-gray-400">Camera Off</p>
            </div>
          ) : (
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
          )}
          <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded-lg text-xs text-white font-medium">
            {userName} (You)
          </div>
          {!micOn && (
            <div className="absolute top-3 right-3 bg-red-600 p-1.5 rounded-full">
              <MicSolid className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-5 border-t border-gray-800">
        <button onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all outline-none ${micOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white font-bold'}`}>
          <MicSolid className="h-5 w-5" />
          <span className="text-[9px]">{micOn ? 'Mute' : 'Unmuted'}</span>
        </button>
        <button onClick={toggleCam}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all outline-none ${camOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white font-bold'}`}>
          <CamSolid className="h-5 w-5" />
          <span className="text-[9px]">{camOn ? 'Cam' : 'Off'}</span>
        </button>
        <button onClick={toggleScreen}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all outline-none ${screenSharing ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
          <ComputerDesktopIcon className="h-5 w-5" />
          <span className="text-[9px]">Screen</span>
        </button>
        <button onClick={handleLeave}
          className="w-16 h-14 rounded-full bg-red-600 text-white flex flex-col items-center justify-center gap-0.5 hover:bg-red-700 transition-colors shadow-lg outline-none">
          <PhoneXMarkIcon className="h-5 w-5" />
          <span className="text-[9px]">Leave</span>
        </button>
      </div>
    </div>
  );
};

export default HRVideoRoom;
