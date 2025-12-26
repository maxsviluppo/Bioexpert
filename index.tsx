
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { Camera, Send, Sprout, Info, RefreshCw, MessageSquare, Droplets, AlertTriangle, CheckCircle2, Settings, Moon, Bell, Mountain, Sparkles, History, Share2, Trash2, Zap, ChevronLeft, Key, ExternalLink, Trophy, Target, Gamepad2, Upload, User, ShieldAlert, Clock, Leaf, Apple, Layers, Maximize2, Terminal, ChevronRight, Star, Award, Sun, CameraOff, HelpCircle, ShieldCheck, Heart, LogOut, Mail, Code, Scissors, Inbox } from 'lucide-react';

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

  .viewfinder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    height: 260px;
    pointer-events: none;
    z-index: 105;
  }
  .viewfinder-corner {
    position: absolute;
    width: 30px;
    height: 30px;
    border: 3px solid white;
    opacity: 0.6;
  }
  .tl { top: 0; left: 0; border-right: 0; border-bottom: 0; border-top-left-radius: 20px; }
  .tr { top: 0; right: 0; border-left: 0; border-bottom: 0; border-top-right-radius: 20px; }
  .bl { bottom: 0; left: 0; border-right: 0; border-top: 0; border-bottom-left-radius: 20px; }
  .br { bottom: 0; right: 0; border-left: 0; border-top: 0; border-bottom-right-radius: 20px; }

  .logo-center-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.3;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 104;
    text-align: center;
  }

  .logo-center-overlay h2 {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }

  .camera-off-overlay {
    height: 100%;
    width: 100%;
    background: var(--primary-light);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .logo-off-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--primary);
    opacity: 0.2;
    transform: scale(1.2);
  }

  .logo-off-center h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.4em;
    text-transform: uppercase;
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

  .msg-user { align-self: flex-end; background: var(--primary); color: white; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2); }
  .msg-bot { align-self: flex-start; background: var(--white); color: var(--dark); border-bottom-left-radius: 4px; border: 1px solid var(--card-border); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

  .quick-replies-container {
    display: flex;
    gap: 8px;
    padding: 8px 16px 12px;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .quick-replies-container::-webkit-scrollbar { display: none; }

  .quick-reply-chip {
    background: var(--primary-light);
    color: var(--primary);
    padding: 8px 16px;
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid var(--accent);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .quick-reply-chip:active { transform: scale(0.95); background: var(--accent); }

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
    font-family: inherit;
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

  .settings-section { margin-bottom: 28px; }
  .settings-section-title {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    margin: 0 0 10px 14px;
    letter-spacing: 0.08em;
  }
  .settings-group {
    background: var(--white);
    border-radius: 28px;
    border: 1px solid var(--card-border);
    overflow: hidden;
  }
  .settings-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid var(--card-border);
  }
  .settings-row:last-child { border-bottom: none; }
  .settings-row:active { background: var(--primary-light); }
  
  .settings-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: var(--primary-light);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
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

  .profile-card {
    padding: 24px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border-radius: 32px;
    color: white;
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 30px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  .profile-avatar {
    width: 64px;
    height: 64px;
    border-radius: 22px;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .quest-card {
    background: var(--white);
    border-radius: 24px;
    padding: 18px;
    border: 1px solid var(--card-border);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .quest-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: var(--primary-light);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .devtools-card {
    background: var(--white);
    padding: 20px;
    border-radius: 24px;
    border: 1px solid var(--card-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .btn-contact {
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px;
    border-radius: 100px;
    font-weight: 800;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-decoration: none;
    transition: transform 0.2s;
  }
  .btn-contact:active { transform: scale(0.95); }

  .care-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 16px;
  }
  
  .care-item {
    background: var(--primary-light);
    padding: 14px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .care-item-title {
    font-weight: 800;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--primary-dark);
  }
  
  .care-item-desc {
    font-size: 0.75rem;
    line-height: 1.4;
    opacity: 0.8;
  }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
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
}

const QUESTS = [
  { id: 'mushroom', title: 'Cacciatore di Funghi', icon: <Mountain size={24}/>, xp: 120, requirement: 'Fungo', desc: 'Trova e analizza un fungo.' },
  { id: 'succulent', title: 'Giungla Arida', icon: <Sprout size={24}/>, xp: 50, requirement: 'Succulenta', desc: 'Analizza una pianta grassa.' },
  { id: 'aromatic', title: 'Chef Botanico', icon: <Leaf size={24}/>, xp: 45, requirement: 'Erba Aromatica', desc: 'Analizza un\'erba aromatica.' },
  { id: 'flower', title: 'Amante dei Fiori', icon: <Target size={24}/>, xp: 60, requirement: 'Fiore', desc: 'Identifica 3 fiori diversi.' }
];

function App() {
  const [activeMode, setActiveMode] = useState<'scan' | 'chat'>('scan');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [fullScreenAnalysis, setFullScreenAnalysis] = useState<PlantAnalysis | null>(null);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [chatInput, setChatInput] = useState('');
  
  const [messages, setMessages] = useState<{role: 'user' | 'bot' | 'analysis', text?: string, data?: PlantAnalysis}[]>(() => 
    JSON.parse(localStorage.getItem('bio_messages') || '[]')
  );
  const [history, setHistory] = useState<PlantAnalysis[]>(() => 
    JSON.parse(localStorage.getItem('bio_history') || '[]')
  );
  const [stats, setStats] = useState<UserStats>(() => 
    JSON.parse(localStorage.getItem('bio_stats') || '{"xp":0,"level":1,"totalScans":0,"completedQuests":[]}')
  );
  
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

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    async function startCamera() {
      const shouldBeOn = activeMode === 'scan' && !capturedImg && isCameraOn && !isSettingsOpen && !isGamesOpen && !isHistoryOpen && !fullScreenAnalysis;
      if (shouldBeOn) {
        try {
          setCameraError(null);
          currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
            audio: false 
          });
          streamRef.current = currentStream;
          if (videoRef.current) {
            videoRef.current.srcObject = currentStream;
            videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(console.error);
          }
        } catch (err: any) {
          console.error(err);
          setCameraError("Camera non accessibile.");
        }
      } else {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      }
    }
    startCamera();
    return () => { if (currentStream) currentStream.getTracks().forEach(t => t.stop()); };
  }, [activeMode, capturedImg, isCameraOn, isSettingsOpen, isGamesOpen, isHistoryOpen, fullScreenAnalysis]);

  const addXp = (amount: number) => {
    setStats(prev => {
      let nxp = prev.xp + amount;
      let nl = prev.level;
      while (nxp >= nl * 100) { nxp -= nl * 100; nl += 1; }
      return { ...prev, xp: nxp, level: nl };
    });
  };

  const toggleCamera = () => {
    if (activeMode !== 'scan') {
      setActiveMode('scan');
      setIsCameraOn(true);
    } else {
      setIsCameraOn(!isCameraOn);
    }
    setCapturedImg(null);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const c = canvasRef.current;
    const v = videoRef.current;
    const size = Math.min(v.videoWidth, v.videoHeight);
    const startX = (v.videoWidth - size) / 2;
    const startY = (v.videoHeight - size) / 2;
    c.width = 1024; c.height = 1024;
    c.getContext('2d')?.drawImage(v, startX, startY, size, size, 0, 0, 1024, 1024);
    setCapturedImg(c.toDataURL('image/jpeg'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImg(ev.target?.result as string);
      setActiveMode('scan');
      setIsCameraOn(false);
    };
    reader.readAsDataURL(file);
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
            { text: "Identifica questa pianta/fungo/frutto. Restituisci JSON: Nome comune, Scientifico, Salute (healthy/sick), Diagnosi completa (inclusi sintomi se malata), Cura specifica (general, watering, pruning, repotting). Lingua: Italiano." }
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
      addXp(30);
      setCapturedImg(null);
      setActiveMode('chat');
    } catch (e) { alert("Errore analisi."); }
    finally { setIsAnalyzing(false); }
  };

  const sendMessage = async (txt?: string) => {
    const input = txt || chatInput;
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const lastAnalysis = [...messages].reverse().find(m => m.role === 'analysis')?.data;
      const context = lastAnalysis ? `L'utente ha analizzato un ${lastAnalysis.name}. Rispondi in base a questa pianta se pertinente, fornendo diagnosi o cure se richiesto.` : "";
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: context + input,
        config: { systemInstruction: "Sei BioExpert AI. Rispondi brevemente e professionalmente in Italiano. Usa un tono amichevole ma esperto. Se la pianta è malata, sii molto specifico sulla cura." }
      });
      setMessages(prev => [...prev, { role: 'bot', text: res.text || "Errore risposta." }]);
      addXp(5);
    } catch (e) { setMessages(prev => [...prev, { role: 'bot', text: "Errore connessione." }]); }
    finally { setIsChatLoading(false); }
  };

  const lastPlantName = useMemo(() => {
    const last = [...messages].reverse().find(m => m.role === 'analysis');
    return last?.data?.name;
  }, [messages]);

  const quickReplies = useMemo(() => {
    if (!lastPlantName) return ["Consigli cura generali", "Piante facili", "Perché le foglie ingialliscono?"];
    return [
      `Cura ${lastPlantName}`,
      `È velenosa?`,
      `Rinvaso ${lastPlantName}`,
      `Luce per ${lastPlantName}`,
      `Malattie comuni`
    ];
  }, [lastPlantName]);

  return (
    <div className="app-shell">
      <style>{styles}</style>
      
      {achievementToast && <div className="achievement-toast"><Trophy size={18}/> {achievementToast}</div>}

      <header>
        <div className="logo" onClick={() => { setActiveMode('scan'); setIsCameraOn(true); }} style={{cursor:'pointer'}}>
          <Sprout size={24} color="var(--primary)" />
          <div>
            <h1>BioExpert</h1>
            <div style={{height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden', marginTop: 2, width: 60}}>
              <div style={{height: '100%', background: 'var(--primary)', width: `${(stats.xp / (stats.level * 100)) * 100}%`}}></div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className="badge-xp-large">LV.{stats.level}</div>
          <button className="btn-header-icon" onClick={() => setIsHistoryOpen(true)} aria-label="Erbario"><History size={20}/></button>
          <button className="btn-header-icon" onClick={() => setIsGamesOpen(true)} aria-label="Sfide"><Gamepad2 size={20}/></button>
          <button className="btn-header-icon" onClick={() => setIsSettingsOpen(true)} aria-label="Impostazioni"><Settings size={20}/></button>
        </div>
      </header>

      <div className="main-frame">
        <div className="frame-inner">
          {activeMode === 'scan' ? (
            <div style={{height: '100%', width: '100%', position: 'relative'}}>
              {cameraError ? (
                <div className="camera-error-view" style={{textAlign:'center', color:'white', padding:40}}><ShieldAlert size={64} color="var(--danger)" /><h3>Errore Camera</h3></div>
              ) : capturedImg ? (
                <div className="preview-container">
                  <img src={capturedImg} className="preview-image" />
                  {!isAnalyzing && <button className="btn-analyze-toast" onClick={performAnalysis}><Sparkles size={24}/> ANALIZZA ORA</button>}
                  {isAnalyzing && <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'white', background: 'rgba(0,0,0,0.7)'}}><RefreshCw className="spin" size={40} /></div>}
                </div>
              ) : isCameraOn ? (
                <>
                  <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                  <div className="logo-center-overlay">
                    <Sprout size={56} />
                    <h2>BIOEXPERT</h2>
                  </div>
                  <div className="viewfinder">
                    <div className="viewfinder-corner tl"></div>
                    <div className="viewfinder-corner tr"></div>
                    <div className="viewfinder-corner bl"></div>
                    <div className="viewfinder-corner br"></div>
                  </div>
                  <div className="shutter-layer">
                    <button className="shutter-btn" onClick={capture}><div className="shutter-inner"></div></button>
                  </div>
                </>
              ) : (
                <div className="camera-off-overlay">
                  <div className="logo-off-center">
                    <Sprout size={64} />
                    <h2>BIOEXPERT</h2>
                  </div>
                  <h3 style={{marginTop:24, color:'var(--primary)', fontWeight:800}}>Fotocamera Spenta</h3>
                  <button onClick={() => setIsCameraOn(true)} style={{background:'var(--primary)', color:'white', border:'none', padding:'12px 24px', borderRadius:100, fontWeight:800, marginTop:16, cursor:'pointer'}}>ATTIVA ORA</button>
                </div>
              )}
            </div>
          ) : (
            <div className="frame-chat-area" ref={scrollRef}>
              {messages.length === 0 && <div style={{textAlign:'center', padding:'60px 20px', opacity:0.3}}><MessageSquare size={48} style={{margin:'0 auto 16px'}}/><p>Analizza una pianta o fai una domanda per iniziare.</p></div>}
              {messages.map((m, i) => (
                m.role === 'analysis' ? (
                  <div key={i} style={{background: 'var(--white)', borderRadius: 24, border: '1px solid var(--card-border)', padding: 16, marginBottom: 8}}>
                    <div style={{display:'flex', gap: 12, marginBottom: 12}}>
                      <div style={{flex:1}}><h4 style={{margin:0}}>{m.data?.name}</h4><span style={{fontSize:'0.7rem', opacity:0.5}}>{m.data?.scientificName}</span></div>
                      <img src={m.data?.image} style={{width:60, height:60, borderRadius:12, objectFit:'cover'}} />
                    </div>
                    <div className={`status-badge ${m.data?.healthStatus === 'healthy' ? 'status-healthy' : 'status-sick'}`}>{m.data?.healthStatus === 'healthy' ? 'SANA' : 'PROBLEMATICA'}</div>
                    <p style={{fontSize:'0.85rem', margin:'8px 0'}}>{m.data?.diagnosis}</p>
                    <button className="quick-reply-chip" style={{width:'100%', justifyContent:'center', border:'1px solid var(--primary)'}} onClick={() => setFullScreenAnalysis(m.data!)}><Maximize2 size={14}/> VEDI DETTAGLI E CURA</button>
                  </div>
                ) : (
                  <div key={i} className={`msg msg-${m.role}`}>{m.text}</div>
                )
              ))}
              {isChatLoading && <div className="msg msg-bot" style={{opacity:0.5}}><RefreshCw size={14} className="spin"/> Sto pensando...</div>}
            </div>
          )}
        </div>
        
        {activeMode === 'chat' && (
          <>
            <div className="quick-replies-container">
              {quickReplies.map((q, idx) => (
                <button key={idx} className="quick-reply-chip" onClick={() => sendMessage(q)}>
                  <HelpCircle size={14}/> {q}
                </button>
              ))}
            </div>
            <div className="chat-input-row">
              <input className="input-field" placeholder="Chiedi a BioExpert..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <button className="btn-header-icon" style={{background:'var(--primary)', color:'white', width:44, height:44}} onClick={() => sendMessage()}><Send size={18}/></button>
            </div>
          </>
        )}
      </div>

      <div className="action-dashboard">
        <button className="btn-3d scatta" onClick={toggleCamera}>{isCameraOn ? <CameraOff size={26}/> : <Camera size={26}/>}<span>{isCameraOn ? 'OFF' : 'CAM'}</span></button>
        <button className="btn-3d secondary" onClick={() => fileInputRef.current?.click()}><Upload size={26} color="var(--primary)"/><span>CARICA</span></button>
        <button className="btn-3d secondary" onClick={() => setActiveMode('chat')}><MessageSquare size={26} color="var(--primary)"/><span>CHAT AI</span></button>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />

      {isHistoryOpen && (
        <div className="side-overlay">
          <header><button className="btn-header-icon" onClick={() => setIsHistoryOpen(false)}><ChevronLeft size={24}/></button><h3>Il Tuo Erbario</h3></header>
          <div className="overlay-content">
             {history.length === 0 ? <p style={{opacity:0.5, textAlign:'center', marginTop:40}}>Ancora nessuna pianta salvata.</p> : history.map(h => (
               <div key={h.id} style={{padding:14, background:'var(--white)', borderRadius:24, marginBottom:12, display:'flex', alignItems:'center', gap:14, border:'1px solid var(--card-border)', boxShadow:'0 4px 10px rgba(0,0,0,0.02)'}} onClick={() => setFullScreenAnalysis(h)}>
                 <img src={h.image} style={{width:54, height:54, borderRadius:14, objectFit:'cover'}} />
                 <div style={{flex:1}}><div style={{fontWeight:800}}>{h.name}</div><div style={{fontSize:'0.7rem', opacity:0.5}}>{new Date(h.timestamp).toLocaleDateString()}</div></div>
                 <ChevronRight size={18} opacity={0.3}/>
               </div>
             ))}
          </div>
        </div>
      )}

      {isGamesOpen && (
        <div className="side-overlay">
          <header><button className="btn-header-icon" onClick={() => setIsGamesOpen(false)}><ChevronLeft size={24}/></button><h3>Sfide Botaniche</h3></header>
          <div className="overlay-content">
            <div style={{padding:'10px 10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div><div style={{fontSize:'2.4rem', fontWeight:800}}>{stats.completedQuests.length}</div> <div style={{fontSize:'0.85rem', opacity:0.6}}>Sfide Completate</div></div>
              <div style={{textAlign:'right'}}><Award size={48} color="#FFD700" /><div style={{fontSize:'0.8rem', fontWeight:800, color:'var(--primary)'}}>MAESTRO GIARDINIERE</div></div>
            </div>
            {QUESTS.map(q => {
               const done = stats.completedQuests.includes(q.id);
               return (
                 <div key={q.id} className="quest-card" style={{opacity: done ? 0.6 : 1, border: done ? '2px solid var(--primary)' : '1px solid var(--card-border)'}}>
                    <div className="quest-icon" style={{background: done ? 'var(--primary-light)' : ''}}>{done ? <CheckCircle2 size={24} color="var(--primary)"/> : q.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800}}>{q.title}</div>
                      <div style={{fontSize:'0.75rem', opacity:0.6}}>{q.desc}</div>
                    </div>
                    <div style={{fontWeight:800, color: done ? 'var(--primary)' : 'var(--text-muted)'}}>+{q.xp} XP</div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="side-overlay">
          <header><button className="btn-header-icon" onClick={() => setIsSettingsOpen(false)}><ChevronLeft size={24}/></button><h3>Impostazioni</h3></header>
          <div className="overlay-content">
            <div className="profile-card">
              <div className="profile-avatar"><User size={32} /></div>
              <div>
                <div style={{fontWeight:800, fontSize:'1.2rem'}}>Bio Esploratore</div>
                <div style={{fontSize:'0.85rem', opacity:0.9}}>Livello {stats.level} • {history.length} Piante Trovate</div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">DevTools</div>
              <div className="devtools-card">
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div className="settings-icon-box" style={{background:'var(--primary-dark)', color:'white'}}><Code size={18}/></div>
                  <div style={{fontWeight:800, fontSize:'0.9rem'}}>BY CASTRO MASSIMO</div>
                </div>
                <p style={{fontSize:'0.85rem', lineHeight:1.5, margin:0, opacity:0.8}}>
                  Questa App è realizzata da <b>DevTools by Castro Massimo</b>. Se hai bisogno di supporto, segnalazioni o di WebApp personalizzate contattaci.
                </p>
                <a href="mailto:castromassimo@gmail.com" className="btn-contact">
                  <Mail size={18}/> CONTATTACI VIA E-MAIL
                </a>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Preferenze App</div>
              <div className="settings-group">
                <div className="settings-row" onClick={() => setDarkMode(!darkMode)}>
                  <div className="settings-icon-box"><Moon size={18}/></div>
                  <span style={{flex:1, fontWeight:600}}>Modalità Scura</span>
                  <div className={`toggle-switch ${darkMode ? 'active' : ''}`}></div>
                </div>
                <div className="settings-row">
                  <div className="settings-icon-box"><Bell size={18}/></div>
                  <span style={{flex:1, fontWeight:600}}>Notifiche Cura</span>
                  <div className="toggle-switch active"></div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Sicurezza & Dati</div>
              <div className="settings-group">
                <div className="settings-row" onClick={() => window.aistudio.openSelectKey()}>
                  <div className="settings-icon-box"><Key size={18}/></div>
                  <span style={{flex:1, fontWeight:600}}>Configura API Key</span>
                  <ExternalLink size={16} opacity={0.3}/>
                </div>
                <div className="settings-row">
                  <div className="settings-icon-box"><ShieldCheck size={18}/></div>
                  <span style={{flex:1, fontWeight:600}}>Privacy e Sicurezza</span>
                  <ChevronRight size={16} opacity={0.3}/>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Sistema</div>
              <div className="settings-group">
                <div className="settings-row" style={{color: 'var(--danger)'}} onClick={() => { if(confirm("Cancellare tutti i dati?")) {localStorage.clear(); window.location.reload();} }}>
                  <div className="settings-icon-box" style={{background:'#FFF0F0', color:'var(--danger)'}}><Trash2 size={18}/></div>
                  <span style={{flex:1, fontWeight:600}}>Resetta Applicazione</span>
                </div>
                <div className="settings-row" onClick={() => alert("BioExpert v1.2.0")}>
                  <div className="settings-icon-box"><Info size={18}/></div>
                  <span style={{flex:1, fontWeight:600}}>Versione App</span>
                  <span style={{fontSize:'0.8rem', opacity:0.4}}>1.2.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {fullScreenAnalysis && (
        <div className="side-overlay">
          <header><button className="btn-header-icon" onClick={() => setFullScreenAnalysis(null)}><ChevronLeft size={24}/></button><h3>Dettagli & Cura</h3></header>
          <div className="overlay-content">
            <img src={fullScreenAnalysis.image} style={{width:'100%', borderRadius:32, marginBottom:24, boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div>
                <h2 style={{margin:0, fontSize:'1.8rem'}}>{fullScreenAnalysis.name}</h2>
                <p style={{opacity:0.6, fontStyle:'italic', marginTop:4}}>{fullScreenAnalysis.scientificName}</p>
              </div>
              <div className={`status-badge ${fullScreenAnalysis.healthStatus === 'healthy' ? 'status-healthy' : 'status-sick'}`}>
                {fullScreenAnalysis.healthStatus === 'healthy' ? 'Sana' : 'Malata'}
              </div>
            </div>
            
            <div style={{padding:20, background:'var(--white)', borderRadius:28, border:'1px solid var(--card-border)', marginTop:24}}>
               <h4 style={{margin:'0 0 12px 0', display:'flex', alignItems:'center', gap:8}}><ShieldCheck size={18} color="var(--primary)"/> Diagnosi {fullScreenAnalysis.healthStatus === 'sick' ? 'e Problemi' : ''}</h4>
               <p style={{fontSize:'0.95rem', lineHeight:1.6}}>{fullScreenAnalysis.diagnosis}</p>
               
               <h4 style={{margin:'24px 0 12px 0', display:'flex', alignItems:'center', gap:8}}><Heart size={18} color="var(--danger)"/> Guida alla Cura</h4>
               <div className="care-grid">
                  <div className="care-item">
                    <div className="care-item-title"><Droplets size={16}/> Irrigazione</div>
                    <div className="care-item-desc">{fullScreenAnalysis.care.watering}</div>
                  </div>
                  <div className="care-item">
                    <div className="care-item-title"><Sun size={16}/> Esposizione</div>
                    <div className="care-item-desc">{fullScreenAnalysis.care.general}</div>
                  </div>
                  <div className="care-item">
                    <div className="care-item-title"><Scissors size={16}/> Potatura</div>
                    <div className="care-item-desc">{fullScreenAnalysis.care.pruning}</div>
                  </div>
                  <div className="care-item">
                    <div className="care-item-title"><Inbox size={16}/> Rinvaso</div>
                    <div className="care-item-desc">{fullScreenAnalysis.care.repotting}</div>
                  </div>
               </div>
            </div>
            
            <button className="btn-game-action" style={{marginTop:24, background:'var(--primary)', color:'white', width:'100%', padding:18, borderRadius:20, border:'none', fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10}} onClick={() => { setFullScreenAnalysis(null); setActiveMode('chat'); sendMessage(`Qual è la cura migliore per questa ${fullScreenAnalysis.name}?`); }}>
              <MessageSquare size={20}/> PARLA CON BIOEXPERT
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
