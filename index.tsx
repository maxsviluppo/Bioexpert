
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { Camera, Send, Sprout, Activity, Info, X, RefreshCw, MessageSquare, Droplets, Sun, AlertTriangle, CheckCircle2, Scan, ChevronRight, Settings, Moon, Bell, Bug, Mountain, Users, ZoomIn, ZoomOut, Bot, Sparkles, History, Share2, Download, Trash2, Calendar, Mail, Zap, ChevronLeft, Key, ExternalLink, Plus, Trophy, Target, Gamepad2, Star, Upload, HelpCircle, Volume2, User, Globe, ShieldAlert, LogOut, Heart, Clock, Leaf, Apple, Scissors, Wind, Layers, Settings2, Sliders } from 'lucide-react';

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
    letter-spacing: 0.05em;
  }

  .main-frame {
    position: relative;
    width: calc(100% - 32px);
    flex: 1;
    max-height: 70vh;
    background: var(--white);
    border-radius: 40px;
    padding: 10px;
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
    border-radius: 30px;
    overflow: hidden;
    background: #f0f2ed;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  [data-theme='dark'] .frame-inner { background: #242723; }

  .frame-chat-area {
    width: 100%;
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
  }

  .msg {
    max-width: 88%;
    padding: 14px 18px;
    border-radius: 20px;
    font-size: 0.95rem;
    line-height: 1.5;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  .msg-user { align-self: flex-end; background: var(--primary); color: white; border-bottom-right-radius: 4px; }
  .msg-bot { align-self: flex-start; background: var(--white); color: var(--dark); border-bottom-left-radius: 4px; border: 1px solid var(--card-border); }

  .suggestions-scroll {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    overflow-x: auto;
    background: var(--white);
    border-top: 1px solid var(--card-border);
    scrollbar-width: none;
    flex-shrink: 0;
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
    transition: transform 0.2s;
  }
  .btn-3d:active { transform: scale(0.95); }

  .btn-3d.scatta { background: linear-gradient(145deg, var(--primary), var(--primary-dark)); color: white; }
  .btn-3d.secondary { background: var(--white); color: var(--dark); border: 1px solid var(--card-border); }

  .btn-analyze-toast {
    position: absolute;
    bottom: 30px;
    left: 20%;
    right: 20%;
    background: var(--primary);
    color: white;
    padding: 16px 24px;
    border-radius: 100px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border: none;
    box-shadow: 0 12px 24px rgba(46, 125, 50, 0.4);
    cursor: pointer;
    z-index: 110;
    animation: toastIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-size: 1rem;
  }
  @keyframes toastIn {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .analysis-msg-container {
    background: var(--white);
    border-radius: 24px;
    border: 1px solid var(--card-border);
    overflow: hidden;
    width: 100%;
    animation: fadeIn 0.4s ease-out;
  }

  .analysis-msg-header {
    padding: 10px 16px;
    background: var(--primary-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--primary-dark);
    text-transform: uppercase;
  }

  .analysis-msg-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .analysis-top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .analysis-title-group {
    flex: 1;
  }

  .analysis-title-group h4 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 900;
    color: var(--primary-dark);
    line-height: 1.1;
  }

  .analysis-title-group .sci {
    font-size: 0.85rem;
    font-style: italic;
    opacity: 0.6;
    margin-top: 4px;
    display: block;
  }

  .analysis-thumbnail-small {
    width: 72px;
    height: 72px;
    border-radius: 16px;
    object-fit: cover;
    border: 2px solid var(--primary-light);
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .care-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed var(--card-border);
  }

  .care-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .care-icon {
    width: 36px;
    height: 36px;
    background: var(--primary-light);
    color: var(--primary);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .care-content {
    flex: 1;
  }

  .care-label {
    font-weight: 800;
    font-size: 0.75rem;
    color: var(--primary-dark);
    text-transform: uppercase;
    display: block;
    margin-bottom: 2px;
  }

  .care-text {
    font-size: 0.92rem;
    line-height: 1.45;
    opacity: 0.95;
  }

  .chat-deepen-prompt {
    margin-top: 20px;
    padding: 14px;
    background: var(--primary-light);
    border-radius: 16px;
    font-size: 0.9rem;
    text-align: center;
    font-weight: 700;
    color: var(--primary-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid transparent;
  }
  .chat-deepen-prompt:active { background: var(--white); border-color: var(--primary); }

  .side-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg-warm);
    z-index: 200;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .overlay-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .settings-section-title {
    padding: 0 12px 8px;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

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
  .settings-row:last-child { border-bottom: none; }
  .settings-row:active { background: var(--primary-light); }

  .settings-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--primary-light);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-text { flex: 1; }
  .settings-label { font-weight: 700; font-size: 0.95rem; }
  .settings-sub { font-size: 0.75rem; opacity: 0.6; margin-top: 2px; }

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
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .toggle-switch.active::after { transform: translateX(20px); }

  .camera-video { width: 100%; height: 100%; object-fit: cover; }
  
  .shutter-layer {
    position: absolute;
    bottom: 24px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  .shutter-btn {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    border: 4px solid white;
    padding: 4px;
    cursor: pointer;
    pointer-events: auto;
  }

  .shutter-inner {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 50%;
  }

  .sway-animated {
    animation: plantSway 5s ease-in-out infinite;
    transform-origin: 50% 85%;
  }
  @keyframes plantSway {
    0%, 100% { transform: rotate(-4deg); }
    50% { transform: rotate(4deg); }
  }

  .placeholder-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    opacity: 0.4;
    height: 100%;
  }

  .btn-reset {
    width: 100%;
    padding: 16px;
    border-radius: 20px;
    background: #FFF0F0;
    color: #BA1A1A;
    border: 1px solid #FFDAD6;
    font-weight: 800;
    cursor: pointer;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .game-card {
    background: var(--white);
    border-radius: 24px;
    padding: 16px;
    border: 1px solid var(--card-border);
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .xp-bar-container-small {
    width: 60px;
    height: 6px;
    background: rgba(0,0,0,0.1);
    border-radius: 10px;
    overflow: hidden;
    margin-top: 4px;
  }
  .xp-bar-fill {
    height: 100%;
    background: var(--primary);
    transition: width 0.3s ease;
  }
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
}

const QUESTS = [
  { id: 'mushroom', title: 'Cacciatore di Funghi', icon: <Mountain size={20}/>, xp: 50 },
  { id: 'succulent', title: 'Esperto di Grasse', icon: <Sprout size={20}/>, xp: 30 },
  { id: 'flower_red', title: 'Cuore Rosso', icon: <Target size={20}/>, xp: 40 },
  { id: 'aromatic', title: 'Mastro Aromi', icon: <Leaf size={20}/>, xp: 35 },
  { id: 'indoor', title: 'Giardiniere d\'Interni', icon: <Layers size={20}/>, xp: 45 },
  { id: 'exotic', title: 'Scopritore Esotico', icon: <Apple size={20}/>, xp: 60 },
  { id: 'rose', title: 'Il Poeta delle Rose', icon: <Heart size={20}/>, xp: 40 },
  { id: 'tree', title: 'Amico degli Alberi', icon: <Wind size={20}/>, xp: 50 }
];

const CHAT_PROMPTS = [
  "Come curo la mia pianta?",
  "Ogni quanto innaffiare?",
  "Foglie ingiallite: perché?",
  "Concime consigliato?",
  "Eliminare parassiti",
  "Piante per ombra"
];

// --- APP COMPONENT ---
function App() {
  const [activeMode, setActiveMode] = useState<'scan' | 'chat'>('scan');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot' | 'analysis', text?: string, data?: PlantAnalysis}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [history, setHistory] = useState<PlantAnalysis[]>(() => JSON.parse(localStorage.getItem('bio_history') || '[]'));
  const [stats, setStats] = useState<UserStats>(() => JSON.parse(localStorage.getItem('bio_stats') || '{"xp":0,"level":1,"totalScans":0}'));
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  // Settings states
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [cloudSync, setCloudSync] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('bio_history', JSON.stringify(history));
    localStorage.setItem('bio_stats', JSON.stringify(stats));
  }, [history, stats]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isChatLoading, activeMode]);

  const addXp = (amount: number) => {
    setStats(prev => {
      let nxp = prev.xp + amount;
      let nl = prev.level;
      if (nxp >= nl * 100) { nxp -= nl * 100; nl += 1; }
      return { ...prev, xp: nxp, level: nl };
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
        const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        setStream(ms);
        setIsCameraOn(true);
        setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = ms; }, 50);
      } catch (err) { alert("Fotocamera non disponibile."); }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = (ev) => { setCapturedImg(ev.target?.result as string); setActiveMode('scan'); };
      r.readAsDataURL(file);
    }
  };

  const sendMessage = async (txt?: string) => {
    const input = txt || chatInput;
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: { systemInstruction: "Sei BioExpert, esperto botanico. Rispondi in italiano con consigli pratici." }
      });
      setMessages(prev => [...prev, { role: 'bot', text: res.text }]);
      addXp(5);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Errore di connessione." }]);
    } finally { setIsChatLoading(false); }
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
            { text: "Identifica la pianta. Fornisci: Nome comune (titolo), Nome scientifico, Salute, Diagnosi, Cura Generale, Innaffiatura, Potatura, Rinvaso. Rispondi in JSON." }
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
      const data = JSON.parse(res.text);
      const entry: PlantAnalysis = { ...data, id: crypto.randomUUID(), timestamp: Date.now(), image: capturedImg };
      setMessages(prev => [...prev, { role: 'analysis', data: entry }]);
      setHistory(prev => [entry, ...prev]);
      addXp(20);
      setCapturedImg(null);
      setActiveMode('chat');
    } catch (e) { alert("Analisi fallita. Riprova con un'immagine più chiara."); }
    finally { setIsAnalyzing(false); }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const c = canvasRef.current;
    c.width = 1024; c.height = 1024;
    c.getContext('2d')?.drawImage(videoRef.current, 0, 0, 1024, 1024);
    setCapturedImg(c.toDataURL('image/jpeg'));
    stopCamera();
  };

  const resetAll = () => {
    if (confirm("Sei sicuro di voler cancellare tutto?")) {
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
            <div className="xp-bar-container-small">
              <div className="xp-bar-fill" style={{width: `${(stats.xp / (stats.level * 100)) * 100}%`}}></div>
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
            <div style={{height: '100%', position: 'relative'}}>
              {isCameraOn ? (
                <>
                  <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                  <div className="shutter-layer">
                    <button className="shutter-btn" onClick={capture}>
                      <div className="shutter-inner"></div>
                    </button>
                  </div>
                </>
              ) : capturedImg ? (
                <div style={{height: '100%', position: 'relative', background: '#000'}}>
                  <img src={capturedImg} style={{width:'100%', height:'100%', objectFit:'cover', opacity: isAnalyzing ? 0.4 : 1}} alt="Acquisizione" />
                  {!isAnalyzing && (
                    <button className="btn-analyze-toast" onClick={performAnalysis}>
                      <Sparkles size={22}/> Analizza Pianta
                    </button>
                  )}
                  {isAnalyzing && (
                    <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'white'}}>
                       <RefreshCw className="spinner" size={40} style={{animation: 'spin 1s linear infinite', marginBottom: 12}} />
                       <div style={{fontWeight:800}}>Bio-Analisi in corso...</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="placeholder-text">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor" className="sway-animated" style={{color:'var(--primary)'}}>
                    <path d="M50 45 C52 70 52 85 50 95" stroke="currentColor" strokeWidth="3" fill="none" />
                    <circle cx="50" cy="22" r="14" /><circle cx="64" cy="31" r="14" /><circle cx="64" cy="48" r="14" /><circle cx="50" cy="57" r="14" /><circle cx="36" cy="48" r="14" /><circle cx="36" cy="31" r="14" /><circle cx="50" cy="39" r="10" />
                    <path d="M51 68 C70 65 75 80 52 85 Z" /><path d="M49 78 C30 75 25 90 48 95 Z" />
                  </svg>
                  <p style={{marginTop:20, fontWeight:800, fontSize: '1.1rem', color: 'var(--primary)'}}>Fai una foto o carica un'immagine</p>
                  <p style={{fontSize: '0.85rem', opacity: 0.7, marginTop: 4}}>Identifica malattie, specie e ottieni consigli</p>
                </div>
              )}
            </div>
          ) : (
            <div className="frame-chat-area" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="placeholder-text" style={{opacity: 0.6}}>
                  <Bot size={48} color="var(--primary)"/>
                  <h3 style={{margin: '12px 0 6px'}}>BioExpert AI</h3>
                  <p>Inquadra una pianta per l'analisi o chiedi un consiglio rapido.</p>
                </div>
              )}
              {messages.map((m, i) => (
                m.role === 'analysis' ? (
                  <div key={i} className="analysis-msg-container">
                    <div className="analysis-msg-header">
                      <span>BIO-ANALISI AI</span>
                      <span><Clock size={12} style={{verticalAlign:'middle'}}/> {new Date(m.data!.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="analysis-msg-content">
                      <div className="analysis-top-row">
                        <div className="analysis-title-group">
                          <h4>{m.data?.name}</h4>
                          <span className="sci">{m.data?.scientificName}</span>
                        </div>
                        <img src={m.data?.image} className="analysis-thumbnail-small" alt="Thumbnail" />
                      </div>
                      
                      <div style={{display:'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12}}>
                        <div className={`status-badge`} style={{display:'inline-flex', padding:'4px 12px', borderRadius:100, fontSize:'0.7rem', fontWeight:800, background: m.data?.healthStatus === 'healthy' ? '#E8F5E9' : '#FFEBEE', color: m.data?.healthStatus === 'healthy' ? '#2E7D32' : '#C62828'}}>
                          {m.data?.healthStatus === 'healthy' ? <CheckCircle2 size={14} style={{marginRight:6}}/> : <AlertTriangle size={14} style={{marginRight:6}}/>}
                          {m.data?.healthStatus === 'healthy' ? 'STATO: OTTIMO' : 'STATO: CRITICO'}
                        </div>
                      </div>
                      
                      <p style={{fontSize:'0.92rem', opacity:0.9, margin:0, lineHeight: 1.5}}>{m.data?.diagnosis}</p>

                      <div className="care-section">
                        <div className="care-item">
                          <div className="care-icon"><Sprout size={18}/></div>
                          <div className="care-content">
                            <span className="care-label">DESCRIZIONE E CURA</span>
                            <div className="care-text">{m.data?.care.general}</div>
                          </div>
                        </div>
                        <div className="care-item">
                          <div className="care-icon"><Droplets size={18}/></div>
                          <div className="care-content">
                            <span className="care-label">ANNAFFIATURA</span>
                            <div className="care-text">{m.data?.care.watering}</div>
                          </div>
                        </div>
                        <div className="care-item">
                          <div className="care-icon"><Scissors size={18}/></div>
                          <div className="care-content">
                            <span className="care-label">POTATURA</span>
                            <div className="care-text">{m.data?.care.pruning}</div>
                          </div>
                        </div>
                        <div className="care-item">
                          <div className="care-icon"><Layers size={18}/></div>
                          <div className="care-content">
                            <span className="care-label">RINVASO / TERRA</span>
                            <div className="care-text">{m.data?.care.repotting}</div>
                          </div>
                        </div>
                      </div>

                      <div className="chat-deepen-prompt" onClick={() => sendMessage(`Vorrei più dettagli sulla cura di questa pianta: ${m.data?.name}`)}>
                         <MessageSquare size={18}/> Approfondisci in chat
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={i} className={`msg msg-${m.role}`}>{m.text}</div>
                )
              ))}
              {isChatLoading && <div className="msg msg-bot" style={{opacity:0.5}}>Sto elaborando...</div>}
            </div>
          )}
        </div>
        {activeMode === 'chat' && (
          <div className="suggestions-scroll">
            {CHAT_PROMPTS.map((p, i) => <div key={i} className="suggestion-pill" onClick={() => sendMessage(p)}>{p}</div>)}
          </div>
        )}
        {activeMode === 'chat' && (
          <div className="chat-input-row">
            <input className="input-field" placeholder="Chiedi a BioExpert..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <button className="btn-header-icon" style={{background:'var(--primary)', color:'white', width:44, height:44}} onClick={() => sendMessage()}><Send size={20}/></button>
          </div>
        )}
      </div>

      <div className="action-dashboard">
        <button className="btn-3d scatta" onClick={toggleCamera}><Camera size={26}/><span>Scatta</span></button>
        <button className="btn-3d secondary" onClick={() => fileInputRef.current?.click()}><Upload size={26} color="var(--primary)"/><span>Carica</span></button>
        <button className="btn-3d secondary" onClick={() => { setActiveMode('chat'); stopCamera(); }}><MessageSquare size={26} color="var(--primary)"/><span>Chat</span></button>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />

      {/* GAMES OVERLAY */}
      {isGamesOpen && (
        <div className="side-overlay">
          <header className="overlay-header" style={{padding:16, display:'flex', alignItems:'center', gap:12}}>
            <button className="btn-header-icon" onClick={() => setIsGamesOpen(false)}><ChevronLeft size={24}/></button>
            <h3 style={{margin:0, flex:1, fontWeight:900}}>Sfide Botaniche</h3>
            <Trophy size={24} color="gold" />
          </header>
          <div className="overlay-content">
            <div style={{background:'var(--white)', padding:20, borderRadius:24, marginBottom:20, border:'1px solid var(--card-border)'}}>
              <div style={{fontWeight:800, marginBottom:8}}>Progresso Livello {stats.level}</div>
              <div style={{height:12, background:'rgba(0,0,0,0.05)', borderRadius:10, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${(stats.xp/(stats.level*100))*100}%`, background:'var(--primary)'}}></div>
              </div>
              <div style={{textAlign:'right', fontSize:'0.75rem', marginTop:6, fontWeight:700}}>{stats.xp} / {stats.level*100} XP</div>
            </div>
            {QUESTS.map(q => (
              <div key={q.id} className="game-card">
                <div className="settings-icon-box">{q.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800}}>{q.title}</div>
                  <div style={{fontSize:'0.7rem', opacity:0.6}}>Cattura una foto per completare</div>
                </div>
                <div style={{fontWeight:900, color:'var(--primary)'}}>+{q.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY OVERLAY */}
      {isHistoryOpen && (
        <div className="side-overlay">
          <header style={{padding:16, display:'flex', alignItems:'center', gap:12}}>
            <button className="btn-header-icon" onClick={() => setIsHistoryOpen(false)}><ChevronLeft size={24}/></button>
            <h3 style={{margin:0, fontWeight:900}}>Archivio Scoperte</h3>
          </header>
          <div className="overlay-content">
            {history.length === 0 ? (
              <div className="placeholder-text">
                <History size={48} />
                <p>Nessuna pianta salvata nell'archivio.</p>
              </div>
            ) : history.map(h => (
              <div key={h.id} className="game-card" onClick={() => { setMessages(prev => [...prev, {role:'analysis', data:h}]); setIsHistoryOpen(false); setActiveMode('chat'); }}>
                <img src={h.image} style={{width:54, height:54, borderRadius:12, objectFit:'cover'}} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:800}}>{h.name}</div>
                  <div style={{fontSize:'0.7rem', opacity:0.5}}>{new Date(h.timestamp).toLocaleDateString()}</div>
                </div>
                <button className="btn-header-icon" style={{color:'var(--danger)'}} onClick={(e) => { e.stopPropagation(); setHistory(prev => prev.filter(p=>p.id!==h.id)); }}><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS OVERLAY - FULL RECONSTRUCTION */}
      {isSettingsOpen && (
        <div className="side-overlay">
          <header style={{padding:16, display:'flex', alignItems:'center', gap:12}}>
            <button className="btn-header-icon" onClick={() => setIsSettingsOpen(false)}><ChevronLeft size={24}/></button>
            <h3 style={{margin:0, fontWeight:900}}>Configurazione</h3>
          </header>
          <div className="overlay-content">
            <div className="settings-card" style={{padding:20, display:'flex', alignItems:'center', gap:16, background:'linear-gradient(135deg, var(--primary), var(--primary-dark))', color:'white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'}}>
              <div style={{width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', border: '2px solid white'}}><User size={30}/></div>
              <div>
                <div style={{fontWeight:900, fontSize:'1.15rem'}}>Profilo BioExpert</div>
                <div style={{fontSize:'0.8rem', opacity:0.85}}>Apprendista Botanico Lv.{stats.level}</div>
              </div>
            </div>

            <div className="settings-section-title">Generale</div>
            <div className="settings-card">
              <div className="settings-row" onClick={() => setDarkMode(!darkMode)}>
                <div className="settings-icon-box"><Moon size={18}/></div>
                <div className="settings-text">
                  <div className="settings-label">Tema Scuro</div>
                  <div className="settings-sub">Regola l'aspetto visivo</div>
                </div>
                <div className={`toggle-switch ${darkMode ? 'active' : ''}`}></div>
              </div>
              <div className="settings-row" onClick={() => window.aistudio.openSelectKey()}>
                <div className="settings-icon-box"><Key size={18}/></div>
                <div className="settings-text">
                  <div className="settings-label">Gemini API Key</div>
                  <div className="settings-sub">Configura l'intelligenza artificiale</div>
                </div>
                <ExternalLink size={16} opacity={0.4}/>
              </div>
            </div>

            <div className="settings-section-title">Notifiche ed Avvisi</div>
            <div className="settings-card">
               <div className="settings-row" onClick={() => setNotifEnabled(!notifEnabled)}>
                 <div className="settings-icon-box"><Bell size={18}/></div>
                 <div className="settings-text">
                   <div className="settings-label">Promemoria Cura</div>
                   <div className="settings-sub">Avvisi per innaffiatura e concime</div>
                 </div>
                 <div className={`toggle-switch ${notifEnabled ? 'active' : ''}`}></div>
               </div>
               <div className="settings-row" onClick={() => setAlertsEnabled(!alertsEnabled)}>
                 <div className="settings-icon-box"><ShieldAlert size={18}/></div>
                 <div className="settings-text">
                   <div className="settings-label">Avvisi Malattie</div>
                   <div className="settings-sub">Notifiche per epidemie stagionali</div>
                 </div>
                 <div className={`toggle-switch ${alertsEnabled ? 'active' : ''}`}></div>
               </div>
            </div>

            <div className="settings-section-title">Altro</div>
            <div className="settings-card">
               <div className="settings-row" onClick={() => setHapticEnabled(!hapticEnabled)}>
                 <div className="settings-icon-box"><Zap size={18}/></div>
                 <div className="settings-text">
                   <div className="settings-label">Vibrazione</div>
                   <div className="settings-sub">Feedback tattile alle azioni</div>
                 </div>
                 <div className={`toggle-switch ${hapticEnabled ? 'active' : ''}`}></div>
               </div>
               <div className="settings-row" onClick={() => setCloudSync(!cloudSync)}>
                 <div className="settings-icon-box"><RefreshCw size={18}/></div>
                 <div className="settings-text">
                   <div className="settings-label">Sincronizzazione Cloud</div>
                   <div className="settings-sub">Salva i dati su tutti i dispositivi</div>
                 </div>
                 <div className={`toggle-switch ${cloudSync ? 'active' : ''}`}></div>
               </div>
               <div className="settings-row">
                 <div className="settings-icon-box"><Sliders size={18}/></div>
                 <div className="settings-text">
                   <div className="settings-label">Preferenze Avanzate</div>
                   <div className="settings-sub">Dettagli analisi e privacy</div>
                 </div>
                 <ChevronRight size={16} opacity={0.4}/>
               </div>
            </div>

            <button className="btn-reset" onClick={resetAll}><Trash2 size={18}/> Resetta Tutti i Dati</button>
            <div style={{textAlign:'center', marginTop:24, opacity:0.4, fontSize:'0.75rem', paddingBottom: 20}}>BioExpert AI v1.8.0 - Professional Care</div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
