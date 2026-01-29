import { useState } from 'react';
import { Beaker, FlaskConical, CheckCircle, ArrowRight, RefreshCw, Syringe, Activity, Sparkles, Microscope } from 'lucide-react';

const NeutralizationLab = () => {
  // --- Constants ---
  const ACID_VOL_START = 10; 
  const EQUIVALENCE_POINT = 10; 
  const MAX_ALKALI = 20; 
  const MAX_BEAKER_VOL = 50; 
  
  // --- State ---
  const [gameState, setGameState] = useState('prediction'); 
  const [userPrediction, setUserPrediction] = useState('');
  const [alkaliAdded, setAlkaliAdded] = useState(0); 
  const [currentpH, setCurrentpH] = useState(1.0); 
  const [phHistory, setPhHistory] = useState([{ vol: 0, ph: 1.0 }]); 
  const [neutralReached, setNeutralReached] = useState(false); 
  const [isShaking, setIsShaking] = useState(false); 
  
  // Quiz States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [showCelebration, setShowCelebration] = useState(false);

  // --- Questions Data ---
  const questions = [
    {
      id: 1,
      question: "The 'Fast Stream' button became disabled near 8mL. Why is it important to switch to 'Drop-wise' near the end?",
      hint: "What happens if you add the alkali too fast?",
      keywords: ["overshoot", "miss", "accurate", "precision", "precise", "careful"]
    },
    {
      id: 2,
      question: "Look at the Ion Tracker. At pH 7 (Neutral), what was the relationship between H+ and OH- ions?",
      hint: "Were there more of one, or were they balanced?",
      keywords: ["equal", "same", "balanced"]
    },
    {
      id: 3,
      question: "It took 10mL of Alkali to neutralize 10mL of Acid. If we had started with 20mL of Acid, how much Alkali would we need?",
      hint: "Double the acid means you need double the...",
      keywords: ["20", "20ml", "double"]
    }
  ];

  // --- Scientific Logic ---
  const calculatePH = (vol: number) => {
    if (vol === 0) return 1.0;
    const eq = EQUIVALENCE_POINT;
    if (vol <= eq - 1) return 1.0 + (vol / (eq - 1)) * 1.5; 
    if (vol <= eq - 0.5) return 2.5 + ((vol - (eq - 1)) / 0.5) * 2.0; 
    if (vol < eq) return 4.5 + ((vol - (eq - 0.5)) / 0.5) * 2.4;
    if (vol === eq) return 7.0; 
    if (vol <= eq + 0.5) return 7.1 + ((vol - eq) / 0.5) * 3.4;
    const remainingRange = MAX_ALKALI - (eq + 0.5);
    return 10.5 + ((vol - (eq + 0.5)) / remainingRange) * 3.0;
  };

  const getLiquidColor = (ph: number) => {
    if (gameState === 'prediction' || gameState === 'start') return 'transparent'; 
    if (gameState === 'acid-added') return '#ffffff'; 
    if (ph < 2.0) return '#ef4444'; 
    if (ph < 3.0) return '#f87171'; 
    if (ph < 4.0) return '#f97316'; 
    if (ph < 5.0) return '#fb923c'; 
    if (ph < 6.0) return '#facc15'; 
    if (ph < 6.8) return '#eab308'; 
    if (ph >= 6.8 && ph <= 7.2) return '#22c55e'; // Green
    if (ph < 8.5) return '#14b8a6'; 
    if (ph < 9.5) return '#06b6d4'; 
    if (ph < 10.5) return '#3b82f6'; 
    if (ph < 11.5) return '#2563eb'; 
    if (ph < 12.5) return '#4f46e5'; 
    if (ph < 13.5) return '#7c3aed'; 
    return '#9333ea'; 
  };

  // --- Handlers ---
  const handleReset = () => {
    setGameState('prediction');
    setAlkaliAdded(0);
    setCurrentpH(1.0);
    setPhHistory([{ vol: 0, ph: 1.0 }]);
    setNeutralReached(false);
    setIsShaking(false);
    setCurrentQuestion(0);
    setUserAnswer('');
    setUserPrediction('');
    setFeedback({ type: '', msg: '' });
    setShowCelebration(false);
  };

  const submitPrediction = () => {
    if (userPrediction) setGameState('start');
  }

  const addAcid = () => {
    setGameState('acid-added');
  };

  const addIndicator = () => {
    setGameState('indicator-added');
  };

  const addAlkali = (amount: number) => {
    if (gameState === 'indicator-added') setGameState('running');
    if (alkaliAdded >= MAX_ALKALI) return;

    // Trigger Shake Animation
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500); 

    const newVol = alkaliAdded + amount;
    const roundedVol = Math.round(newVol * 100) / 100; 
    
    const newPH = calculatePH(roundedVol);
    
    setAlkaliAdded(roundedVol);
    setCurrentpH(newPH);
    setPhHistory(prev => [...prev, { vol: roundedVol, ph: newPH }]);

    if (Math.abs(newPH - 7.0) < 0.1 && !neutralReached) {
       setNeutralReached(true);
       setShowCelebration(true);
       setTimeout(() => setShowCelebration(false), 2000); 
    }
  };

  const handleAnswerSubmit = () => {
    const currentQ = questions[currentQuestion];
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const isCorrect = currentQ.keywords.some(keyword => normalizedAnswer.includes(keyword));

    if (isCorrect) {
      setFeedback({ type: 'success', msg: 'Correct! Great job!' });
      setShowCelebration(true);
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setUserAnswer('');
          setFeedback({ type: '', msg: '' });
          setShowCelebration(false);
        } else {
          setGameState('completed');
        }
      }, 2500);
    } else {
      setFeedback({ type: 'error', msg: `Try again. Hint: ${currentQ.hint}` });
    }
  };

  const currentTotalVolume = (gameState === 'prediction' || gameState === 'start') ? 0 : (ACID_VOL_START + alkaliAdded);

  // --- Render Components ---
  
  const renderBeautifulGraph = () => {
    const WIDTH = 240;
    const HEIGHT = 180;
    const PADDING = 25;
    const GRAPH_W = WIDTH - PADDING * 2;
    const GRAPH_H = HEIGHT - PADDING * 2;
    const xScale = (vol: number) => (vol / MAX_ALKALI) * GRAPH_W;
    const yScale = (ph: number) => GRAPH_H - ((ph / 14) * GRAPH_H);

    const pointsStr = phHistory.map(p => `${xScale(p.vol)},${yScale(p.ph)}`).join(' ');
    const areaPath = `0,${GRAPH_H} ${pointsStr} ${xScale(alkaliAdded)},${GRAPH_H}`;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 w-full max-w-[300px] relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-blue-600" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Titration Curve</span>
        </div>

        <svg width="100%" height={HEIGHT} viewBox={`-${PADDING} -${PADDING/2} ${WIDTH} ${HEIGHT + PADDING}`}>
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect x="0" y={yScale(7.5)} width={GRAPH_W} height={yScale(6.5) - yScale(7.5)} fill="#22c55e" opacity="0.1" rx="4" />

          {[0, 7, 14].map(y => (
            <g key={y}>
              <line x1="0" y1={yScale(y)} x2={GRAPH_W} y2={yScale(y)} stroke={y === 7 ? "#22c55e" : "#cbd5e1"} strokeWidth={y === 7 ? 2 : 1} strokeDasharray={y === 7 ? "4 4" : "0"} opacity={y === 7 ? 0.5 : 1} />
              <text x="-8" y={yScale(y) + 3} textAnchor="end" fontSize="10" fill="#64748b" fontWeight="bold">{y}</text>
            </g>
          ))}
          <text x={GRAPH_W + 5} y={yScale(7) + 3} fontSize="8" fill="#16a34a" fontWeight="bold">pH 7</text>

          {[0, 5, 10, 15, 20].map(x => (
            <g key={x}>
              <line x1={xScale(x)} y1="0" x2={xScale(x)} y2={GRAPH_H} stroke="#cbd5e1" strokeDasharray="4 4" />
              <text x={xScale(x)} y={GRAPH_H + 15} textAnchor="middle" fontSize="10" fill="#64748b">{x}</text>
            </g>
          ))}

          <polygon points={areaPath} fill="url(#areaGradient)" />
          <polyline points={pointsStr} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
          <circle cx={xScale(alkaliAdded)} cy={yScale(currentpH)} r="6" fill={getLiquidColor(currentpH)} stroke="#fff" strokeWidth="2" className="drop-shadow-md" />
        </svg>

        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Vol NaOH Added (mL)</div>
        <div className="absolute top-1/2 -left-8 -rotate-90 text-[10px] text-slate-500 font-semibold uppercase tracking-widest">pH Level</div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-xl border border-slate-200 font-sans relative">
      
      {/* --- Header --- */}
      <header className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FlaskConical className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Neutralization Lab</h1>
            <p className="text-slate-500 text-xs font-medium">Task: Determine exact volume of NaOH to neutralize 10mL of HCl</p>
          </div>
        </div>
        <button 
          onClick={handleReset} 
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 !bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <RefreshCw size={14} /> RESTART
        </button>
      </header>

      {/* --- PREDICTION STAGE --- */}
      {gameState === 'prediction' && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-bottom">
          <div className="bg-white p-4 rounded-full mb-4 shadow-md">
            <Microscope size={48} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Step 1: Make a Prediction</h2>
          <p className="text-slate-600 text-center max-w-md mb-6 font-medium leading-relaxed">
            You have <strong>10 mL</strong> of <strong>Dilute Hydrochloric Acid (HCl)</strong>.<br/>
            You are adding <strong>Dilute Sodium Hydroxide (NaOH)</strong>.<br/>
            How much Alkali do you think is needed to reach neutralization (pH 7)?
          </p>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={userPrediction}
              onChange={(e) => setUserPrediction(e.target.value)}
              placeholder="Enter volume (mL)"
              className="border-2 border-slate-400 rounded-lg px-4 py-3 text-sm w-48 text-center text-slate-900 font-bold focus:border-blue-600 outline-none shadow-inner bg-white"
            />
            {/* UPDATED BUTTON: Explicit styles for light mode visibility */}
            <button 
              onClick={submitPrediction}
              disabled={!userPrediction}
              className={`
                px-8 py-3 rounded-lg font-bold text-lg shadow-md transition-all active:scale-95 border-2
                ${!userPrediction 
                  ? '!bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' 
                  : '!bg-blue-600 text-white border-blue-700 hover:bg-blue-700 hover:border-blue-800'
                }
              `}
            >
              Start Experiment
            </button>
          </div>
        </div>
      )}

      {/* --- EXPERIMENT STAGE --- */}
      {gameState !== 'prediction' && (
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* --- LEFT COLUMN: Beaker & Controls --- */}
          <div className="flex-1 flex flex-col items-center">
            
            {/* Info Card with Prediction */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-4 w-full text-sm text-slate-700 flex justify-between items-center shadow-sm">
               <div className="flex gap-4 text-xs font-medium">
                 <span><strong>Acid:</strong> 10mL (Dilute HCl)</span>
                 <span><strong>Alkali:</strong> Dilute NaOH</span>
               </div>
               <div className="text-xs bg-white px-3 py-1 rounded-lg border border-slate-200 text-blue-700 font-bold shadow-sm">
                 Prediction: {userPrediction} mL
               </div>
            </div>

            {/* Celebration Overlay */}
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="absolute text-3xl animate-float" style={{ left: `${Math.random()*100}%`, bottom: '-20px', animationDuration: `${1+Math.random()*2}s` }}>
                    {['🎉', '🧪', '✅', '✨'][i%4]}
                  </div>
                ))}
              </div>
            )}

            {/* ION TRACKER - MOVED OUTSIDE Visual Area for Clarity */}
            <div className="w-full max-w-[280px] bg-slate-100 border border-slate-200 p-2 rounded-lg text-[10px] mb-2 flex justify-between items-center shadow-sm">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Micro View (Ions):</span>
              <div className="flex gap-4">
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-red-500">H⁺ Acid:</span>
                  <span className="font-mono text-slate-700">{currentpH < 7 ? 'High' : currentpH === 7 ? 'Balanced' : 'Low'}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-blue-500">OH⁻ Alkali:</span>
                  <span className="font-mono text-slate-700">{currentpH > 7 ? 'High' : currentpH === 7 ? 'Balanced' : 'Low'}</span>
                </div>
              </div>
            </div>

            {/* Visual Simulation Area */}
            {/* Added 'isShaking' state to trigger 'animate-swirl' class */}
            <div className={`relative w-full max-w-[280px] h-[320px] bg-slate-50 rounded-2xl shadow-inner border border-slate-200 flex flex-col items-center justify-end pb-4 mb-6 overflow-hidden ${isShaking ? 'animate-swirl' : ''}`}>
              
              {/* Volume Display - Top Left */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur p-2 rounded-lg border border-blue-100 shadow-sm z-30">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume Added</div>
                <div className="text-xl font-mono font-bold text-blue-600 leading-none mt-1">
                  {alkaliAdded.toFixed(1)} <span className="text-xs text-slate-500 font-sans font-normal">mL</span>
                </div>
              </div>

              {/* Status Labels */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-30">
                  {Math.abs(currentpH - 7) < 0.1 && (
                     <div className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-bold border border-green-300 flex items-center gap-1 shadow-sm">
                        <CheckCircle size={12} /> Neutral (pH 7)
                     </div>
                  )}
                  {currentpH > 7.1 && (
                     <div className="bg-purple-100 text-purple-800 text-xs px-3 py-1.5 rounded-full font-bold border border-purple-300 shadow-sm">
                        Alkaline (pH {currentpH.toFixed(1)})
                     </div>
                  )}
              </div>

              {/* SYRINGE Graphic */}
              {(gameState === 'running' || gameState === 'indicator-added') && (
                 <div className="absolute top-[-40px] z-20">
                    <svg width="60" height="140" viewBox="0 0 60 140">
                       <g className={gameState === 'running' ? 'animate-press' : ''}>
                          <rect x="25" y="0" width="10" height="35" fill="#94a3b8" />
                          <rect x="15" y="0" width="30" height="5" fill="#475569" />
                       </g>
                       <rect x="15" y="35" width="30" height="70" rx="2" fill="rgba(255,255,255,0.95)" stroke="#94a3b8" strokeWidth="2" />
                       <rect x="17" y={37 + (alkaliAdded / MAX_ALKALI * 60)} width="26" height={60 - (alkaliAdded / MAX_ALKALI * 60)} fill="#bfdbfe" />
                       <line x1="15" y1="50" x2="25" y2="50" stroke="#cbd5e1" strokeWidth="1" />
                       <line x1="15" y1="65" x2="25" y2="65" stroke="#cbd5e1" strokeWidth="1" />
                       <line x1="15" y1="80" x2="25" y2="80" stroke="#cbd5e1" strokeWidth="1" />
                       <rect x="27" y="105" width="6" height="15" fill="#cbd5e1" />
                    </svg>
                    <div key={alkaliAdded} className={`absolute w-2 h-2 bg-blue-400 rounded-full left-[26px] top-[110px] ${gameState === 'running' ? 'animate-drop' : 'hidden'}`}></div>
                 </div>
              )}

              {/* Beaker Container */}
              <div className="relative w-32 h-40">
                <div className="absolute inset-0 border-4 border-slate-300 border-t-0 rounded-b-2xl bg-white/50 z-20 pointer-events-none"></div>
                <div className="absolute inset-0 overflow-hidden rounded-b-2xl z-10 px-1 pb-1">
                   <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
                    style={{ 
                      // +9% Visual Boost
                      height: `${(currentTotalVolume / MAX_BEAKER_VOL) * 100 + (currentTotalVolume > 0 ? 9 : 0)}%`,
                      backgroundColor: getLiquidColor(currentpH),
                      boxShadow: currentTotalVolume > 0 ? `inset 0 -5px 20px rgba(0,0,0,0.1)` : 'none',
                      borderTop: (currentTotalVolume > 0) ? '3px solid rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {gameState === 'running' && (
                      <div className="w-full h-full flex justify-center items-end pb-2 opacity-50">
                        <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 50mL Scale: 10, 20, 30, 40 */}
                <div className="absolute right-0 bottom-[20%] w-4 border-t border-slate-400 text-[9px] text-slate-600 text-right pr-1 z-30 font-bold">10</div>
                <div className="absolute right-0 bottom-[40%] w-4 border-t border-slate-400 text-[9px] text-slate-600 text-right pr-1 z-30 font-bold">20</div>
                <div className="absolute right-0 bottom-[60%] w-4 border-t border-slate-400 text-[9px] text-slate-600 text-right pr-1 z-30 font-bold">30</div>
                <div className="absolute right-0 bottom-[80%] w-4 border-t border-slate-400 text-[9px] text-slate-600 text-right pr-1 z-30 font-bold">40</div>
              </div>

              <div className="mt-2 text-base font-mono text-slate-700 font-bold bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                 pH: <span style={{ color: gameState != 'running' ? 'black' : getLiquidColor(currentpH) }}>{currentpH.toFixed(1)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="w-full flex justify-center">
              {gameState === 'start' && (
                <button 
                  onClick={addAcid} 
                  className="relative group overflow-hidden px-6 py-4 rounded-2xl font-bold text-white bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-[0_4px_0_#991b1b] active:shadow-none active:translate-y-[4px] transition-all duration-100 flex items-center gap-3 text-lg w-full justify-center max-w-[280px]"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/10 pointer-events-none" />
                  <Beaker className="transform transition-transform duration-300 group-hover:-rotate-12" size={24} />
                  <span>Add 10mL Dilute HCl</span>
                </button>
              )}
              
              {gameState === 'acid-added' && (
                <button 
                  onClick={addIndicator} 
                  className="relative group overflow-hidden px-6 py-4 rounded-2xl font-bold text-white bg-gradient-to-b from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-[0_4px_0_#581c87] active:shadow-none active:translate-y-[4px] transition-all duration-100 flex items-center gap-3 text-lg w-full justify-center max-w-[280px]"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/10 pointer-events-none" />
                  <Sparkles className="transform transition-transform duration-300 group-hover:scale-110" size={24} />
                  <span>Add Universal Indicator</span>
                </button>
              )}

              {/* DUAL BUTTONS for Technique Demonstration */}
              {(gameState === 'indicator-added' || gameState === 'running') && (
                <div className="flex flex-col gap-3 items-center w-full max-w-[240px]">
                  
                  {/* Warning Message when disabling Fast Stream */}
                  {alkaliAdded >= 8 && alkaliAdded < 12 && (
                    <div className="text-xs text-orange-700 font-bold bg-orange-50 px-3 py-2 rounded-lg animate-pulse border border-orange-200 text-center w-full shadow-sm">
                      ⚠️ Critical Zone! <br/>Switch to Drop-wise.
                    </div>
                  )}
                  
                  {neutralReached && alkaliAdded < MAX_ALKALI && (
                    <div className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 text-center w-full shadow-sm">
                      ✅ Neutral Reached! <br/>You can finish or add excess.
                    </div>
                  )}

                  {/* Fast Stream Button - 1mL Steps */}
                  <button 
                    onClick={() => addAlkali(1.0)} 
                    // Disabled between 8mL and 12mL to force drop-wise near neutral point
                    disabled={(alkaliAdded >= 8 && alkaliAdded < 12) || alkaliAdded >= MAX_ALKALI}
                    className={`
                      w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2
                      ${(alkaliAdded >= 8 && alkaliAdded < 12) || alkaliAdded >= MAX_ALKALI
                        ? '!bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                        : '!bg-white text-blue-600 border-blue-500 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 active:scale-95 shadow-sm'
                      }
                    `}
                  >
                    Fast Stream (Add 1 mL)
                  </button>

                  {/* Drop-wise Button (Main 3D Button) */}
                  <button 
                    onClick={() => addAlkali(0.1)} 
                    disabled={alkaliAdded >= MAX_ALKALI}
                    className={`
                      relative group overflow-hidden px-4 py-4 rounded-2xl font-bold text-white shadow-md transition-all duration-100 w-full
                      ${alkaliAdded >= MAX_ALKALI
                        ? 'bg-slate-400 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 shadow-[0_4px_0_#1e3a8a] active:shadow-none active:translate-y-[4px]'
                      }
                      flex items-center justify-center gap-2 text-md tracking-wide
                    `}
                  >
                    <div className="absolute inset-0 w-full h-full bg-white/10 pointer-events-none" />
                    <Syringe className={`transform transition-transform duration-300 ${alkaliAdded < MAX_ALKALI ? 'group-hover:-rotate-12' : ''}`} size={20} />
                    <div className="flex flex-col items-start leading-none">
                      <span>Drop-wise (0.1 mL)</span>
                    </div>
                  </button>
                  
                  {/* 3D Finish Button - APPEARS IMMEDIATELY ON NEUTRAL */}
                  {neutralReached && (
                      <button 
                          onClick={() => setGameState('quiz')} 
                          className="
                             relative group overflow-hidden mt-2 px-4 py-4 rounded-2xl font-bold text-white w-full
                             bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600
                             shadow-[0_4px_0_#065f46] active:shadow-none active:translate-y-[4px]
                             transition-all duration-100 flex items-center justify-center gap-2 animate-in slide-in-from-bottom
                          "
                      >
                          <span>Finish & Quiz</span>
                          <ArrowRight size={18} />
                      </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: Beautiful Graph & Quiz --- */}
          <div className="flex-1 flex flex-col gap-4 items-center">
            
            {/* Graph Section */}
            {renderBeautifulGraph()}

            {/* Quiz Interface */}
            {gameState === 'quiz' && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-in slide-in-from-right w-full max-w-[300px]">
                <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Question {currentQuestion + 1} of {questions.length}</div>
                <p className="font-bold text-slate-800 mb-4 text-sm leading-relaxed">{questions[currentQuestion].question}</p>
                
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full border-2 border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                    disabled={feedback.type === 'success'}
                  />
                  <button 
                     onClick={handleAnswerSubmit}
                     disabled={feedback.type === 'success' || !userAnswer}
                     className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Check Answer
                  </button>
                </div>
                {feedback.msg && (
                  <div className={`mt-4 text-sm p-3 rounded-lg font-medium border ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {feedback.msg}
                  </div>
                )}
              </div>
            )}

            {gameState === 'completed' && (
              <div className="bg-green-50 p-8 rounded-xl text-center border-2 border-green-200 w-full max-w-[300px] shadow-sm">
                 <h2 className="text-2xl font-extrabold text-green-700 mb-3">Excellent Work!</h2>
                 <p className="text-green-800 font-medium">You have mastered the technique of titration.</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- BOTTOM: Indicator Chart --- */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs font-bold text-center text-slate-400 mb-2 uppercase tracking-widest">Universal Indicator Reference Chart</p>
        <div className="flex h-10 rounded-xl overflow-hidden w-full max-w-2xl mx-auto shadow-md text-[10px] text-white font-bold leading-10 text-center ring-1 ring-slate-900/5">
          <div style={{background: '#ef4444', flex: 1}}>1</div>
          <div style={{background: '#f87171', flex: 1}}>2</div>
          <div style={{background: '#f97316', flex: 1}}>3</div>
          <div style={{background: '#fb923c', flex: 1}}>4</div>
          <div style={{background: '#facc15', flex: 1}}>5</div>
          <div style={{background: '#eab308', flex: 1}}>6</div>
          <div style={{background: '#22c55e', flex: 1}}>7</div>
          <div style={{background: '#14b8a6', flex: 1}}>8</div>
          <div style={{background: '#06b6d4', flex: 1}}>9</div>
          <div style={{background: '#3b82f6', flex: 1}}>10</div>
          <div style={{background: '#2563eb', flex: 1}}>11</div>
          <div style={{background: '#4f46e5', flex: 1}}>12</div>
          <div style={{background: '#7c3aed', flex: 1}}>13</div>
          <div style={{background: '#9333ea', flex: 1}}>14</div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 max-w-2xl mx-auto mt-2 px-1 uppercase tracking-wider">
          <span>Strong Acid</span>
          <span>Neutral</span>
          <span>Strong Alkali</span>
        </div>
      </div>

      <style>{`
        @keyframes drop {
          0% { top: 115px; opacity: 1; transform: scale(1); }
          100% { top: 200px; opacity: 0; transform: scale(0.5); }
        }
        .animate-drop {
          animation: drop 0.4s linear;
        }
        @keyframes press {
          0% { transform: translateY(0); }
          50% { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
        .animate-press {
          animation: press 0.2s ease-in-out;
        }
        @keyframes float {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(-50px) rotate(20deg); opacity: 0; }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        @keyframes ping-slow {
           75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-slow {
           animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
           transform-origin: center;
        }
        /* NEW SHAKE ANIMATION */
        @keyframes swirl {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg) translateX(-2px); }
          75% { transform: rotate(3deg) translateX(2px); }
        }
        .animate-swirl {
          animation: swirl 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NeutralizationLab;
