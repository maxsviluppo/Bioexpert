
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
// Added Heart and ChevronRight to the import list below
import { Camera, Send, Sprout, Info, RefreshCw, MessageSquare, Droplets, AlertTriangle, CheckCircle2, Settings, Moon, Bell, Mountain, Sparkles, History, Share2, Trash2, Zap, ChevronLeft, Key, ExternalLink, Trophy, Target, Gamepad2, Upload, User, ShieldAlert, Clock, Leaf, Apple, Scissors, Wind, Layers, Home, Maximize2, Smartphone, Terminal, ArrowRight, Heart, ChevronRight } from 'lucide-react';

// --- STYLES ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
  }

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
    width: 100vw;
  }

  #root {
    width: 100%;
    height: 100%;
  }

  .app-shell {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    background: var(--bg-warm);
    overflow: hidden;
  }

  header {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 50;
    flex-shrink: 0;
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
    gap: 4px;
    align-items: center;
  }

  .btn-header-icon {
    background: transparent;
    border: none;
    color: var(--primary);
    cursor: pointer;
    padding: 8px;
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
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 800;
  }

  .main-frame {
    position: relative;
    width: calc(100% - 24px);
    flex: 1;
    max-height: 72vh;
    background: var(--white);
    border-radius: 40px;
    padding: 8px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.06);
    border: 1px solid var(--card-border);
    margin: 0 auto 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .frame-inner {
    width: 100%;
    height: 100%;
    flex: 1;
    border-radius: 32px;
    overflow: hidden;
    background: #000;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  [data-theme='dark'] .frame-inner { background: #000; }

  .preview-container {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    position: relative;
    overflow: hidden;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .camera-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000;
  }

  .btn-analyze-toast {
    position: absolute;
    bottom: 30px;
    left: 10%;
    right: 10%;
    background: var(--primary);
    color: white;
    padding: 18px 24px;
    border-radius: 100px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border: none;
    box-shadow: 0 12px 40px rgba(46, 125, 50, 0.6);
    cursor: pointer;
    z-index: 150;
    animation: toastIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-size: 1.1rem;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  @keyframes toastIn {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .frame-chat-area {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
    background: var(--bg-warm);
  }

  .msg {
    max-width: 90%;
    padding: 14px 18px;
    border-radius: 20px;
    font-size: 0.95rem;
    line-height: 1.5;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  .msg-user { align-self: flex-end; background: var(--primary); color: white; border-bottom-right-radius: 4px; }
  .msg-bot { align-self: flex-start; background: var(--white); color: var(--dark); border-bottom-left-radius: 4px; border: 1px solid var(--card-border); }

  .chat-input-row {
    padding: 8px 12px 16px;
    display: flex;
    gap: 8px;
    background: var(--white);
    border-top: 1px solid var(--card-border);
    flex-shrink: 0;
  }

  .input-field {
    flex: 1;
    border-radius: 100px;
    padding: 12px 20px;
    border: 1px solid var(--card-border);
    background: var(--primary-light);
    font-size: 0.95rem;
    outline: none;
    color: var(--dark);
  }

  .action-dashboard {
    padding: 0 16px 24px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-top: auto;
    flex-shrink: 0;
  }

  .btn-3d {
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
    box-shadow: var(--shadow-3d);
    transition: transform 0.2s, background 0.3s;
  }
  .btn-3d:active { transform: scale(0.95); }
  .btn-3d.scatta { background: linear-gradient(145deg, var(--primary), var(--primary-dark)); color: white; }
  .btn-3d.secondary { background: var(--white); color: var(--dark); border: 1px solid var(--card-border); }

  .side-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg-warm);
    z-index: 300;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .overlay-content { flex: 1; overflow-y: auto; padding: 20px; scroll-behavior: smooth; }

  .settings-card {
    background: var(--white);
    border-radius: 24px;
    border: 1px solid var(--card-border);
    margin-bottom: 16px;
    overflow: hidden;
  }

  .settings-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--card-border);
    cursor: pointer;
    transition: background 0.2s;
  }
  .settings-row:active { background: var(--primary-light); }
  .settings-row:last-child { border-bottom: none; }

  .settings-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--primary-light);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .toggle-switch {
    width: 44px;
    height: 24px;
    background: #E0E0E0;
    border-radius: 20px;
    position: relative;
    transition: background 0.3s;
  }
  .toggle-switch.active { background: var(--primary); }
  .toggle-switch::after {
    content: '';
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
  }
  .toggle-switch.active::after { transform: translateX(20px); }

  .shutter-layer {
    position: absolute;
    bottom: 24px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 110;
  }

  .shutter-btn {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    border: 4px solid white;
    padding: 4px;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
  .shutter-inner { width: 100%; height: 100%; background: white; border-radius: 50%; }

  .placeholder-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    height: 100%;
    width: 100%;
    background: var(--bg-warm);
  }

  .sway-animated {
    animation: plantSway 6s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
    transform-origin: 50% 90%;
  }
  @keyframes plantSway {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .analysis-thumbnail-small {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 100px;
    font-weight: 800;
    font-size: 0.75rem;
    text-transform: uppercase;
  }
  .status-healthy { background: #E8F5E9; color: #2E7D32; }
  .status-sick { background: #FFEBEE; color: #D32F2F; }

  .chat-btn-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }

  .chat-deepen-prompt {
    padding: 12px;
    border-radius: 14px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    border: none;
  }
  .chat-deepen-prompt.primary { background: var(--primary); color: white; }
  .chat-deepen-prompt.secondary { background: var(--primary-light); color: var(--primary); }
  .chat-deepen-prompt.action { background: var(--accent); color: var(--primary-dark); }
`;

// --- TYPES ---
interface PlantCare {
  general: string;
  watering: string;
  pruning: string;
  repotting: string;
}

interface PlantAnalysis {
  id: string;
  timestamp: number;
  image: string;
  name: string;
  scientificName: string;
  healthStatus: 'healthy' | 'sick' | 'unknown';
  diagnosis: string;
  care: PlantCare;
}

interface UserStats {
  xp: number;
  level: number;
  totalScans: number;
  completedQuests: string[];
  activeQuests: string[];
}

const QUESTS = [
  { id: 'mushroom', title: 'Cacciatore di Funghi', icon: <Mountain size={20}/>, xp: 50, requirement: 'Fungo' },
  { id: 'succulent', title: 'Esperto di Grasse', icon: <Sprout size={20}/>, xp: 30, requirement: 'Succulenta' },
  { id: 'flower_red', title: 'Cuore Rosso', icon: <Target size={20}/>, xp: 40, requirement: 'Fiore' },
  { id: 'aromatic', title: 'Mastro Aromi', icon: <Leaf size={20}/>, xp: 35, requirement: 'Aromatica' },
  { id: 'indoor', title: 'Giardiniere d\'Interni', icon: <Layers size={20}/>, xp: 45, requirement: 'Interno' },
  { id: 'exotic', title: 'Scopritore Esotico', icon: <Apple size={20}/>, xp: 60, requirement: 'Esotica' },
  { id: 'rose', title: 'Il Poeta delle Rose', icon: <Heart size={18}/>, xp: 40, requirement: 'Rosa' },
  { id: 'tree', title: 'Amico degli Alberi', icon: <Wind size={20}/>, xp: 50, requirement: 'Albero' }
];

// --- APP COMPONENT ---
function App() {
  const [activeMode, setActiveMode] = useState<'scan' | 'chat'>('scan');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [fullScreenAnalysis, setFullScreenAnalysis] = useState<PlantAnalysis | null>(null);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Settings
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<'success' | 'error' | null>(null);
  
  const [messages, setMessages] = useState<{role: 'user' | 'bot' | 'analysis', text?: string, data?: PlantAnalysis}[]>(() => 
    JSON.parse(localStorage.getItem('bio_messages') || '[]')
  );
  const [history, setHistory] = useState<PlantAnalysis[]>(() => 
    JSON.parse(localStorage.getItem('bio_history') || '[]')
  );
  const [stats, setStats] = useState<UserStats>(() => 
    JSON.parse(localStorage.getItem('bio_stats') || '{"xp":0,"level":1,"totalScans":0,"completedQuests":[],"activeQuests":[]}')
  );
  
  const [chatInput, setChatInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('bio_history', JSON.stringify(history));
    localStorage.setItem('bio_stats', JSON.stringify(stats));
    localStorage.setItem('bio_messages', JSON.stringify(messages));
  }, [history, stats, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [messages, isChatLoading, activeMode]);

  // Gestione Camera migliorata per risolvere lo schermo bianco
  useEffect(() => {
    async function startCamera() {
      if (isCameraOn && !capturedImg) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
            audio: false 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Forza il play dopo un piccolo frame per assicurare l'aggancio
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.error("Video play error", e));
            };
          }
        } catch (err) {
          console.error("Camera access error:", err);
          alert("Impossibile accedere alla fotocamera. Verifica i permessi del browser.");
          setIsCameraOn(false);
        }
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCameraOn, capturedImg]);

  const addXp = (amount: number) => {
    setStats(prev => {
      let nxp = prev.xp + amount;
      let nl = prev.level;
      if (nxp >= nl * 100) { nxp -= nl * 100; nl += 1; }
      return { ...prev, xp: nxp, level: nl };
    });
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      setIsCameraOn(false);
    } else {
      setCapturedImg(null);
      setActiveMode('scan');
      setIsCameraOn(true);
    }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const c = canvasRef.current;
    const v = videoRef.current;
    
    // Crop quadrato perfetto
    const size = Math.min(v.videoWidth, v.videoHeight);
    const startX = (v.videoWidth - size) / 2;
    const startY = (v.videoHeight - size) / 2;
    
    c.width = 1024; c.height = 1024;
    c.getContext('2d')?.drawImage(v, startX, startY, size, size, 0, 0, 1024, 1024);
    
    setCapturedImg(c.toDataURL('image/jpeg'));
    setIsCameraOn(false);
  };

  const performAnalysis = async () => {
    if (!capturedImg) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: capturedImg.split(',')[1], mimeType: 'image/jpeg' } },
            { text: "Identifica questa pianta. Restituisci JSON: Nome comune, Scientifico, Salute (healthy/sick), Diagnosi, Cura (general, watering, pruning, repotting)." }
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
              diagnosis: { type: Type.STRING },
              care: {
                type: Type.OBJECT,
                properties: {
                  general: { type: Type.STRING },
                  watering: { type: Type.STRING },
                  pruning: { type: Type.STRING },
                  repotting: { type: Type.STRING }
                },
                required: ['general', 'watering', 'pruning', 'repotting']
              }
            },
            required: ['name', 'scientificName', 'healthStatus', 'diagnosis', 'care']
          }
        }
      });
      const data = JSON.parse(res.text || '{}');
      const entry: PlantAnalysis = { ...data, id: crypto.randomUUID(), timestamp: Date.now(), image: capturedImg };
      setMessages(prev => [...prev, { role: 'analysis', data: entry }]);
      setHistory(prev => [entry, ...prev]);
      addXp(20);
      setCapturedImg(null);
      setActiveMode('chat');
    } catch (e) { alert("Errore durante l'analisi botanica. Riprova."); }
    finally { setIsAnalyzing(false); }
  };

  const sendMessage = async (txt?: string) => {
    const input = txt || chatInput;
    if (!input.trim()) return;
    
    const lastAnalysis = [...messages].reverse().find(m => m.role === 'analysis')?.data;
    let contextPrompt = "";
    if (lastAnalysis) {
      contextPrompt = `L'utente ha analizzato: ${lastAnalysis.name}. Rispondi come esperto agronomo in italiano. `;
    }

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contextPrompt + input,
        config: { 
          systemInstruction: "Sei BioExpert AI. Esperto in botanica, patologie vegetali e cura del verde. Rispondi con tono professionale ma accessibile. Usa icone." 
        }
      });
      setMessages(prev => [...prev, { role: 'bot', text: res.text || "Mi scuso, c'è stato un errore nel generare la risposta." }]);
      addXp(5);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Errore di connessione con l'intelligenza artificiale." }]);
    } finally { setIsChatLoading(false); }
  };

  const testApiKey = async () => {
    setTestingApiKey(true);
    setApiTestResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Test",
        config: { maxOutputTokens: 2 }
      });
      setApiTestResult('success');
    } catch (e) {
      setApiTestResult('error');
    } finally {
      setTestingApiKey(false);
      setTimeout(() => setApiTestResult(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = (ev) => { 
        setCapturedImg(ev.target?.result as string); 
        setActiveMode('scan'); 
        setIsCameraOn(false);
      };
      r.readAsDataURL(file);
    }
  };

  const canClaim = (req: string) => {
    return history.some(h => 
      h.name.toLowerCase().includes(req.toLowerCase()) || 
      h.scientificName.toLowerCase().includes(req.toLowerCase())
    );
  };

  return (
    <div className="app-shell">
      <style>{styles}</style>
      <header>
        <div className="logo">
          <Sprout size={24} color="var(--primary)" />
          <div>
            <h1>BioExpert</h1>
            <div style={{height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden', marginTop: 2}}>
              <div style={{height: '100%', background: 'var(--primary)', width: `${(stats.xp / (stats.level * 100)) * 100}%`, transition: 'width 0.3s'}}></div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className="badge-xp-large">LV.{stats.level}</div>
          <button className="btn-header-icon" onClick={() => setIsHistoryOpen(true)}><History size={20}/></button>
          <button className="btn-header-icon" onClick={() => setIsGamesOpen(true)}><Gamepad2 size={20}/></button>
          <button className="btn-header-icon" onClick={() => setIsSettingsOpen(true)}><Settings size={20}/></button>
        </div>
      </header>

      <div className="main-frame">
        <div className="frame-inner">
          {activeMode === 'scan' ? (
            <div style={{height: '100%', width: '100%', position: 'relative'}}>
              {isCameraOn && !capturedImg ? (
                <>
                  <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                  <div className="shutter-layer">
                    <button className="shutter-btn" onClick={capture}>
                      <div className="shutter-inner"></div>
                    </button>
                  </div>
                </>
              ) : capturedImg ? (
                <div className="preview-container">
                  <img src={capturedImg} className="preview-image" />
                  {!isAnalyzing && (
                    <button className="btn-analyze-toast" onClick={performAnalysis}>
                      <Sparkles size={24}/> ANALIZZA PIANTA
                    </button>
                  )}
                  {isAnalyzing && (
                    <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'white', background: 'rgba(0,0,0,0.7)', zIndex: 160}}>
                       <RefreshCw size={40} style={{animation: 'spin 1s linear infinite', marginBottom: 12}} />
                       <div style={{fontWeight:800}}>Elaborazione Bio-Dati...</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="placeholder-text">
                  <div className="sway-animated" style={{color: 'var(--primary)', opacity: 0.8, marginBottom: 20}}>
                     <Sprout size={80} />
                  </div>
                  <h2 style={{margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)'}}>Scanner Botanico</h2>
                  <p style={{fontSize: '0.9rem', opacity: 0.6, maxWidth: '240px', lineHeight: 1.5}}>Fotografa foglie, fiori o frutti per una diagnosi immediata.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="frame-chat-area" ref={scrollRef}>
              {messages.length === 0 && (
                 <div style={{textAlign:'center', padding:40, opacity:0.3}}>
                    <MessageSquare size={48} style={{margin:'0 auto 10px'}}/>
                    <p>Inizia una conversazione o fai una scansione.</p>
                 </div>
              )}
              {messages.map((m, i) => (
                m.role === 'analysis' ? (
                  <div key={i} style={{background: 'var(--white)', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)'}}>
                    <div style={{padding: '12px 16px', background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>REPORT BIOLOGICO AI</span>
                      <Clock size={12}/>
                    </div>
                    <div style={{padding: 16}}>
                      <div style={{display:'flex', gap: 12, marginBottom: 12}}>
                        <div style={{flex:1}}>
                          <h4 style={{margin:0, fontSize:'1.2rem', fontWeight: 900}}>{m.data?.name}</h4>
                          <span style={{fontSize:'0.8rem', opacity:0.6, fontStyle: 'italic'}}>{m.data?.scientificName}</span>
                        </div>
                        <img src={m.data?.image} className="analysis-thumbnail-small" />
                      </div>
                      
                      <div className={`status-badge ${m.data?.healthStatus === 'healthy' ? 'status-healthy' : 'status-sick'}`} style={{marginBottom: 10}}>
                        {m.data?.healthStatus === 'healthy' ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
                        {m.data?.healthStatus === 'healthy' ? 'SANA' : 'RILEVATE PATOLOGIE'}
                      </div>
                      
                      <p style={{fontSize:'0.9rem', lineHeight: 1.5, margin: '8px 0', color: 'var(--text-muted)'}}>{m.data?.diagnosis}</p>

                      <div className="chat-btn-group">
                         <button className="chat-deepen-prompt primary" onClick={() => setFullScreenAnalysis(m.data!)}>
                            <Maximize2 size={16}/> Report Completo
                         </button>
                         <button className="chat-deepen-prompt secondary" onClick={() => { setActiveMode('scan'); setIsCameraOn(true); }}>
                            <Camera size={16}/> Nuova Scansione
                         </button>
                         <button className="chat-deepen-prompt action" onClick={() => sendMessage(`Approfondiamo la cura di ${m.data?.name}`)}>
                            <MessageSquare size={16}/> Chiedi Consigli
                         </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={i} className={`msg msg-${m.role}`}>
                    {m.text}
                  </div>
                )
              ))}
              {isChatLoading && <div className="msg msg-bot" style={{opacity:0.6, fontStyle:'italic'}}>BioExpert sta scrivendo...</div>}
            </div>
          )}
        </div>
        
        {activeMode === 'chat' && (
          <div className="chat-input-row">
            <input className="input-field" placeholder="Fai una domanda..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <button className="btn-header-icon" style={{background:'var(--primary)', color:'white', width:44, height:44}} onClick={() => sendMessage()}><Send size={18}/></button>
          </div>
        )}
      </div>

      <div className="action-dashboard">
        <button className="btn-3d scatta" onClick={toggleCamera}><Camera size={26}/><span>Fotocamera</span></button>
        <button className="btn-3d secondary" onClick={() => fileInputRef.current?.click()}><Upload size={26} color="var(--primary)"/><span>Galleria</span></button>
        <button className="btn-3d secondary" onClick={() => { setIsCameraOn(false); setActiveMode('chat'); }}><MessageSquare size={26} color="var(--primary)"/><span>Chat AI</span></button>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />

      {/* MODALE IMPOSTAZIONI */}
      {isSettingsOpen && (
        <div className="side-overlay">
          <header style={{padding:16, display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid var(--card-border)'}}>
            <button className="btn-header-icon" onClick={() => setIsSettingsOpen(false)}><ChevronLeft size={24}/></button>
            <h3 style={{margin:0, fontWeight:900}}>Impostazioni</h3>
          </header>
          <div className="overlay-content">
            <div className="settings-card" style={{padding:24, display:'flex', alignItems:'center', gap:16, background:'linear-gradient(135deg, var(--primary), var(--primary-dark))', color:'white', border: 'none'}}>
              <div style={{width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', border: '2px solid white'}}><User size={32}/></div>
              <div>
                <div style={{fontWeight:900, fontSize:'1.2rem'}}>Bio-Utente</div>
                <div style={{fontSize:'0.85rem', opacity:0.9}}>Livello {stats.level} Agronomo</div>
              </div>
            </div>

            <div style={{fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8}}>Preferenze Sistema</div>
            <div className="settings-card">
              <div className="settings-row" onClick={() => setDarkMode(!darkMode)}>
                <div className="settings-icon-box"><Moon size={18}/></div>
                <div style={{flex:1, fontWeight:700}}>Tema Scuro</div>
                <div className={`toggle-switch ${darkMode ? 'active' : ''}`}></div>
              </div>
              <div className="settings-row" onClick={() => window.aistudio.openSelectKey()}>
                <div className="settings-icon-box"><Key size={18}/></div>
                <div style={{flex:1, fontWeight:700}}>Gemini API Key</div>
                <ExternalLink size={16} opacity={0.4}/>
              </div>
              <div className="settings-row" onClick={testApiKey}>
                <div className="settings-icon-box"><Terminal size={18}/></div>
                <div style={{flex:1, fontWeight:700}}>Test API Key (Verifica)</div>
                {testingApiKey ? <RefreshCw size={16} style={{animation:'spin 1s linear infinite'}}/> : 
                 apiTestResult === 'success' ? <CheckCircle2 size={18} color="var(--primary)"/> :
                 apiTestResult === 'error' ? <AlertTriangle size={18} color="var(--danger)"/> :
                 <ChevronRight size={18} opacity={0.3}/>}
              </div>
            </div>

            <div style={{fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8, marginTop: 10}}>Notifiche</div>
            <div className="settings-card">
               <div className="settings-row">
                 <div className="settings-icon-box"><Bell size={18}/></div>
                 <div style={{flex:1, fontWeight:700}}>Promemoria Annaffiatura</div>
                 <div className="toggle-switch active"></div>
               </div>
               <div className="settings-row">
                 <div className="settings-icon-box"><ShieldAlert size={18}/></div>
                 <div style={{flex:1, fontWeight:700}}>Alert Patologie</div>
                 <div className="toggle-switch active"></div>
               </div>
            </div>

            <button className="btn-reset" onClick={() => { if(confirm("Sei sicuro di voler cancellare tutta la cronologia?")) { localStorage.clear(); window.location.reload(); } }}>
               <Trash2 size={18}/> Reset Database Locale
            </button>
            <div style={{textAlign:'center', marginTop:24, opacity:0.4, fontSize:'0.7rem'}}>BioExpert Pro v2.6.5</div>
          </div>
        </div>
      )}

      {/* Sfide Botaniche */}
      {isGamesOpen && (
        <div className="side-overlay">
          <header style={{padding:16, display:'flex', alignItems:'center', gap:12, borderBottom: '1px solid var(--card-border)'}}>
            <button className="btn-header-icon" onClick={() => setIsGamesOpen(false)}><ChevronLeft size={24}/></button>
            <h3 style={{margin:0, flex:1, fontWeight:900}}>Sfide del Verde</h3>
            <Trophy size={24} color="#FFD700" />
          </header>
          <div className="overlay-content">
             <div style={{background:'var(--white)', padding:20, borderRadius:24, marginBottom:24, border:'1px solid var(--card-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
               <div style={{fontWeight:800, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                 <span style={{fontSize: '1.1rem'}}>Progresso Livello {stats.level}</span>
                 <span style={{color:'var(--primary)', fontSize: '0.9rem'}}>{stats.xp} / {stats.level*100} XP</span>
               </div>
               <div style={{height:14, background:'rgba(0,0,0,0.05)', borderRadius:10, overflow:'hidden'}}>
                 <div style={{height:'100%', width:`${(stats.xp/(stats.level*100))*100}%`, background:'var(--primary)', transition:'width 0.5s' }}></div>
               </div>
             </div>

             <div style={{fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8}}>Colleziona Specie</div>

             {QUESTS.map(q => {
               const isCompleted = (stats.completedQuests || []).includes(q.id);
               const isReady = !isCompleted && canClaim(q.requirement);

               return (
                 <div key={q.id} className="game-card" style={{opacity: isCompleted ? 0.6 : 1}}>
                   <div className="settings-icon-box" style={{background: isCompleted ? 'var(--primary-light)' : (isReady ? '#FFFDE7' : 'var(--bg-warm)')}}>
                     {q.icon}
                   </div>
                   <div style={{flex:1}}>
                     <div style={{fontWeight:800}}>{q.title}</div>
                     <div style={{fontSize:'0.75rem', opacity:0.6}}>
                        {isCompleted ? 'Obiettivo raggiunto!' : (isReady ? 'Riscatta la ricompensa!' : `Scansiona: ${q.requirement}`)}
                     </div>
                   </div>
                   {isCompleted ? (
                     <CheckCircle2 size={22} color="var(--primary)"/>
                   ) : isReady ? (
                     <button className="game-btn claim" onClick={() => { setStats(p => ({...p, xp: p.xp + q.xp, completedQuests: [...p.completedQuests, q.id]})); addXp(0); }}><Zap size={14}/> {q.xp} XP</button>
                   ) : (
                     <div style={{fontSize:'0.75rem', fontWeight:700, color:'var(--primary)'}}><Target size={14} style={{verticalAlign:'middle'}}/> IN ATTESA</div>
                   )}
                 </div>
               );
             })}
          </div>
        </div>
      )}

      {/* Cronologia */}
      {isHistoryOpen && (
        <div className="side-overlay">
          <header style={{padding:16, display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid var(--card-border)'}}>
            <button className="btn-header-icon" onClick={() => setIsHistoryOpen(false)}><ChevronLeft size={24}/></button>
            <h3 style={{margin:0, fontWeight:900}}>Diario Scansioni</h3>
          </header>
          <div className="overlay-content">
            {history.length === 0 ? (
              <div className="placeholder-text">
                <History size={48} opacity={0.2} />
                <p>Nessun record salvato.</p>
              </div>
            ) : history.map(h => (
              <div key={h.id} className="game-card" style={{cursor: 'pointer'}} onClick={() => { setFullScreenAnalysis(h); setIsHistoryOpen(false); }}>
                <img src={h.image} style={{width:60, height:60, borderRadius:14, objectFit:'cover', border:'2px solid var(--primary-light)'}} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:800, fontSize:'1rem'}}>{h.name}</div>
                  <div style={{fontSize:'0.75rem', opacity:0.5}}>{new Date(h.timestamp).toLocaleDateString()}</div>
                </div>
                <ArrowRight size={18} opacity={0.3}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL SCREEN ANALYSIS */}
      {fullScreenAnalysis && (
        <div className="side-overlay">
          <header style={{padding:16, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--card-border)'}}>
             <button className="btn-header-icon" onClick={() => setFullScreenAnalysis(null)}><ChevronLeft size={24}/></button>
             <h3 style={{margin:0, fontWeight:900}}>Analisi Bio-Botanica</h3>
             <button className="btn-header-icon" onClick={() => { if(navigator.share) navigator.share({title: fullScreenAnalysis.name, text: fullScreenAnalysis.diagnosis}); }}><Share2 size={20}/></button>
          </header>
          <div className="overlay-content">
            <div style={{display:'flex', justifyContent:'center', background: '#000', borderRadius:32, overflow:'hidden', marginBottom: 20, height: 260}}>
              <img src={fullScreenAnalysis.image} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
            </div>
            
            <div className={`status-badge ${fullScreenAnalysis.healthStatus === 'healthy' ? 'status-healthy' : 'status-sick'}`} style={{fontSize: '0.9rem', marginBottom:12}}>
               {fullScreenAnalysis.healthStatus === 'healthy' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
               {fullScreenAnalysis.healthStatus === 'healthy' ? 'Salute Ottimale' : 'Anomalia Rilevata'}
            </div>

            <h2 style={{margin: '0 0 4px 0', fontSize: '1.8rem', fontWeight: 900}}>{fullScreenAnalysis.name}</h2>
            <span style={{fontSize: '1rem', color: 'var(--primary)', fontStyle: 'italic', marginBottom: 24, display: 'block'}}>{fullScreenAnalysis.scientificName}</span>
            
            <div style={{padding:24, background:'var(--white)', borderRadius:24, border:'1px solid var(--card-border)', marginBottom:24}}>
               <h4 style={{marginTop:0, color:'var(--primary-dark)', display:'flex', alignItems:'center', gap:8, fontSize: '1.1rem'}}><Info size={20}/> Diagnosi BioExpert AI</h4>
               <p style={{margin:0, lineHeight:1.7, fontSize:'1rem', opacity:0.9}}>{fullScreenAnalysis.diagnosis}</p>
            </div>

            <div style={{fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: 16, paddingLeft: 8}}>Manuale di Cura</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, paddingBottom: 40}}>
               <div style={{background:'var(--white)', padding:16, borderRadius:20, border:'1px solid var(--card-border)'}}>
                  <div className="settings-icon-box"><Sprout size={18}/></div>
                  <span style={{fontWeight:800, fontSize:'0.8rem', marginTop:8, display:'block'}}>Ambiente</span>
                  <div style={{fontSize:'0.8rem', opacity:0.7, marginTop:4}}>{fullScreenAnalysis.care.general}</div>
               </div>
               <div style={{background:'var(--white)', padding:16, borderRadius:20, border:'1px solid var(--card-border)'}}>
                  <div className="settings-icon-box"><Droplets size={18}/></div>
                  <span style={{fontWeight:800, fontSize:'0.8rem', marginTop:8, display:'block'}}>Acqua</span>
                  <div style={{fontSize:'0.8rem', opacity:0.7, marginTop:4}}>{fullScreenAnalysis.care.watering}</div>
               </div>
               <div style={{background:'var(--white)', padding:16, borderRadius:20, border:'1px solid var(--card-border)'}}>
                  <div className="settings-icon-box"><Scissors size={18}/></div>
                  <span style={{fontWeight:800, fontSize:'0.8rem', marginTop:8, display:'block'}}>Potatura</span>
                  <div style={{fontSize:'0.8rem', opacity:0.7, marginTop:4}}>{fullScreenAnalysis.care.pruning}</div>
               </div>
               <div style={{background:'var(--white)', padding:16, borderRadius:20, border:'1px solid var(--card-border)'}}>
                  <div className="settings-icon-box"><Layers size={18}/></div>
                  <span style={{fontWeight:800, fontSize:'0.8rem', marginTop:8, display:'block'}}>Rinvaso</span>
                  <div style={{fontSize:'0.8rem', opacity:0.7, marginTop:4}}>{fullScreenAnalysis.care.repotting}</div>
               </div>
            </div>
          </div>
          <div style={{padding: 16, borderTop:'1px solid var(--card-border)', display:'flex', gap:10}}>
             <button className="btn-header-icon" style={{background:'var(--bg-warm)', border:'1px solid var(--card-border)', borderRadius:16, width:54, height:54}} onClick={() => { setFullScreenAnalysis(null); }}><Home size={24}/></button>
             <button className="chat-deepen-prompt primary" style={{flex:1, height:54, borderRadius: 16}} onClick={() => { setFullScreenAnalysis(null); setActiveMode('chat'); sendMessage(`Approfondiamo: ${fullScreenAnalysis.name}`); }}>
                <MessageSquare size={18}/> APPROFONDISCI IN CHAT AI
             </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
