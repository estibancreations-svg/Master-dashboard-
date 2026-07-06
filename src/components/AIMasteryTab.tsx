import React, { useState, useEffect } from 'react';
import { Play, Pause, Award, Volume2, Video, RefreshCw, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export default function AIMasteryTab() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState({
    id: 'vid-1',
    title: 'Level 1: AI Literate — The CRAFT Prompting Paradigm',
    duration: 120, // seconds
    url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4'
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // multiplier
  const [currentTime, setCurrentTime] = useState(12); // seconds
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [bookmarkedTime, setBookmarkedTime] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'searching' | 'matched'>('idle');
  const [matchCountdown, setMatchCountdown] = useState(3);
  const [partnerName, setPartnerName] = useState('');

  // Custom Quiz Creator states
  const [customQuizzes, setCustomQuizzes] = useState<{question: string, correct: string, optionB: string}[]>([
    { question: 'What does n8n stand for in system telemetry?', correct: 'nodemation', optionB: 'network node eight' }
  ]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customCorrect, setCustomCorrect] = useState('');
  const [customOptionB, setCustomOptionB] = useState('');
  const [testedCustomQuiz, setTestedCustomQuiz] = useState<number | null>(null);
  const [customQuizFeedback, setCustomQuizFeedback] = useState('');

  // Course Levels structure
  const levels = [
    {
      level: 1,
      title: 'Level 1: AI Literate',
      description: 'Master Core Foundational Prompting (CRAFT Method, Chains)',
      videos: [
        { id: 'vid-1', title: '1.1 The CRAFT Prompting Paradigm', duration: 180 },
        { id: 'vid-2', title: '1.2 Chain-of-Thought Sequence Styling', duration: 210 },
        { id: 'vid-3', title: '1.3 LLM Architectural Guardrails', duration: 150 }
      ]
    },
    {
      level: 2,
      title: 'Level 2: Power User',
      description: 'Ecosystem Engineering and n8n Pipeline Syncing',
      videos: [
        { id: 'vid-4', title: '2.1 Direct Webhook Mapping with n8n', duration: 300 },
        { id: 'vid-5', title: '2.2 Airtable & Stripe Webhook Integrations', duration: 270 }
      ]
    },
    {
      level: 3,
      title: 'Level 3: Expert Strategist',
      description: 'Cognitive Swarm Routing & Dynamic Autonomous Recovery',
      videos: [
        { id: 'vid-6', title: '3.1 ReAct loops & Cognitive Multi-Agent Setup', duration: 420 },
        { id: 'vid-7', title: '3.2 Self-Healing AST Code Patching Protocols', duration: 480 }
      ]
    }
  ];

  // Video progress wheel calculations
  const progressPercent = Math.min((currentTime / selectedVideo.duration) * 100, 100);
  const wheelRadius = 24;
  const wheelCircumference = 2 * Math.PI * wheelRadius;
  const wheelDashoffset = wheelCircumference - (progressPercent / 100) * wheelCircumference;

  // Video simulator timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && currentTime < selectedVideo.duration) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          // Trigger Pop Quiz at 15 seconds for interactive demonstration
          if (next === 15 && !quizAnswered) {
            setIsPlaying(false);
            setShowQuiz(true);
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTime, quizAnswered, selectedVideo, playbackSpeed]);

  const handleBookmark = () => {
    setBookmarkedTime(currentTime);
  };

  const handleApplyBookmark = () => {
    if (bookmarkedTime !== null) {
      setCurrentTime(bookmarkedTime);
    }
  };

  const handleAnswerQuiz = (correct: boolean) => {
    setQuizAnswered(correct);
    if (correct) {
      setShowQuiz(false);
      setIsPlaying(true);
      // Give Level Unlock Confetti effect
      if (currentLevel < 3) {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 5000);
        setCurrentLevel(prev => prev + 1);
      }
    } else {
      alert("Objection detected. Refine prompt theory and try again!");
    }
  };

  const handlePeerSearch = () => {
    setMatchStatus('searching');
    setMatchCountdown(3);
    
    const countTimer = setInterval(() => {
      setMatchCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countTimer);
          setMatchStatus('matched');
          const names = ['Ben Angel', 'Sarah Connor', 'Alan Turing', 'Ada Lovelace'];
          setPartnerName(names[Math.floor(Math.random() * names.length)]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="ai-mastery-lms">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Ben Angel's AI Mastery Academy (LMS v3)
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Unlock levels sequentially through interactive video checkpoints</p>
        </div>
        
        {/* Active level badge */}
        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 px-3 py-1 rounded-full text-indigo-700 text-xs font-bold font-mono">
          <span>Active Status:</span>
          <span className="uppercase text-indigo-800">LEVEL {currentLevel} UNLOCKED</span>
        </div>
      </div>

      {/* Confetti alert banner */}
      {confettiActive && (
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-4 rounded-xl text-white text-xs font-bold text-center animate-bounce flex items-center justify-center gap-2 shadow-md" id="confetti-banner">
          🎉 CONGRATULATIONS! LEVEL UNLOCKED SUCCESSFULLY! Dynamic high-resolution certificate generated in Certificates tab.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Video Viewport Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Custom Video Player Canvas wrapper */}
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-md group border border-slate-800 flex flex-col justify-between p-4">
            
            {/* Audio only state overlay */}
            {isAudioOnly ? (
              <div className="absolute inset-0 bg-indigo-950/90 flex flex-col items-center justify-center text-center space-y-2 text-white">
                <Volume2 className="w-12 h-12 text-indigo-400 animate-pulse" />
                <p className="text-xs font-bold">Audio-Only Podcast Mode Active</p>
                <p className="text-4xs text-slate-400 max-w-sm">Saving streaming bandwidth. Streaming crystal-clear synthesized expert speech vectors.</p>
              </div>
            ) : (
              <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,rgba(30,27,75,0.4),rgba(3,7,18,0.9)) flex items-center justify-center">
                <Video className="w-16 h-16 text-slate-800/50 absolute" />
              </div>
            )}

            {/* Video metadata overlay top */}
            <div className="z-10 flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5">
              <span className="text-xs font-bold text-white truncate max-w-[280px]">{selectedVideo.title}</span>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded">
                Progress: {progressPercent.toFixed(0)}%
              </span>
            </div>

            {/* Pop Quiz Interruption overlay */}
            {showQuiz && (
              <div className="absolute inset-0 z-30 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans" id="pop-quiz-modal">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full">
                  <AlertTriangle className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">⚠️ INTERRUPTIVE CHECKPOINT: POP QUIZ!</h4>
                  <p className="text-xs text-slate-350 max-w-md mt-1">
                    To maintain level verification integrity, identify the key element represented by 'A' inside the CRAFT Prompt framework:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  <button 
                    onClick={() => handleAnswerQuiz(false)}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl text-left text-xs font-bold text-slate-300 hover:text-white"
                  >
                    ❌ A - Artificial Memory
                  </button>
                  <button 
                    onClick={() => handleAnswerQuiz(true)}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-xl text-left text-xs font-bold text-white"
                  >
                    ✓ A - Action
                  </button>
                  <button 
                    onClick={() => handleAnswerQuiz(false)}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl text-left text-xs font-bold text-slate-300 hover:text-white"
                  >
                    ❌ A - Autonomic Swarm
                  </button>
                  <button 
                    onClick={() => handleAnswerQuiz(false)}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl text-left text-xs font-bold text-slate-300 hover:text-white"
                  >
                    ❌ A - Audience Context
                  </button>
                </div>
              </div>
            )}

            {/* Video Controls overlay bottom */}
            <div className="z-10 flex items-center justify-between gap-4 mt-auto bg-black/60 backdrop-blur-md p-3.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                
                <button 
                  onClick={() => setIsAudioOnly(!isAudioOnly)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${isAudioOnly ? 'bg-cyan-600 text-white' : 'bg-slate-800 hover:bg-slate-750 text-slate-300'}`}
                  title="Toggle Audio-Only Mode"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button 
                  onClick={handleBookmark}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 rounded-lg text-[10px] font-mono text-slate-350 hover:text-white cursor-pointer"
                  title="Auto-Bookmark Current Time"
                >
                  Bookmark
                </button>

                {bookmarkedTime !== null && (
                  <button 
                    onClick={handleApplyBookmark}
                    className="px-2.5 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-[10px] font-mono cursor-pointer"
                  >
                    Jump to ({bookmarkedTime}s)
                  </button>
                )}

                <select 
                  value={playbackSpeed}
                  onChange={e => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-slate-800 text-white rounded text-[10px] font-mono p-1 border border-slate-750 focus:outline-none cursor-pointer"
                  title="Simulation Playback Speed"
                >
                  <option value="0.5">Speed: 0.5x</option>
                  <option value="1">Speed: 1.0x</option>
                  <option value="1.5">Speed: 1.5x</option>
                  <option value="2">Speed: 2.0x</option>
                </select>
              </div>

              {/* Progress Wheel overlay indicator */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-300">{currentTime}s / {selectedVideo.duration}s</span>
                
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r={wheelRadius / 2}
                      className="text-slate-800"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r={wheelRadius / 2}
                      className="text-indigo-500"
                      strokeWidth="2.5"
                      strokeDasharray={wheelCircumference / 2}
                      strokeDashoffset={wheelDashoffset / 2}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute text-[8px] font-mono text-indigo-400 font-bold">{progressPercent.toFixed(0)}%</div>
                </div>
              </div>
            </div>

          </div>

          {/* Active video metadata and description */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Video Blueprint & Takeaways</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              Learn how the Large Language Models optimize responses using Role priming and explicit structure boundaries. Ben Angel guides you through reducing hallucination indexes using programmatic contextual filters.
            </p>
          </div>

        </div>

        {/* Course Syllabus & Peer Matchmaker Sidebar */}
        <div className="space-y-6">
          
          {/* Syllabus */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3.5 bg-slate-50">
            <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Syllabus Index</h3>
            
            <div className="space-y-3">
              {levels.map(l => (
                <div key={l.level} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">{l.title}</span>
                    {currentLevel >= l.level ? (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold uppercase px-1 py-0.2 rounded font-mono border border-emerald-150">Ready</span>
                    ) : (
                      <span className="text-[9px] bg-slate-100 text-slate-400 font-bold uppercase px-1 py-0.2 rounded font-mono">Locked</span>
                    )}
                  </div>
                  
                  <div className="space-y-1 pl-1">
                    {l.videos.map(v => (
                      <div 
                        key={v.id}
                        onClick={() => {
                          if (currentLevel >= l.level) {
                            setSelectedVideo({ id: v.id, title: v.title, duration: v.duration, url: '' });
                            setCurrentTime(0);
                            setIsPlaying(false);
                          } else {
                            alert("This level is locked. Complete previous level pop quizzes to progress.");
                          }
                        }}
                        className={`p-2 rounded-lg text-4xs font-semibold flex items-center justify-between border cursor-pointer transition-all ${
                          selectedVideo.id === v.id 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : currentLevel >= l.level 
                            ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' 
                            : 'bg-slate-100/50 border-transparent text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span className="truncate pr-2">{v.title}</span>
                        <span className="font-mono text-slate-400 shrink-0">{v.duration}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Matchmaker */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50 font-sans" id="peer-matchmaker">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" />
              <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">Peer-Review Matchmaking</h4>
            </div>
            
            <p className="text-[10px] text-slate-600 leading-normal">
              Need feedback on your CRAFT prompts? Match with another student in real-time to review each other's sittings deliverables.
            </p>

            {matchStatus === 'idle' && (
              <button 
                onClick={handlePeerSearch}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer text-center font-sans"
              >
                Find Peer Partner
              </button>
            )}

            {matchStatus === 'searching' && (
              <div className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-mono">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                Scanning registry... ({matchCountdown}s left)
              </div>
            )}

            {matchStatus === 'matched' && (
              <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-2 text-xs">
                <p className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider font-mono">✓ Match Success!</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-3xs">{partnerName[0]}</div>
                  <div>
                    <p className="font-bold text-slate-800">{partnerName}</p>
                    <p className="text-4xs text-slate-400 font-mono">Peer-Reviewer ID: #ST-{Math.floor(Math.random() * 90000 + 10000)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    alert("Opening workspace chat for cooperative peer-review.");
                  }}
                  className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-3xs font-bold transition-all cursor-pointer text-center font-sans"
                >
                  Initialize Private Thread
                </button>
              </div>
            )}
          </div>

          {/* Custom LMS Quiz Creator Widget */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3.5 bg-slate-50 font-sans" id="custom-quiz-engine">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-600" />
              <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">Custom Quiz Creator</h4>
            </div>

            <p className="text-[10px] text-slate-600 leading-normal">
              Draft custom prompt-theory checkpoints to test team members during downstream webhook runs.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!customQuestion.trim() || !customCorrect.trim() || !customOptionB.trim()) return;
              setCustomQuizzes([...customQuizzes, {
                question: customQuestion.trim(),
                correct: customCorrect.trim(),
                optionB: customOptionB.trim()
              }]);
              setCustomQuestion('');
              setCustomCorrect('');
              setCustomOptionB('');
            }} className="space-y-2">
              <input 
                type="text" 
                value={customQuestion} 
                onChange={e => setCustomQuestion(e.target.value)} 
                placeholder="Question (e.g. What is RAG?)"
                className="w-full text-4xs p-2 bg-white border rounded font-semibold"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={customCorrect} 
                  onChange={e => setCustomCorrect(e.target.value)} 
                  placeholder="Correct Answer"
                  className="text-4xs p-2 bg-white border border-emerald-200 rounded text-emerald-800 font-semibold"
                  required
                />
                <input 
                  type="text" 
                  value={customOptionB} 
                  onChange={e => setCustomOptionB(e.target.value)} 
                  placeholder="Incorrect Answer"
                  className="text-4xs p-2 bg-white border border-red-200 rounded text-red-800 font-semibold"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-3xs font-bold transition-colors cursor-pointer"
              >
                + Publish Custom Checkpoint
              </button>
            </form>

            {customQuizzes.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">Interactive Previews:</p>
                {customQuizzes.map((q, idx) => (
                  <div key={idx} className="p-2.5 bg-white border rounded-lg space-y-1.5 text-3xs font-semibold">
                    <p className="text-slate-800">{q.question}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button 
                        onClick={() => {
                          setTestedCustomQuiz(idx);
                          setCustomQuizFeedback("✓ Brilliant answer! Correct prompt matrix confirmed.");
                        }}
                        className="py-1 bg-slate-50 hover:bg-indigo-50 border rounded text-[9px]"
                      >
                        {q.correct}
                      </button>
                      <button 
                        onClick={() => {
                          setTestedCustomQuiz(idx);
                          setCustomQuizFeedback("❌ Prompt theory misalignment. Try again!");
                        }}
                        className="py-1 bg-slate-50 hover:bg-red-50 border rounded text-[9px]"
                      >
                        {q.optionB}
                      </button>
                    </div>
                    {testedCustomQuiz === idx && (
                      <p className={`text-[9px] font-bold ${customQuizFeedback.includes('✓') ? 'text-emerald-700' : 'text-red-600'}`}>
                        {customQuizFeedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
