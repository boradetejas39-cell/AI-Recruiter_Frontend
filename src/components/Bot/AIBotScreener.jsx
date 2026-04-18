import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, SparklesIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const AIBotScreener = ({ job, resumes, onComplete, onCancel }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState('intro'); // intro, select_resume, chat, finish
  const [selectedResume, setSelectedResume] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addBotMessage = (text, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text }]);
      setIsTyping(false);
    }, delay);
  };

  useEffect(() => {
    // Initialize the chat
    addBotMessage(`Hi! I'm the AI Recruiter for ${job?.company || 'our company'}. I'm excited to help you apply for the ${job?.title} role!`, 500);
    
    setTimeout(() => {
      if (resumes.length === 0) {
        addBotMessage("It looks like you don't have any resumes uploaded. Please upload a resume in your dashboard first.", 1500);
        setStep('error');
      } else {
        addBotMessage("To get started, please select which resume you'd like to submit for this application:", 1500);
        setStep('select_resume');
      }
    }, 1000);

    // Prepare questions based on job skills
    const skills = job?.requiredSkills || [];
    const generatedQs = [];
    if (skills.length > 0) {
      generatedQs.push(`Can you tell me about a recent project where you used ${skills[0]}?`);
    }
    if (skills.length > 1) {
      generatedQs.push(`How many years of experience do you have with ${skills[1]}, and how would you rate your proficiency?`);
    }
    if (generatedQs.length === 0) {
      generatedQs.push("Why do you think you are a great fit for this role?");
    }
    setQuestions(generatedQs);
  }, [job, resumes]);

  const handleResumeSelect = (resume) => {
    setSelectedResume(resume._id);
    setMessages((prev) => [...prev, { sender: 'user', text: `Selected resume: ${resume.candidateName || 'My Resume'}` }]);
    setStep('chat');
    
    addBotMessage("Perfect! I've attached that resume.", 1000);
    setTimeout(() => {
      addBotMessage(questions[0], 2500);
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTranscript((prev) => prev + `\nQ: ${questions[currentQIndex]}\nA: ${userText}\n`);
    setInputValue('');

    const nextIndex = currentQIndex + 1;
    if (nextIndex < questions.length) {
        setCurrentQIndex(nextIndex);
        addBotMessage(questions[nextIndex], 1500);
    } else {
        setStep('finish');
        addBotMessage("Thank you for your fantastic answers! I'm submitting your application now.", 1500);
        
        // Trigger completion automatically after a delay
        setTimeout(() => {
            onComplete(selectedResume, "AI Chat Screener Transcript:\n" + transcript + `\nQ: ${questions[currentQIndex]}\nA: ${userText}\n`);
        }, 4000);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">AI Recruiter</h3>
            <p className="text-purple-200 text-xs text-left">Always online</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-white hover:bg-white/20 px-3 py-1 rounded-lg text-sm transition">
          Exit Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 mt-auto">
                {msg.sender === 'bot' ? (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                     <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%] flex-row">
              <div className="flex-shrink-0 mt-auto">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                     <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm rounded-bl-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Interactive Elements in Chat stream */}
        {step === 'select_resume' && !isTyping && (
           <div className="flex flex-col gap-2 ml-11">
             {resumes.map(r => (
               <button 
                 key={r._id} 
                 onClick={() => handleResumeSelect(r)}
                 className="text-left bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50 p-3 rounded-xl text-sm transition flex justify-between items-center"
               >
                 <span className="font-medium text-gray-900">{r.candidateName}'s Resume</span>
                 <span className="text-xs text-gray-500">Select</span>
               </button>
             ))}
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {step === 'chat' ? (
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder="Type your answer here..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm transition disabled:bg-gray-100"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping}
            className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center w-10"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      ) : step === 'finish' ? (
          <div className="p-4 bg-purple-50 border-t border-purple-100 flex items-center justify-center text-sm font-medium text-purple-700 gap-2">
             <CheckCircleIcon className="h-5 w-5 text-purple-600" /> Application Processing...
          </div>
      ) : (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-400">
          The AI is preparing the next step...
        </div>
      )}
    </div>
  );
};

export default AIBotScreener;
