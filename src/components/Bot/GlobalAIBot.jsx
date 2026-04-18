import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  LifebuoyIcon,
  CpuChipIcon,
  ChevronUpIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const RobotIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="8" width="14" height="12" rx="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M9 13v.01" strokeWidth="3" />
    <path d="M15 13v.01" strokeWidth="3" />
    <path d="M9 17h6" />
    <path d="M12 8V5" />
    <circle cx="12" cy="4" r="1" />
    <path d="M3 13v4" />
    <path d="M21 13v4" />
  </svg>
);

const GlobalAIBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(`Hi ${user?.name || 'there'}! 👋 I'm your AI Recruitment Assistant. How can I help you today?`, 500);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: "I can help you with:", 
          options: [
            "How to apply for jobs?",
            "How does AI matching work?",
            "Preparing for interviews",
            "Managing my resumes"
          ] 
        }]);
      }, 1500);
    }
  }, [isOpen, user]);

  const addBotMessage = (text, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text }]);
      setIsTyping(false);
    }, delay);
  };

  const handleSendMessage = (e, text = null) => {
    if (e) e.preventDefault();
    const userText = text || inputValue.trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');

    // Simple keyword based responses
    setIsTyping(true);
    setTimeout(() => {
      let response = "That's a great question! I'm currently learning more about " + userText + ". You can reach out to our support team for a detailed manual, or I can try to help you navigate the sidebar!";
      
      const lowerText = userText.toLowerCase();
      if (lowerText.includes('apply')) {
        response = "To apply for jobs, go to 'Browse Jobs' in the sidebar, pick a role, and click 'Apply'. You can even use our new AI Chat Application feature to apply faster!";
      } else if (lowerText.includes('match')) {
        response = "Our AI analyzes your skills and experience from your resume and compares them with job requirements to give you a percentage match score.";
      } else if (lowerText.includes('interview')) {
        response = "You can find your scheduled interviews in the 'Interviews' section. We offer AI-proctored technical and aptitude exams to help you stand out.";
      } else if (lowerText.includes('resume')) {
        response = "You can upload and manage multiple resumes in the 'My Resumes' section. Our AI will automatically parse them to extract your skills!";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Bot Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500 p-2 rounded-xl shadow-lg shadow-primary-500/30">
                <RobotIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm leading-tight">AI Assistant</h3>
                <p className="text-primary-400 text-[10px] font-medium uppercase tracking-wider">Online & Active</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0 mt-auto">
                    {msg.sender === 'bot' ? (
                      <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
                        <RobotIcon className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-gray-200 flex items-center justify-center">
                        <UserCircleIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.options && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(null, opt)}
                            className="text-[11px] font-medium bg-white border border-primary-100 text-primary-600 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:border-primary-200 transition-all shadow-sm"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <RobotIcon className="h-4 w-4 text-primary-500 animate-pulse" />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Bar */}
          <div className="px-4 py-2 bg-white border-t border-gray-50 flex items-center gap-4 overflow-x-auto no-scrollbar">
             <button className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors">
               <LifebuoyIcon className="h-3.5 w-3.5" /> Support
             </button>
             <button className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors">
               <QuestionMarkCircleIcon className="h-3.5 w-3.5" /> FAQ
             </button>
             <button className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors">
               <InformationCircleIcon className="h-3.5 w-3.5" /> About
             </button>
          </div>

          {/* Footer Input */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bubble */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center h-16 w-16 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-90' 
            : 'bg-[#1e40af] hover:bg-[#1d4ed8]'
        }`}
      >
        {isOpen ? (
          <XMarkIcon className="h-8 w-8 text-white transition-all" />
        ) : (
          <>
            <RobotIcon className="h-8 w-8 text-white transition-all" />
            
            {/* Notification Badge - Matching user image */}
            <span className="absolute top-1 right-1 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
            </span>
          </>
        )}
      </button>

      {/* Scroll to Top Button - Matching user image style with smooth transitions */}
      <button 
        onClick={scrollToTop}
        className={`mt-3 flex items-center justify-center h-14 w-14 rounded-full bg-red-600 shadow-2xl hover:bg-red-700 transition-all duration-500 transform ${
          showScrollTop 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-50 translate-y-10 pointer-events-none'
        }`}
      >
        <ArrowUpIcon className="h-7 w-7 text-white stroke-[3.5]" />
      </button>
    </div>
  );
};

export default GlobalAIBot;
