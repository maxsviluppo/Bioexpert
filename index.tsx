
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { Camera, Send, Sprout, Activity, Info, X, RefreshCw, MessageSquare, Droplets, Sun, AlertTriangle, CheckCircle2, Scan, ChevronRight, Settings, Moon, Bell, Bug, Mountain, Users, ZoomIn, ZoomOut, Bot, Sparkles, History, Share2, Download, Trash2, Calendar, Mail, Zap, ChevronLeft, Key, ExternalLink, Plus, Trophy, Target, Gamepad2, Star, Upload, HelpCircle, Volume2, User, Globe, ShieldAlert, LogOut, Heart } from 'lucide-react';

// --- STYLES ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --primary: #2E7D32;
    --primary-dark: #1B5E20;
    --primary-light: #E8F5E9;
    --accent: #C5E1A5;
    --dark: #1A1C19;
    --text-muted: #5F635F;
    --bg-warm: #FBFDF7;
    --white: #FFFFFF;
    --danger: #BA1A1A;
    --card-border: rgba(0,0,0,0.06);
    --shadow-3d: 0 10px 20px -5px rgba(46, 125, 50, 0.3);
    --msg-bot-bg: #F0F2ED;
  }

  [data-theme='dark'] {
    --primary: #81C784;
    --primary-dark: #2E7D32;
    --primary-light: #1B2B1B;
    --accent: #33691E;
    --dark: #E1E3DF;
    --text-muted: #A0A3A0;
    --bg-warm: #121411;
    --white: #1C1E1B;
    --danger: #FFB4AB;
    --card-border: rgba(255,255,255,0.08);
    --shadow-3d: 0 10px 20px -5px rgba(0, 0, 0, 0.5);
    --msg-bot-bg: #242723;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: var(--bg-warm);
    color: var(--dark);
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.3s ease, color 0.3s ease;
    overflow: hidden;
  }

  .app-shell {
    max-width: 480px;
    margin: 0 auto;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    background: var(--bg-warm);
  }

  header {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 50;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo h1 {
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--primary);
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .btn-header-icon {
    background: transparent;
    border: none;
    color: var(--primary);
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    border-radius: 50%;
  }
  .btn-header-icon:active { transform: scale(0.9); background: var(--primary-light); }

  .badge-xp-large {
    background: var(--primary);
    color: white;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 0.9rem;
    font-weight: 800;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
  }

  .main-frame {
    position: relative;
    width: 100%;
    flex: 1;
    max-height: 55vh;
    background: var(--white);
    border-radius: 40px;
    padding: 10px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
    border: 1px solid var(--card-border);
    margin: 0 auto 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .frame-inner {
    width: 100%;
    flex: 1;
    border-radius: 30px;
    overflow: hidden;
    background: #f0f2ed;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  [data-theme='dark'] .frame-inner { background: #242723; }

  .frame-chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
  }

  .msg {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 0.9rem;
    line-height: 1.4;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  .msg-user { align-self: flex-end; background: var(--primary); color: white; border-bottom-right-radius: 4px; }
  .msg-bot { align-self: flex-start; background: var(--white); color: var(--dark); border-bottom-left-radius: 4px; border: 1px solid var(--card-border); }

  .suggestions-scroll {
    display: flex;
    gap: 8px;
    padding: 10px 16px;
    overflow-x: auto;
    background: var(--white);
    border-top: 1px solid var(--card-border);
    scrollbar-width: none;
  }
  .suggestions-scroll::-webkit-scrollbar { display: none; }

  .suggestion-pill {
    white-space: nowrap;
    background: var(--primary-light);
    color: var(--primary);
    padding: 8px 16px;
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
  }
  .suggestion-pill:hover { border-color: var(--primary); background: var(--white); }

  .chat-input-row {
    padding: 8px 12px 12px;
    display: flex;
    gap: 8px;
    background: var(--white);
    border-top: 1px solid var(--card-border);
  }

  .input-field {
    flex: 1;
    border-radius: 100px;
    padding: 12px 20px;
    border: 1px solid var(--card-border);
    background: var(--primary-light);
    font-size: 0.9rem;
    outline: none;
    color: var(--dark);
    transition: all 0.2s;
  }
  .input-field:focus { box-shadow: 0 0 0 2px var(--primary-light); border-color: var(--primary); }

  .action-dashboard {
    padding: 0 16px 20px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-top: auto;
  }

  .btn-3d {
    position: relative;
    height: 90px;
    border-radius: 24px;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: inherit;
    font-weight: 700;
    font-size: 0.75rem;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: var(--shadow-3d);
  }

  .btn-3d.scatta { background: linear-gradient(145deg, var(--primary), var(--primary-dark)); color: white; }
  .btn-3d.secondary { background: var(--white); color: var(--dark); border: 1px solid var(--card-border); box-shadow: 0 8px 16px -4px rgba(0,0,0,0.05); }

  @keyframes softFluctuate {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-8px) scale(1.04); }
  }
  .fluctuating { animation: softFluctuate 2s ease-in-out infinite; }

  @keyframes plantSway {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  .sway-animated {
    animation: plantSway 6s ease-in-out infinite;
    transform-origin: 50% 66%;
  }

  .plant-silhouette {
    color: var(--primary);
    opacity: 0.25;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .side-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg-warm);
    z-index: 200;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .overlay-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 0 40px;
    -webkit-overflow-scrolling: touch;
  }

  .settings-section {
    margin: 0 16px 20px;
    background: var(--white);
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid var(--card-border);
  }

  .settings-section-title {
    padding: 16px 20px 8px;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .settings-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 20px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid rgba(0,0,0,0.03);
  }
  .settings-item:last-child { border-bottom: none; }
  .settings-item:active { background: var(--primary-light); }

  .settings-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: var(--primary-light);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-content { flex: 1; }
  .settings-label { font-weight: 700; font-size: 0.95rem; }
  .settings-sub { font-size: 0.8rem; opacity: 0.6; }

  .profile-header {
    margin: 20px 16px;
    padding: 24px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    border-radius: 32px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: var(--shadow-3d);
  }

  .avatar-lg {
    width: 60px;
    height: 60px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
  }

  .btn-reset {
    margin: 10px 16px;
    padding: 16px;
    border-radius: 20px;
    background: #FFF0F0;
    color: #D32F2F;
    border: 1px solid #FFCDD2;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
  }

  .toggle-switch {
    width: 42px;
    height: 22px;
    border-radius: 50px;
    background: #E1E3DF;
    position: relative;
    cursor: pointer;
    transition: background 0.3s;
  }
  .toggle-switch.active { background: var(--primary); }
  .toggle-switch-handle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: transform 0.3s;
  }
  .toggle-switch.active .toggle-switch-handle { transform: translateX(20px); }
