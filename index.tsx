
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { Camera, Send, Sprout, Info, RefreshCw, MessageSquare, Droplets, AlertTriangle, CheckCircle2, Settings, Moon, Bell, Mountain, Sparkles, History, Share2, Trash2, Zap, ChevronLeft, Key, ExternalLink, Trophy, Target, Gamepad2, Upload, User, ShieldAlert, Clock, Leaf, Apple, Layers, Maximize2, Terminal, ChevronRight, Star, Award, Sun, CameraOff, HelpCircle, ShieldCheck, Heart, LogOut, Mail, Code, Scissors, Inbox, Download, X, Home } from 'lucide-react';
import { saveBeautyScore, getLeaderboard, base64ToFile, signInWithEmail, signUpWithEmail, signOut, getCurrentUser, supabase } from './supabaseClient';
import { AuthModal } from './AuthModal';


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
    height: 100dvh; /* Dynamic Viewport Height per gestire le barre browser */
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
    max-height: 58vh; /* Riduzione significativa per dare spazio ai tasti inferiori su browser */
    background: var(--white);
    border-radius: 40px;
    padding: 8px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.06);
    border: 1px solid var(--card-border);
    margin: 0 auto;
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
    color: var(--primary-dark);
    opacity: 0.8;
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
    padding: 0 16px;
    padding-bottom: 43px; /* Alzato di 35px come richiesto (era 8px) */
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

  .install-hint {
    position: fixed;
    top: 140px; /* Alza la notifica, quasi a mezza altezza ma più in alto */
    left: 20px;
    right: 20px;
    background: var(--primary-dark); /* Verde scuro come richiesto */
    color: var(--white);
    padding: 20px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    z-index: 200;
    animation: slideDownFade 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(255,255,255,0.1);
  }
  @keyframes slideDownFade { from { transform: translateY(-40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
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
  category: string;
}

interface UserStats {
  xp: number;
  level: number;
  totalScans: number;
  completedQuests: string[];
  username?: string;
}

const QUESTS = [
  { id: 'mushroom', type: 'photo', title: 'Cacciatore di Funghi', icon: <Mountain size={24} />, xp: 120, requirement: 'Fungo', desc: 'Trova e fotografa un fungo, poi rispondi alle domande.' },
  { id: 'succulent', type: 'photo', title: 'Giungla Arida', icon: <Sprout size={24} />, xp: 50, requirement: 'Succulenta', desc: 'Fotografa una pianta grassa e supera il quiz.' },
  { id: 'aromatic', type: 'photo', title: 'Chef Botanico', icon: <Leaf size={24} />, xp: 45, requirement: 'Erba Aromatica', desc: 'Trova un\'erba aromatica e rispondi correttamente.' },
  { id: 'flowers', type: 'photo', title: 'Amante dei Fiori', icon: <Target size={24} />, xp: 60, requirement: 'Fiore', desc: 'Fotografa 3 fiori diversi e completa i quiz.', count: 3 },
  { id: 'tree', type: 'photo', title: 'Guardiano della Foresta', icon: <Layers size={24} />, xp: 80, requirement: 'Albero', desc: 'Identifica un albero e dimostra la tua conoscenza.' },
  { id: 'fruit', type: 'photo', title: 'Raccoglitore di Frutti', icon: <Apple size={24} />, xp: 55, requirement: 'Frutto', desc: 'Fotografa un frutto e rispondi alle domande.' },
  { id: 'vegetable', type: 'photo', title: 'Orto Perfetto', icon: <Leaf size={24} />, xp: 50, requirement: 'Ortaggio', desc: 'Trova un ortaggio e supera il test.' },
  { id: 'aquatic', type: 'photo', title: 'Esploratore Acquatico', icon: <Droplets size={24} />, xp: 70, requirement: 'Pianta Acquatica', desc: 'Scopri una pianta acquatica.' },
  { id: 'exotic', type: 'photo', title: 'Cacciatore Esotico', icon: <Sparkles size={24} />, xp: 100, requirement: 'Pianta Esotica', desc: 'Trova una pianta esotica rara.' },
  { id: 'beauty_contest', type: 'beauty', title: 'Concorso di Bellezza', icon: <Star size={24} />, xp: 150, desc: 'Fotografa il fiore/pianta più bello e ottieni il voto dell\'AI. Competi con altri utenti!' },
  { id: 'general_quiz', type: 'quiz', title: 'Maestro Botanico 1° Livello', icon: <HelpCircle size={24} />, xp: 40, desc: 'Rispondi al quiz generale sulla botanica.' }
];

const BIO_TIPS = [
  "Le piante 'parlano' tra loro attraverso segnali chimici nelle radici.",
  "Il bambù può crescere fino a 91 cm in un solo giorno!",
  "Esistono oltre 390.000 specie di piante conosciute al mondo.",
  "La mimosa pudica chiude le foglie se viene toccata per difendersi.",
  "Le foreste ospitano oltre l'80% della biodiversità terrestre.",
  "Alcune orchidee ingannano le api imitando l'aspetto delle femmine.",
  "Il profumo dell'erba tagliata è un segnale di stress della pianta.",
  "Le fragole sono l'unico frutto con i semi all'esterno.",
  "Un singolo albero può produrre ossigeno per 4 persone al giorno."
];

const QUIZ_QUESTIONS = [
  { q: 'Quale gas producono le piante durante la fotosintesi?', answers: ['Ossigeno', 'Azoto', 'Anidride Carbonica', 'Idrogeno'], correct: 0 },
  { q: 'Qual è la parte della pianta che assorbe acqua?', answers: ['Foglie', 'Radici', 'Fiori', 'Fusto'], correct: 1 },
  { q: 'Come si chiama il processo con cui le piante producono cibo?', answers: ['Respirazione', 'Fotosintesi', 'Digestione', 'Fermentazione'], correct: 1 },
  { q: 'Quale di queste è una pianta carnivora?', answers: ['Rosa', 'Dionaea', 'Tulipano', 'Margherita'], correct: 1 },
  { q: 'Quanti petali ha tipicamente un fiore di rosa?', answers: ['3', '5', '7', '10'], correct: 1 },
  { q: 'Qual è la pianta più alta del mondo?', answers: ['Baobab', 'Sequoia', 'Pino', 'Quercia'], correct: 1 },
  { q: 'Le cactus sono originarie di quale continente?', answers: ['Africa', 'Asia', 'America', 'Europa'], correct: 2 },
  { q: 'Quale parte del fiore diventa il frutto?', answers: ['Petalo', 'Stame', 'Ovario', 'Sepalo'], correct: 2 }
];


function App() {
  const [activeMode, setActiveMode] = useState<'scan' | 'chat'>('scan');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [currentTip, setCurrentTip] = useState(() => BIO_TIPS[Math.floor(Math.random() * BIO_TIPS.length)]);
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
  const [showInstallHint, setShowInstallHint] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null); // Per salvare l'evento di installazione
  const [chatInput, setChatInput] = useState('');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questPhoto, setQuestPhoto] = useState<string | null>(null);
  const [questQuestions, setQuestQuestions] = useState<any[]>([]);
  const [questProgress, setQuestProgress] = useState<{ [key: string]: number }>({});
  const [showQuestIntro, setShowQuestIntro] = useState(false);
  const [beautyScore, setBeautyScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ score: number, timestamp: number }[]>(() =>
    JSON.parse(localStorage.getItem('beauty_leaderboard') || '[]')
  );
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBeautyConfirm, setShowBeautyConfirm] = useState(false);


  useEffect(() => {
    // Timer per nascondere
    const timer = setTimeout(() => setShowInstallHint(false), 20000);

    // Ascolta l'evento PWA
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallHint(true); // Mostra se disponibile
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallHint(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback per iOS o PC senza supporto diretto (solo istruzioni visive)
      alert("Su iPhone: tocca 'Condividi' e poi 'Aggiungi alla schermata Home'.");
      setShowInstallHint(false);
    }
  };

  const [messages, setMessages] = useState<{ role: 'user' | 'bot' | 'analysis', text?: string, data?: PlantAnalysis }[]>(() =>
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
    localStorage.setItem('beauty_leaderboard', JSON.stringify(leaderboard));
  }, [history, stats, messages, leaderboard]);

  // Auth listener
  useEffect(() => {
    // Check current user
    getCurrentUser().then(result => {
      if (result.success && result.user) {
        setUser(result.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);


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

  const checkQuests = (analysis: PlantAnalysis) => {
    const newCompleted: string[] = [];
    let xpGained = 0;

    QUESTS.forEach(q => {
      if (!stats.completedQuests.includes(q.id)) {
        // Logica semplice di matching: se la categoria analizzata contiene la parola chiave del requisito
        if (q.type === 'photo' && analysis.category && analysis.category.toLowerCase().includes(q.requirement.toLowerCase())) {
          newCompleted.push(q.id);
          xpGained += q.xp;
          setAchievementToast(`Missione Compiuta: ${q.title}!`);
          setTimeout(() => setAchievementToast(null), 4000);
        }
      }
    });

    if (newCompleted.length > 0) {
      setStats(prev => {
        let nxp = prev.xp + xpGained;
        let nl = prev.level;
        while (nxp >= nl * 100) { nxp -= nl * 100; nl += 1; }
        return {
          ...prev,
          xp: nxp,
          level: nl,
          completedQuests: [...prev.completedQuests, ...newCompleted]
        };
      });
    }
  };

  const startGame = (questId: string) => {
    // Blocca se non loggato
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const quest = QUESTS.find(q => q.id === questId);
    if (!quest) return;
    setActiveGame(questId);
    setShowQuestIntro(true);
  };

  const startQuestAfterIntro = () => {
    const quest = QUESTS.find(q => q.id === activeGame);
    if (!quest) return;
    setShowQuestIntro(false);

    if (quest.type === 'quiz') {
      // Quiz generale - usa domande predefinite
      setCurrentQuestion(0);
      setGameScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
    } else if (quest.type === 'beauty') {
      setQuestPhoto(null);
      setBeautyScore(null);
      setIsGamesOpen(false);
      setActiveMode('scan');
      setIsCameraOn(true);
    } else {
      // Sfida fotografica - apri camera
      setQuestPhoto(null);
      setQuestQuestions([]);
      setCurrentQuestion(0);
      setGameScore(0);
      setIsGamesOpen(false);
      setActiveMode('scan');
      setIsCameraOn(true);
    }
  };

  const handleQuestPhotoCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !activeGame) return;
    const c = canvasRef.current;
    const v = videoRef.current;
    const size = Math.min(v.videoWidth, v.videoHeight);
    const startX = (v.videoWidth - size) / 2;
    const startY = (v.videoHeight - size) / 2;
    c.width = 1024; c.height = 1024;
    c.getContext('2d')?.drawImage(v, startX, startY, size, size, 0, 0, 1024, 1024);
    const photo = c.toDataURL('image/jpeg');
    setQuestPhoto(photo);
    setIsCameraOn(false);

    const quest = QUESTS.find(q => q.id === activeGame);
    if (quest?.type === 'beauty') {
      await evaluateBeauty(photo);
    } else {
      // Genera domande con AI
      await generateQuestQuestions(photo);
    }
  };

  const evaluateBeauty = async (photo: string) => {
    try {
      console.log('🎨 Inizio valutazione bellezza...');

      // 1. Valuta con AI
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: photo.split(',')[1], mimeType: 'image/jpeg' } },
            { text: 'Valuta la bellezza estetica di questa pianta/fiore da 1 a 100. Considera: colori, simmetria, salute, composizione fotografica. Restituisci solo il numero.' }
          ]
        }
      });
      const score = parseInt(res.text?.trim() || '50');
      console.log('📊 Punteggio AI:', score);

      setBeautyScore(score);
      // NON salvare ancora, apri solo overlay di conferma
      setIsGamesOpen(true);
      setShowBeautyConfirm(true);
    } catch (e) {
      console.error('❌ Errore valutazione generale:', e);
      alert(`Errore valutazione: ${e}`);
      setActiveGame(null);
    }
  };

  const publishBeautyResult = async () => {
    if (!beautyScore || !questPhoto) return;

    try {
      setShowBeautyConfirm(false); // Chiudi conferma
      addXp(beautyScore);

      // 2. Salva su Supabase
      const username = user?.user_metadata?.display_name || user?.email?.split('@')[0] || stats.username || `Utente${Math.floor(Math.random() * 10000)}`;
      const imageFile = base64ToFile(questPhoto, `beauty-${Date.now()}.jpg`);

      console.log('💾 Tentativo salvataggio su Supabase...', { username, score: beautyScore });
      const result = await saveBeautyScore(username, beautyScore, imageFile);

      if (result.success) {
        console.log('✅ Punteggio salvato su Supabase!', result.data);
        // 3. Aggiorna classifica globale
        const leaderboardResult = await getLeaderboard('all', 100);
        if (leaderboardResult.success) {
          setLeaderboard(leaderboardResult.leaderboard.map(entry => ({
            score: entry.score,
            timestamp: new Date(entry.created_at).getTime()
          })));
        }
      } else {
        console.warn('⚠️ Fallback a localStorage:', result.error);
        const newEntry = { score: beautyScore, timestamp: Date.now() };
        setLeaderboard(prev => [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10));
      }
    } catch (authError) {
      console.error(authError);
      alert("Errore salvataggio punteggio");
    }
  };

  const generateQuestQuestions = async (photo: string) => {
    try {
      const quest = QUESTS.find(q => q.id === activeGame);
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: photo.split(',')[1], mimeType: 'image/jpeg' } },
            { text: `Questa è una foto di un ${quest?.requirement}. Genera 3 domande educative specifiche su questa pianta/fungo con 4 opzioni di risposta ciascuna. Restituisci JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0-3}]. Lingua: Italiano.` }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });
      const questions = JSON.parse(res.text || '[]');
      setQuestQuestions(questions.slice(0, 3));
      setIsGamesOpen(true);
    } catch (e) {
      alert('Errore generazione domande');
      setActiveGame(null);
    }
  };

  const answerQuestion = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const quest = QUESTS.find(q => q.id === activeGame);
    const questions = quest?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions;
    const isCorrect = questions[currentQuestion].correct === answerIndex;
    if (isCorrect) setGameScore(prev => prev + 1);
    setShowResult(true);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        completeGame();
      }
    }, 1500);
  };

  const completeGame = () => {
    const quest = QUESTS.find(q => q.id === activeGame);
    const questions = quest?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions;
    const requiredScore = quest?.type === 'quiz' ? 5 : 2; // Quiz generale richiede 5/8, foto quiz 2/3
    const xpEarned = gameScore * 10;
    addXp(xpEarned);

    if (activeGame && !stats.completedQuests.includes(activeGame)) {
      if (quest && gameScore >= requiredScore) {
        // Aggiorna progresso per sfide multi-foto
        if (quest.count) {
          const progress = (questProgress[activeGame] || 0) + 1;
          setQuestProgress(prev => ({ ...prev, [activeGame!]: progress }));
          if (progress >= quest.count) {
            setStats(prev => ({ ...prev, completedQuests: [...prev.completedQuests, activeGame!] }));
            setAchievementToast(`Missione Completata: ${quest.title}! +${quest.xp} XP`);
            addXp(quest.xp);
            setTimeout(() => setAchievementToast(null), 4000);
          } else {
            setAchievementToast(`Progresso: ${progress}/${quest.count} ${quest.requirement}`);
            setTimeout(() => setAchievementToast(null), 3000);
          }
        } else {
          setStats(prev => ({ ...prev, completedQuests: [...prev.completedQuests, activeGame!] }));
          setAchievementToast(`Missione Completata: ${quest.title}! +${quest.xp} XP`);
          addXp(quest.xp);
          setTimeout(() => setAchievementToast(null), 4000);
        }
      }
    }
    setTimeout(() => {
      setActiveGame(null);
      setQuestPhoto(null);
      setQuestQuestions([]);
      setIsGamesOpen(false);
    }, 2000);
  };

  const goHome = () => {
    setActiveMode('scan');
    setIsCameraOn(false);
    setCapturedImg(null);
    setFullScreenAnalysis(null);
    setIsHistoryOpen(false);
    setIsGamesOpen(false);
    setIsSettingsOpen(false);
  };

  const capture = () => {
    const quest = QUESTS.find(q => q.id === activeGame);
    if (activeGame && (quest?.type === 'photo' || quest?.type === 'beauty')) {
      handleQuestPhotoCapture();
    } else {
      if (!videoRef.current || !canvasRef.current) return;
      const c = canvasRef.current;
      const v = videoRef.current;
      const size = Math.min(v.videoWidth, v.videoHeight);
      const startX = (v.videoWidth - size) / 2;
      const startY = (v.videoHeight - size) / 2;
      c.width = 1024; c.height = 1024;
      c.getContext('2d')?.drawImage(v, startX, startY, size, size, 0, 0, 1024, 1024);
      setCapturedImg(c.toDataURL('image/jpeg'));
    }
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
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: capturedImg.split(',')[1], mimeType: 'image/jpeg' } },
            { text: "Identifica questa pianta/fungo/frutto. Restituisci JSON: Nome comune, Scientifico, Categoria (Fungo, Succulenta, Erba Aromatica, Fiore, Albero, Pianta, Altro), Salute (healthy/sick), Diagnosi completa, Cura specifica. Lingua: Italiano." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              scientificName: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Fungo', 'Succulenta', 'Erba Aromatica', 'Fiore', 'Albero', 'Pianta', 'Frutto', 'Ortaggio', 'Altro'] },
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
            required: ['name', 'scientificName', 'category', 'healthStatus', 'diagnosis', 'care']
          }
        }
      });
      const data = JSON.parse(res.text || '{}');
      const entry: PlantAnalysis = { ...data, id: crypto.randomUUID(), timestamp: Date.now(), image: capturedImg };
      setMessages(prev => [...prev, { role: 'analysis', data: entry }]);
      setHistory(prev => [entry, ...prev]);
      addXp(30);
      checkQuests(entry); // Verifica completamento missioni
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

      {achievementToast && <div className="achievement-toast"><Trophy size={18} /> {achievementToast}</div>}

      {showInstallHint && (
        <div className="install-hint">
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 16, cursor: 'pointer' }} onClick={handleInstallClick}>
            <Download size={28} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>Installa App</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.3 }}>
              {deferredPrompt ? "Clicca qui per installare BioExpert sul tuo dispositivo." : "Aggiungi alla Home per usare l'App a schermo intero."}
            </div>
            {deferredPrompt && <button onClick={handleInstallClick} style={{ marginTop: 8, background: 'white', color: 'var(--primary-dark)', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}>INSTALLA ORA</button>}
          </div>
          <button onClick={() => setShowInstallHint(false)} style={{ background: 'transparent', border: 'none', color: 'white', opacity: 0.6, padding: 8, cursor: 'pointer' }}><X size={20} /></button>
        </div>
      )}

      <header>
        <div className="logo" onClick={() => { setActiveMode('scan'); setIsCameraOn(true); }} style={{ cursor: 'pointer' }}>
          <Sprout size={24} color="var(--primary)" />
          <div>
            <h1>BioExpert</h1>
            <div style={{ height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden', marginTop: 2, width: 60 }}>
              <div style={{ height: '100%', background: 'var(--primary)', width: `${(stats.xp / (stats.level * 100)) * 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className="badge-xp-large">LV.{stats.level}</div>
          <button className="btn-header-icon" onClick={() => setIsHistoryOpen(true)} aria-label="Erbario"><History size={20} /></button>
          <button className="btn-header-icon" onClick={() => setIsGamesOpen(true)} aria-label="Sfide"><Gamepad2 size={20} /></button>
          <button className="btn-header-icon" onClick={() => setIsSettingsOpen(true)} aria-label="Impostazioni"><Settings size={20} /></button>
        </div>
      </header>

      <div className="main-frame">
        <div className="frame-inner">
          {activeMode === 'scan' ? (
            <div style={{ height: '100%', width: '100%', position: 'relative' }}>
              {cameraError ? (
                <div className="camera-error-view" style={{ textAlign: 'center', color: 'white', padding: 40 }}><ShieldAlert size={64} color="var(--danger)" /><h3>Errore Camera</h3></div>
              ) : capturedImg ? (
                <div className="preview-container">
                  <img src={capturedImg} className="preview-image" />
                  {!isAnalyzing && <button className="btn-analyze-toast" onClick={performAnalysis}><Sparkles size={24} /> ANALIZZA ORA</button>}
                  {isAnalyzing && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'rgba(0,0,0,0.7)' }}><RefreshCw className="spin" size={40} /></div>}
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

                  <div style={{ margin: '32px 24px', padding: '20px', background: 'rgba(255,255,255,0.6)', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Sparkles size={14} /> Lo Sapevi Che?
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.8, fontStyle: 'italic' }}>
                      "{currentTip}"
                    </p>
                  </div>

                  <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: 800, opacity: 0.5, fontSize: '0.9rem' }}>Fotocamera in Standby</h3>
                  <button onClick={() => setIsCameraOn(true)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 100, fontWeight: 800, marginTop: 16, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 8px 20px rgba(46, 125, 50, 0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Camera size={20} /> ATTIVA FOTOCAMERA
                  </button>
                  <button onClick={() => setCurrentTip(BIO_TIPS[Math.floor(Math.random() * BIO_TIPS.length)])} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: 20, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6 }}>
                    <RefreshCw size={12} /> Altra curiosità
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="frame-chat-area" ref={scrollRef}>
              {messages.length === 0 && <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.3 }}><MessageSquare size={48} style={{ margin: '0 auto 16px' }} /><p>Analizza una pianta o fai una domanda per iniziare.</p></div>}
              {messages.map((m, i) => (
                m.role === 'analysis' ? (
                  <div key={i} style={{ background: 'var(--white)', borderRadius: 24, border: '1px solid var(--card-border)', padding: 16, marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}><h4 style={{ margin: 0 }}>{m.data?.name}</h4><span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{m.data?.scientificName}</span></div>
                      <img src={m.data?.image} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
                    </div>
                    <div className={`status-badge ${m.data?.healthStatus === 'healthy' ? 'status-healthy' : 'status-sick'}`}>{m.data?.healthStatus === 'healthy' ? 'SANA' : 'PROBLEMATICA'}</div>
                    <p style={{ fontSize: '0.85rem', margin: '8px 0' }}>{m.data?.diagnosis}</p>
                    <button className="quick-reply-chip" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--primary)' }} onClick={() => setFullScreenAnalysis(m.data!)}><Maximize2 size={14} /> VEDI DETTAGLI E CURA</button>
                  </div>
                ) : (
                  <div key={i} className={`msg msg-${m.role}`}>{m.text}</div>
                )
              ))}
              {isChatLoading && <div className="msg msg-bot" style={{ opacity: 0.5 }}><RefreshCw size={14} className="spin" /> Sto pensando...</div>}
            </div>
          )}
        </div>

        {activeMode === 'chat' && (
          <>
            <div className="quick-replies-container">
              {quickReplies.map((q, idx) => (
                <button key={idx} className="quick-reply-chip" onClick={() => sendMessage(q)}>
                  <HelpCircle size={14} /> {q}
                </button>
              ))}
            </div>
            <div className="chat-input-row">
              <input className="input-field" placeholder="Chiedi a BioExpert..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <button className="btn-header-icon" style={{ background: 'var(--primary)', color: 'white', width: 44, height: 44 }} onClick={() => sendMessage()}><Send size={18} /></button>
            </div>
          </>
        )}
      </div>

      <div className="action-dashboard">
        <button className="btn-3d scatta" onClick={goHome}>
          {isCameraOn ? <CameraOff size={26} /> : <Home size={26} />}
          <span>{isCameraOn ? 'OFF' : 'HOME'}</span>
        </button>
        <button className="btn-3d secondary" onClick={() => fileInputRef.current?.click()}><Upload size={26} color="var(--primary)" /><span>CARICA</span></button>
        <button className="btn-3d secondary" onClick={() => { setActiveMode('chat'); setIsSettingsOpen(false); setIsHistoryOpen(false); setIsGamesOpen(false); }}><MessageSquare size={26} color="var(--primary)" /><span>CHAT AI</span></button>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />

      {isHistoryOpen && (
        <div className="side-overlay">
          <header><button className="btn-header-icon" onClick={() => setIsHistoryOpen(false)}><ChevronLeft size={24} /></button><h3>Il Tuo Erbario</h3></header>
          <div className="overlay-content">
            {!user && (
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '16px',
                color: 'white',
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                  📸 Cronologia Locale
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9 }}>
                  Le tue foto sono salvate solo su questo dispositivo. Registrati per sincronizzare su tutti i tuoi dispositivi!
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  REGISTRATI ORA
                </button>
              </div>
            )}
            {history.length === 0 ? <p style={{ opacity: 0.5, textAlign: 'center', marginTop: 40 }}>Ancora nessuna pianta salvata.</p> : history.map(h => (
              <div key={h.id} style={{ padding: 14, background: 'var(--white)', borderRadius: 24, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--card-border)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }} onClick={() => setFullScreenAnalysis(h)}>
                <img src={h.image} style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800 }}>{h.name}</div><div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(h.timestamp).toLocaleDateString()}</div></div>
                <ChevronRight size={18} opacity={0.3} />
              </div>
            ))}
          </div>
        </div>
      )}

      {isGamesOpen && (
        <div className="side-overlay">
          <header><button className="btn-header-icon" onClick={() => { setIsGamesOpen(false); setActiveGame(null); setShowQuestIntro(false); }}><ChevronLeft size={24} /></button><h3>Sfide Botaniche</h3></header>
          <div className="overlay-content">
            {showQuestIntro ? (
              <div style={{ padding: '20px' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 24, padding: 32, color: 'white', marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>{QUESTS.find(q => q.id === activeGame)?.icon}</div>
                  <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem' }}>{QUESTS.find(q => q.id === activeGame)?.title}</h2>
                  <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>{QUESTS.find(q => q.id === activeGame)?.desc}</div>
                </div>
                <div style={{ background: 'var(--white)', borderRadius: 24, padding: 24, border: '1px solid var(--card-border)', marginBottom: 20 }}>
                  <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Come Funziona:</h3>
                  {QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? (
                    <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                      <li>Rispondi a <b>8 domande</b> sulla botanica</li>
                      <li>Ottieni <b>10 XP</b> per ogni risposta corretta</li>
                      <li>Completa la sfida rispondendo correttamente ad almeno <b>5/8 domande</b></li>
                      <li>Ricevi <b>+{QUESTS.find(q => q.id === activeGame)?.xp} XP bonus</b> al completamento!</li>
                    </ul>
                  ) : QUESTS.find(q => q.id === activeGame)?.type === 'beauty' ? (
                    <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                      <li>Fotografa il <b>fiore o pianta più bello</b> che riesci a trovare</li>
                      <li>L'AI valuterà la bellezza da <b>1 a 100</b> considerando colori, simmetria e composizione</li>
                      <li>Ottieni <b>XP pari al punteggio</b> ricevuto</li>
                      <li>Competi nella <b>classifica globale</b> con gli altri utenti!</li>
                      <li>Il punteggio più alto vince <b>+{QUESTS.find(q => q.id === activeGame)?.xp} XP bonus</b></li>
                    </ul>
                  ) : (
                    <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                      <li>Trova e fotografa <b>{QUESTS.find(q => q.id === activeGame)?.requirement}</b></li>
                      <li>L'AI genererà <b>3 domande specifiche</b> sulla tua foto</li>
                      <li>Rispondi correttamente ad almeno <b>2/3 domande</b></li>
                      <li>Ottieni <b>10 XP</b> per risposta corretta + <b>+{QUESTS.find(q => q.id === activeGame)?.xp} XP bonus</b>!</li>
                      {QUESTS.find(q => q.id === activeGame)?.count && <li>Ripeti per <b>{QUESTS.find(q => q.id === activeGame)?.count} volte</b> per completare la sfida</li>}
                    </ul>
                  )}
                </div>
                <button onClick={startQuestAfterIntro} style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '18px', borderRadius: 100, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)' }}>INIZIA SFIDA</button>
              </div>
            ) : activeGame && QUESTS.find(q => q.id === activeGame)?.type === 'beauty' && beautyScore !== null ? (
              <div style={{ padding: '20px' }}>
                {questPhoto && <img src={questPhoto} style={{ width: '100%', borderRadius: 20, marginBottom: 20, maxHeight: 300, objectFit: 'cover', border: '3px solid var(--primary)' }} />}

                <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-light), var(--accent))', borderRadius: 24, padding: 32, marginBottom: 20 }}>
                  <Trophy size={64} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                  <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '2rem' }}>Punteggio: {beautyScore}/100</h2>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: '12px 0 0' }}>{showBeautyConfirm ? 'Valutazione completata!' : `+${beautyScore} XP guadagnati!`}</p>
                </div>

                {showBeautyConfirm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ textAlign: 'center', fontSize: '1rem', marginBottom: 8 }}>Vuoi pubblicare questo risultato nella classifica globale?</p>
                    <button onClick={publishBeautyResult} style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem' }}>PUBBLICA IN CLASSIFICA</button>
                    <button onClick={() => { setActiveGame(null); setBeautyScore(null); setQuestPhoto(null); setShowBeautyConfirm(false); }} style={{ width: '100%', background: '#fee', color: '#c00', border: 'none', padding: '16px', borderRadius: 100, fontWeight: 800, cursor: 'pointer' }}>NO, GRAZIE</button>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'var(--white)', borderRadius: 24, padding: 20, border: '1px solid var(--card-border)' }}>
                      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Award size={20} color="var(--primary)" /> Classifica Top 10</h3>
                      {leaderboard.slice(0, 10).map((entry, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: idx === 0 ? 'var(--primary-light)' : 'transparent', borderRadius: 12, marginBottom: 8, border: entry.timestamp === questPhoto ? '2px solid var(--primary)' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: idx === 0 ? 'var(--primary)' : 'var(--text-muted)' }}>#{idx + 1}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{new Date(entry.timestamp).toLocaleDateString()}</div>
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{entry.score}/100</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setActiveGame(null); setBeautyScore(null); setQuestPhoto(null); }} style={{ width: '100%', marginTop: 20, background: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: 100, fontWeight: 800, cursor: 'pointer' }}>CHIUDI</button>
                  </>
                )}
              </div>
            ) : activeGame ? (
              <div style={{ padding: '20px' }}>
                {questPhoto && <img src={questPhoto} style={{ width: '100%', borderRadius: 20, marginBottom: 20, maxHeight: 200, objectFit: 'cover' }} />}
                <div style={{ background: 'var(--white)', borderRadius: 24, padding: 24, marginBottom: 20, border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Domanda {currentQuestion + 1}/{(QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions).length}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Punteggio: {gameScore}</div>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', lineHeight: 1.4, marginBottom: 24 }}>
                    {QUESTS.find(q => q.id === activeGame)?.type === 'quiz'
                      ? QUIZ_QUESTIONS[currentQuestion]?.q
                      : questQuestions[currentQuestion]?.question}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(QUESTS.find(q => q.id === activeGame)?.type === 'quiz'
                      ? QUIZ_QUESTIONS[currentQuestion]?.answers
                      : questQuestions[currentQuestion]?.options || []).map((ans: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => !showResult && answerQuestion(idx)}
                          disabled={showResult}
                          style={{
                            padding: '16px 20px',
                            borderRadius: 16,
                            border: showResult && idx === (QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS[currentQuestion].correct : questQuestions[currentQuestion].correct) ? '2px solid var(--primary)' : showResult && idx === selectedAnswer ? '2px solid var(--danger)' : '1px solid var(--card-border)',
                            background: showResult && idx === (QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS[currentQuestion].correct : questQuestions[currentQuestion].correct) ? 'var(--primary-light)' : showResult && idx === selectedAnswer ? '#FFEBEE' : 'var(--white)',
                            fontWeight: 700,
                            cursor: showResult ? 'default' : 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          {ans}
                        </button>
                      ))}
                  </div>
                </div>
                {currentQuestion === (QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions).length - 1 && showResult && (
                  <div style={{ textAlign: 'center', padding: 20, background: 'var(--primary-light)', borderRadius: 24, border: '1px solid var(--primary)' }}>
                    <Trophy size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>Quiz Completato!</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: '8px 0' }}>Hai risposto correttamente a {gameScore}/{(QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions).length} domande</p>
                    <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem', margin: 0 }}>+{gameScore * 10} XP</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {!user && (
                  <div style={{
                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    color: 'white',
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                      🎮 Sfide Bloccate
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9 }}>
                      Accedi per partecipare alle sfide multiplayer e competere nella classifica globale!
                    </p>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      style={{
                        background: 'white',
                        color: '#FF6B6B',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      ACCEDI ORA
                    </button>
                  </div>
                )}
                <div style={{ padding: '10px 10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontSize: '2.4rem', fontWeight: 800 }}>{stats.completedQuests.length}</div> <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>Sfide Completate</div></div>
                  <div style={{ textAlign: 'right' }}><Award size={48} color="#FFD700" /><div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>MAESTRO GIARDINIERE</div></div>
                </div>
                {QUESTS.map(q => {
                  const done = stats.completedQuests.includes(q.id);
                  const progress = questProgress[q.id] || 0;
                  const isMultiplayer = q.type === 'beauty';
                  const isQuiz = q.type === 'quiz';
                  return (
                    <div key={q.id} className="quest-card" style={{ opacity: done ? 0.6 : 1, border: isMultiplayer ? '2px solid #FFD700' : isQuiz ? '2px solid #9C27B0' : done ? '2px solid var(--primary)' : '1px solid var(--card-border)', background: isMultiplayer ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))' : isQuiz ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(156, 39, 176, 0.05))' : 'var(--white)' }}>
                      <div className="quest-icon" style={{ background: done ? 'var(--primary-light)' : isMultiplayer ? 'rgba(255, 215, 0, 0.2)' : isQuiz ? 'rgba(156, 39, 176, 0.2)' : '' }}>{done ? <CheckCircle2 size={24} color="var(--primary)" /> : q.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div style={{ fontWeight: 800 }}>{q.title}</div>
                          {isMultiplayer && <div style={{ background: '#FFD700', color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800 }}>MULTIPLAYER</div>}
                          {isQuiz && <div style={{ background: '#9C27B0', color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800 }}>QUIZ</div>}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{q.desc}</div>
                        {q.count && progress > 0 && !done && <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, marginTop: 4 }}>Progresso: {progress}/{q.count}</div>}
                      </div>
                      {!done && <button onClick={() => startGame(q.id)} style={{ background: isMultiplayer ? '#FFD700' : isQuiz ? '#9C27B0' : 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 100, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>GIOCA</button>}
                      {done && <div style={{ fontWeight: 800, color: 'var(--primary)' }}>✓ +{q.xp} XP</div>}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="side-overlay">
          <header><button className="btn-header-icon" onClick={() => setIsSettingsOpen(false)}><ChevronLeft size={24} /></button><h3>Impostazioni</h3></header>
          <div className="overlay-content">
            <div className="profile-card">
              <div className="profile-avatar"><User size={32} /></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                  {user ? (user.user_metadata?.display_name || user.email?.split('@')[0]) : 'Ospite'}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  {user ? 'Utente Registrato' : `Livello ${stats.level} • Non registrato`}
                </div>
              </div>
            </div>

            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '24px',
                }}
              >
                ACCEDI O REGISTRATI
              </button>
            ) : (
              <button
                onClick={async () => {
                  await signOut();
                  setUser(null);
                  alert('Logout effettuato!');
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#fee',
                  color: '#c00',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '24px',
                }}
              >
                <LogOut size={20} style={{ marginRight: '8px', display: 'inline' }} />
                Esci
              </button>
            )}

            <div className="settings-section">
              <div className="settings-section-title">DevTools</div>
              <div className="devtools-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="settings-icon-box" style={{ background: 'var(--primary-dark)', color: 'white' }}><Code size={18} /></div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>BY CASTRO MASSIMO</div>
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0, opacity: 0.8 }}>
                  Questa App è realizzata da <b>DevTools by Castro Massimo</b>. Se hai bisogno di supporto, segnalazioni o di WebApp personalizzate contattaci.
                </p>
                <a href="mailto:castromassimo@gmail.com" className="btn-contact">
                  <Mail size={18} /> CONTATTACI VIA E-MAIL
                </a>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Preferenze App</div>
              <div className="settings-group">
                <div className="settings-row" onClick={() => setDarkMode(!darkMode)}>
                  <div className="settings-icon-box"><Moon size={18} /></div>
                  <span style={{ flex: 1, fontWeight: 600 }}>Modalità Scura</span>
                  <div className={`toggle-switch ${darkMode ? 'active' : ''}`}></div>
                </div>
                <div className="settings-row">
                  <div className="settings-icon-box"><Bell size={18} /></div>
                  <span style={{ flex: 1, fontWeight: 600 }}>Notifiche Cura</span>
                  <div className="toggle-switch active"></div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Sicurezza & Dati</div>
              <div className="settings-group">
                <div className="settings-row" onClick={() => window.aistudio.openSelectKey()}>
                  <div className="settings-icon-box"><Key size={18} /></div>
                  <span style={{ flex: 1, fontWeight: 600 }}>Configura API Key</span>
                  <ExternalLink size={16} opacity={0.3} />
                </div>
                <div className="settings-row">
                  <div className="settings-icon-box"><ShieldCheck size={18} /></div>
                  <span style={{ flex: 1, fontWeight: 600 }}>Privacy e Sicurezza</span>
                  <ChevronRight size={16} opacity={0.3} />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Sistema</div>
              <div className="settings-group">
                <div className="settings-row" style={{ color: 'var(--danger)' }} onClick={() => { if (confirm("Cancellare tutti i dati?")) { localStorage.clear(); window.location.reload(); } }}>
                  <div className="settings-icon-box" style={{ background: '#FFF0F0', color: 'var(--danger)' }}><Trash2 size={18} /></div>
                  <span style={{ flex: 1, fontWeight: 600 }}>Resetta Applicazione</span>
                </div>
                <div className="settings-row" onClick={() => alert("BioExpert v1.2.0")}>
                  <div className="settings-icon-box"><Info size={18} /></div>
                  <span style={{ flex: 1, fontWeight: 600 }}>Versione App</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>1.2.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {fullScreenAnalysis && (
        <div className="side-overlay">
          <header><button className="btn-header-icon" onClick={() => setFullScreenAnalysis(null)}><ChevronLeft size={24} /></button><h3>Dettagli & Cura</h3></header>
          <div className="overlay-content">
            <img src={fullScreenAnalysis.image} style={{ width: '100%', borderRadius: 32, marginBottom: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{fullScreenAnalysis.name}</h2>
                <p style={{ opacity: 0.6, fontStyle: 'italic', marginTop: 4 }}>{fullScreenAnalysis.scientificName}</p>
              </div>
              <div className={`status-badge ${fullScreenAnalysis.healthStatus === 'healthy' ? 'status-healthy' : 'status-sick'}`}>
                {fullScreenAnalysis.healthStatus === 'healthy' ? 'Sana' : 'Malata'}
              </div>
            </div>

            <div style={{ padding: 20, background: 'var(--white)', borderRadius: 28, border: '1px solid var(--card-border)', marginTop: 24 }}>
              <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} color="var(--primary)" /> Diagnosi {fullScreenAnalysis.healthStatus === 'sick' ? 'e Problemi' : ''}</h4>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{fullScreenAnalysis.diagnosis}</p>

              <h4 style={{ margin: '24px 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={18} color="var(--danger)" /> Guida alla Cura</h4>
              <div className="care-grid">
                <div className="care-item">
                  <div className="care-item-title"><Droplets size={16} /> Irrigazione</div>
                  <div className="care-item-desc">{fullScreenAnalysis.care.watering}</div>
                </div>
                <div className="care-item">
                  <div className="care-item-title"><Sun size={16} /> Esposizione</div>
                  <div className="care-item-desc">{fullScreenAnalysis.care.general}</div>
                </div>
                <div className="care-item">
                  <div className="care-item-title"><Scissors size={16} /> Potatura</div>
                  <div className="care-item-desc">{fullScreenAnalysis.care.pruning}</div>
                </div>
                <div className="care-item">
                  <div className="care-item-title"><Inbox size={16} /> Rinvaso</div>
                  <div className="care-item-desc">{fullScreenAnalysis.care.repotting}</div>
                </div>
              </div>
            </div>

            <button className="btn-game-action" style={{ marginTop: 24, background: 'var(--primary)', color: 'white', width: '100%', padding: 18, borderRadius: 20, border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }} onClick={() => { setFullScreenAnalysis(null); setActiveMode('chat'); sendMessage(`Qual è la cura migliore per questa ${fullScreenAnalysis.name}?`); }}>
              <MessageSquare size={20} /> PARLA CON BIOEXPERT
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Ricarica utente
          getCurrentUser().then(result => {
            if (result.success && result.user) {
              setUser(result.user);
            }
          });
        }}
      />
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