`;

// --- TYPES ---
interface PlantAnalysis {
  id: string;
  timestamp: number;
  image: string;
  name: string;
  scientificName: string;
  healthStatus: 'healthy' | 'sick' | 'unknown';
  diagnosis: string;
}

interface UserStats {
  xp: number;
  level: number;
  totalScans: number;
  completedQuests: number;
}

const QUESTS = [
  { id: 'mushroom', title: 'Trova un fungo', icon: <Mountain size={24}/>, xp: 50, prompt: "Questa immagine contiene un fungo?" },
  { id: 'succulent', title: 'Caccia alle grasse', icon: <Sprout size={24}/>, xp: 30, prompt: "Questa immagine contiene una pianta succulenta?" },
  { id: 'flower_red', title: 'Un fiore rosso', icon: <Target size={24}/>, xp: 40, prompt: "Questa immagine contiene un fiore rosso?" }
];

const CHAT_PROMPTS = [
  "Come curo la mia pianta?",
  "Ogni quanto innaffiare?",
  "Perché le foglie ingialliscono?",
  "Concime consigliato?",
  "Eliminare parassiti?",
  "Curiosità sul basilico",
  "Piante per ombra",
  "Come rinvasare"
];

// --- APP COMPONENT ---
function App() {
  const [activeMode, setActiveMode] = useState<'scan' | 'chat'>('scan');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [fluctuateIdx, setFluctuateIdx] = useState<number | null>(null);
  
  const [messages, setMessages] = useState<{role: 'user' | 'bot' | 'analysis', text?: string, data?: PlantAnalysis}[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  const [history, setHistory] = useState<PlantAnalysis[]>(() => {
    const saved = localStorage.getItem('bioexpert_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('bioexpert_stats');
    return saved ? JSON.parse(saved) : { xp: 0, level: 1, totalScans: 0, completedQuests: 0 };
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('bioexpert_history', JSON.stringify(history));
    localStorage.setItem('bioexpert_stats', JSON.stringify(stats));
  }, [history, stats]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFluctuateIdx(Math.floor(Math.random() * 3));
      setTimeout(() => setFluctuateIdx(null), 6000);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isChatLoading, activeMode]);

  const addXp = (amount: number) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      if (newXp >= prev.level * 100) {
        newXp -= prev.level * 100;
        newLevel += 1;
      }
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsCameraOn(false);
  };

  const toggleCamera = async () => {
    if (isCameraOn) stopCamera();
    else {
      setActiveMode('scan');
      setCapturedImg(null);
      try {
        const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(ms);
        setIsCameraOn(true);
        setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = ms; }, 50);
      } catch (err) { alert("Fotocamera non disponibile."); }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImg(dataUrl);
        setActiveMode('scan');
        await performStandardAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: {
          systemInstruction: "Sei BioExpert, un esperto botanico amichevole e competente. Fornisci consigli pratici e concisi sulla cura delle piante, la salute vegetale e il giardinaggio. Rispondi in italiano."
        }
      });
      setMessages(prev => [...prev, { role: 'bot', text: res.text }]);
      addXp(5);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Spiacente, si è verificato un errore nella connessione." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const performStandardAnalysis = async (dataUrl: string) => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: dataUrl.split(',')[1], mimeType: 'image/jpeg' } },
            { text: "Identifica questa pianta e analizza salute. Rispondi in JSON." }
          ]
        },
        config: { 
          responseMimeType: "application/json", 
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              scientificName: { type: Type.STRING },
              healthStatus: { type: Type.STRING, enum: ['healthy', 'sick', 'unknown'] },
              diagnosis: { type: Type.STRING }
            },
            required: ['name', 'scientificName', 'healthStatus', 'diagnosis']
          }
        }
      });
      const result = JSON.parse(res.text);
      const entry = { ...result, id: crypto.randomUUID(), timestamp: Date.now(), image: dataUrl };
      setMessages(prev => [...prev, { role: 'analysis', data: entry }]);
      setHistory(prev => [entry, ...prev]);
      addXp(20);
      setActiveMode('chat');
    } catch (e) { alert("Errore analisi."); }
    finally { setIsAnalyzing(false); }
  };

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = 1024; c.height = 1024;
    c.getContext('2d')?.drawImage(v, (v.videoWidth - 1024)/2, (v.videoHeight - 1024)/2, 1024, 1024, 0, 0, 1024, 1024);
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    setCapturedImg(dataUrl);
    stopCamera();
    await performStandardAnalysis(dataUrl);
  };

  const resetData = () => {
    if (confirm("Sei sicuro? Tutti i dati verranno eliminati per sempre.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="app-shell">
      <style>{styles}</style>
      
      <header>
        <div className="logo">
          <Sprout size={24} color="var(--primary)" />
          <div>
            <h1>BioExpert</h1>
            <div className="xp-bar-container">
              <div className="xp-bar-fill" style={{width: `${(stats.xp / (stats.level * 100)) * 100}%`}}></div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="badge-xp-large">Lv.{stats.level}</div>
          <button className="btn-header-icon" onClick={() => setIsHistoryOpen(true)} title="Archivio">
            <History size={24} />
          </button>
          <button className="btn-header-icon" onClick={() => setIsGamesOpen(true)} title="Giochi">
            <Gamepad2 size={24} />
          </button>
          <button className="btn-header-icon" onClick={() => setIsSettingsOpen(true)} title="Impostazioni">
            <Settings size={24} />
          </button>
        </div>
      </header>

      <div className="main-frame">
        <div className="frame-inner">
          {activeMode === 'scan' ? (
            <div style={{height: '100%', position: 'relative'}}>
              {isCameraOn ? (
                <>
                  <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                  <div className="shutter-layer">
                    <button className="shutter-btn" onClick={capture}><div className="shutter-inner"></div></button>
                  </div>
                </>
              ) : capturedImg ? (
                <div style={{height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                   <img src={capturedImg} className="camera-video" style={{opacity: isAnalyzing ? 0.5 : 1}} alt="Captured" />
                </div>
              ) : (
                <div className="placeholder-text" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <div className="plant-silhouette">
                    <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor">
                        {/* Vaso fisso */}
                        <path d="M28 72 L72 72 L68 98 C68 100, 32 100, 32 98 Z" />
                        <rect x="22" y="66" width="56" height="7" rx="1" />
                        
                        {/* Piantina che oscilla */}
                        <g className="sway-animated">
                          {/* Stelo */}
                          <rect x="48.5" y="42" width="3" height="25" />
                          
                          {/* Foglie laterali */}
                          <path d="M48.5 62 Q30 62 28 50 Q40 45 48.5 58" />
                          <path d="M51.5 62 Q70 62 72 50 Q60 45 51.5 58" />
                          
                          {/* Fiore a 5 petali */}
                          <circle cx="50" cy="12" r="14" />
                          <circle cx="34" cy="24" r="14" />
                          <circle cx="66" cy="24" r="14" />
                          <circle cx="40" cy="44" r="14" />
                          <circle cx="60" cy="44" r="14" />
                          <circle cx="50" cy="28" r="5" fill="var(--bg-warm)" opacity="0.1" />
                        </g>
                    </svg>
                  </div>
                  <p style={{fontSize: '1rem', fontWeight: 800, marginTop: -20, opacity: 0.5}}>Analizza o carica una pianta</p>
                </div>
              )}
              {isAnalyzing && (
                <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100}}>
                  <div className="spinner"></div>
                  <p style={{marginTop: 12, fontWeight: 800, color: 'var(--primary)'}}>Intelligenza Botanica...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="frame-chat-area" ref={scrollRef}>
              {messages.length === 0 && (
                <div style={{textAlign: 'center', marginTop: 20, padding: 20}}>
                   <div style={{background: 'var(--primary-light)', padding: 24, borderRadius: 32, marginBottom: 20}}>
                      <Bot size={48} color="var(--primary)" />
                      <h3 style={{color: 'var(--primary)', marginTop: 12, marginBottom: 8}}>BioExpert Chat</h3>
                      <p style={{fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5}}>Fai una domanda sulle tue piante o seleziona un suggerimento qui sotto per iniziare.</p>
                   </div>
                   <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center'}}>
                      {CHAT_PROMPTS.slice(0, 4).map((p, i) => (
                        <div key={i} className="suggestion-pill" onClick={() => sendMessage(p)}>
                          {p}
                        </div>
                      ))}
                   </div>
                </div>
              )}
              {messages.map((m, i) => (
                m.role === 'analysis' ? (
                  <div key={i} className="analysis-card" style={{background: 'var(--white)', padding: 16, borderRadius: 24, border: '1px solid var(--card-border)', marginBottom: 10}}>
                    <div className={`badge badge-${m.data?.healthStatus === 'healthy' ? 'healthy' : 'sick'}`} style={{marginBottom: 8, padding: '4px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, background: m.data?.healthStatus === 'healthy' ? '#E8F5E9' : '#FFEBEE', color: m.data?.healthStatus === 'healthy' ? '#2E7D32' : '#C62828'}}>
                      {m.data?.healthStatus === 'healthy' ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
                      {m.data?.healthStatus === 'healthy' ? 'Sana' : 'Attenzione'}
                    </div>
                    <h4 style={{margin: '0 0 4px 0', color: 'var(--primary)', fontWeight: 800}}>{m.data?.name}</h4>
                    <div style={{fontSize: '0.75rem', opacity: 0.5, marginBottom: 8, fontStyle: 'italic'}}>{m.data?.scientificName}</div>
                    <p style={{fontSize: '0.85rem', lineHeight: 1.5, margin: 0}}>{m.data?.diagnosis}</p>
                  </div>
                ) : (
                  <div key={i} className={`msg msg-${m.role}`}>{m.text}</div>
                )
              ))}
              {isChatLoading && <div className="msg msg-bot" style={{opacity: 0.5}}>Sta scrivendo...</div>}
            </div>
          )}
        </div>
        {activeMode === 'chat' && (
          <div className="suggestions-scroll">
            {CHAT_PROMPTS.map((p, i) => (
              <div key={i} className="suggestion-pill" onClick={() => sendMessage(p)}>
                {p}
              </div>
            ))}
          </div>
        )}
        {activeMode === 'chat' && (
          <div className="chat-input-row">
            <input 
              className="input-field" 
              placeholder="Messaggio BioExpert..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="btn-header-icon" 
              style={{background: 'var(--primary)', color: 'white', width: 44, height: 44, borderRadius: '50%'}}
              onClick={() => sendMessage()}
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="action-dashboard">
        <button className={`btn-3d scatta ${activeMode === 'scan' && isCameraOn ? 'active' : ''} ${fluctuateIdx === 0 ? 'fluctuating' : ''}`} onClick={toggleCamera}>
          <Camera size={26} />
          <span>Camera</span>
        </button>
        <button className={`btn-3d secondary ${fluctuateIdx === 1 ? 'fluctuating' : ''}`} onClick={() => fileInputRef.current?.click()}>
          <Upload size={26} color="var(--primary)" />
          <span>Carica</span>
        </button>
        <button className={`btn-3d secondary ${activeMode === 'chat' ? 'active' : ''} ${fluctuateIdx === 2 ? 'fluctuating' : ''}`} onClick={() => { setActiveMode('chat'); stopCamera(); }}>
          <MessageSquare size={26} color="var(--primary)" />
          <span>Esperto AI</span>
        </button>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />

      {/* GAMES OVERLAY */}
      {isGamesOpen && (
        <div className="side-overlay">
          <header className="overlay-header">
            <button className="btn-header-icon" onClick={() => setIsGamesOpen(false)}><ChevronLeft size={28}/></button>
            <h3>Sfide BioExpert</h3>
            <Trophy size={24} color="var(--primary)" />
          </header>
          
          <div className="overlay-content">
            <div className="game-grid">
              <div style={{background: 'var(--white)', padding: 24, borderRadius: 32, border: '1px solid var(--card-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'}}>
                 <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 15}}>
                    <div style={{background: 'var(--primary)', padding: 10, borderRadius: 14, color: 'white'}}><Star size={24} fill="white" /></div>
                    <div>
                      <div style={{fontWeight: 800, fontSize: '1.2rem'}}>Bio-Stats</div>
                      <div style={{fontSize: '0.8rem', opacity: 0.6}}>Livello {stats.level} Apprendista</div>
                    </div>
                 </div>
                 <div className="xp-bar-container" style={{width: '100%', height: 12, marginBottom: 15, background: 'rgba(0,0,0,0.05)', borderRadius: 10}}>
                    <div className="xp-bar-fill" style={{width: `${(stats.xp / (stats.level * 100)) * 100}%`, borderRadius: 10}}></div>
                 </div>
                 <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                    <div style={{background: 'var(--primary-light)', padding: 12, borderRadius: 16, textAlign: 'center'}}>
                      <div style={{fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase'}}>Scansioni</div>
                      <div style={{fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem'}}>{history.length}</div>
                    </div>
                    <div style={{background: 'var(--primary-light)', padding: 12, borderRadius: 16, textAlign: 'center'}}>
                      <div style={{fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase'}}>Missioni</div>
                      <div style={{fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem'}}>{stats.completedQuests}</div>
                    </div>
                 </div>
              </div>

              <div style={{marginTop: 10, fontWeight: 800, color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em'}}>Mappa Avventure</div>
              
              <div className="settings-item" style={{background: 'var(--white)', borderRadius: 24, padding: 16, border: '1px solid var(--card-border)'}}>
                <div className="settings-icon" style={{background: '#FFF8E1', color: '#FFB300'}}><Target size={24}/></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight: 700}}>Quiz del Giorno</div>
                  <div style={{fontSize: '0.75rem', opacity: 0.6}}>Testa la tua conoscenza</div>
                </div>
                <div style={{fontSize: '0.8rem', fontWeight: 800, color: '#FFB300'}}>+50 XP</div>
              </div>

              {QUESTS.map(q => (
                <div key={q.id} className="settings-item" style={{background: 'var(--white)', borderRadius: 24, padding: 16, border: '1px solid var(--card-border)'}}>
                  <div className="settings-icon">{q.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight: 700}}>{q.title}</div>
                    <div style={{fontSize: '0.75rem', opacity: 0.6}}>Obiettivo missione attiva</div>
                  </div>
                  <div style={{fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)'}}>+{q.xp} XP</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY OVERLAY */}
      {isHistoryOpen && (
        <div className="side-overlay">
          <header className="overlay-header">
            <button className="btn-header-icon" onClick={() => setIsHistoryOpen(false)}><ChevronLeft size={28}/></button>
            <h3>Le tue Scoperte</h3>
          </header>
          <div className="overlay-content" style={{padding: '0 0 40px'}}>
            {history.length === 0 ? (
              <div style={{textAlign: 'center', opacity: 0.3, marginTop: 100}}>
                <Sprout size={64} style={{marginBottom: 16}} />
                <p>Nessuna pianta salvata.</p>
              </div>
            ) : history.map(item => (
              <div key={item.id} className="history-item" style={{margin: '16px 16px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'}}>
                 <img src={item.image} style={{width: 70, height: 70, borderRadius: 18, objectFit: 'cover'}} alt={item.name} />
                 <div style={{flex: 1}}>
                    <div style={{fontWeight: 800, color: 'var(--primary)', fontSize: '1rem'}}>{item.name}</div>
                    <div style={{fontSize: '0.7rem', opacity: 0.5}}>{new Date(item.timestamp).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</div>
                    <div style={{fontSize: '0.8rem', marginTop: 4, fontStyle: 'italic'}}>{item.scientificName}</div>
                 </div>
                 <button className="btn-header-icon" style={{color: '#D32F2F', alignSelf: 'center'}} onClick={() => { if(confirm("Eliminare?")) setHistory(h => h.filter(p => p.id !== item.id)) }}>
                   <Trash2 size={18}/>
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS OVERLAY - ENHANCED */}
      {isSettingsOpen && (
        <div className="side-overlay">
          <header className="overlay-header">
            <button className="btn-header-icon" onClick={() => setIsSettingsOpen(false)}><ChevronLeft size={28}/></button>
            <h3>Impostazioni</h3>
          </header>
          <div className="overlay-content">
            
            <div className="profile-header">
              <div className="avatar-lg">
                <User size={32} />
              </div>
              <div>
                <div style={{fontWeight: 800, fontSize: '1.2rem'}}>Bio-User #{Math.floor(Math.random()*9000)+1000}</div>
                <div style={{fontSize: '0.8rem', opacity: 0.8}}>Socio del Club Botanico</div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Preferenze App</div>
              <div className="settings-item" onClick={() => setDarkMode(!darkMode)}>
                <div className="settings-icon"><Moon size={20}/></div>
                <div className="settings-content">
                  <div className="settings-label">Modalità Scura</div>
                  <div className="settings-sub">Riduce l'affaticamento visivo</div>
                </div>
                <div className={`toggle-switch ${darkMode ? 'active' : ''}`}>
                  <div className="toggle-switch-handle"></div>
                </div>
              </div>
              <div className="settings-item" onClick={() => setSoundEnabled(!soundEnabled)}>
                <div className="settings-icon"><Volume2 size={20}/></div>
                <div className="settings-content">
                  <div className="settings-label">Effetti Sonori</div>
                  <div className="settings-sub">Suoni di sistema attivi</div>
                </div>
                <div className={`toggle-switch ${soundEnabled ? 'active' : ''}`}>
                  <div className="toggle-switch-handle"></div>
                </div>
              </div>
              <div className="settings-item" onClick={() => setVibrateEnabled(!vibrateEnabled)}>
                <div className="settings-icon"><Zap size={20}/></div>
                <div className="settings-content">
                  <div className="settings-label">Vibrazione</div>
                  <div className="settings-sub">Feedback tattile</div>
                </div>
                <div className={`toggle-switch ${vibrateEnabled ? 'active' : ''}`}>
                  <div className="toggle-switch-handle"></div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">IA & Sicurezza</div>
              <div className="settings-item" onClick={() => window.aistudio.openSelectKey()}>
                <div className="settings-icon" style={{background: '#E1F5FE', color: '#039BE5'}}><Key size={20}/></div>
                <div className="settings-content">
                  <div className="settings-label">Gemini API Key</div>
                  <div className="settings-sub">Configura il motore dell'IA</div>
                </div>
                <ChevronRight size={18} opacity={0.3} />
              </div>
              <div className="settings-item">
                <div className="settings-icon" style={{background: '#E8F5E9', color: '#2E7D32'}}><ShieldAlert size={20}/></div>
                <div className="settings-content">
                  <div className="settings-label">Privacy & Dati</div>
                  <div className="settings-sub">Le foto sono analizzate localmente</div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Account</div>
              <div className="settings-item">
                <div className="settings-icon"><Globe size={20}/></div>
                <div className="settings-content">
                  <div className="settings-label">Lingua</div>
                  <div className="settings-sub">Italiano</div>
                </div>
              </div>
              <div className="settings-item">
                <div className="settings-icon"><HelpCircle size={20}/></div>
                <div className="settings-content">
                  <div className="settings-label">Guida & FAQ</div>
                </div>
              </div>
            </div>

            <button className="btn-reset" onClick={resetData}>
              <Trash2 size={20}/> Reset Completo Dati
            </button>

            <div style={{textAlign: 'center', padding: '20px 0', opacity: 0.3, fontSize: '0.7rem'}}>
              BioExpert v1.2.0-beta<br/>
              Creato con ❤️ per gli amanti della natura
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
