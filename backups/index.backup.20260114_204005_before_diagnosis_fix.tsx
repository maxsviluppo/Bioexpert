
import React, { useState, useRef, useEffect, useMemo, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { Camera, Send, Sprout, Info, RefreshCw, MessageSquare, Droplets, AlertTriangle, CheckCircle2, Settings, Moon, Bell, Mountain, Sparkles, History, Share2, Trash2, Zap, ChevronLeft, Key, ExternalLink, Trophy, Target, Gamepad2, Upload, User, ShieldAlert, Clock, Leaf, Apple, Layers, Maximize2, Terminal, ChevronRight, Star, Award, Sun, CameraOff, HelpCircle, ShieldCheck, Heart, LogOut, Mail, Code, Scissors, Inbox, Download, X, Home, BookOpen, Plus, Calendar, Flower, Flower2, TreePine, FileText, Package, Image as ImageIcon } from 'lucide-react';

import {
  registerUsername,
  saveBeautyScore,
  getLeaderboard,
  fetchUserPlants,
  addUserPlant,
  deleteUserPlant,
  updateUserPlant,
  addCareEvent,
  fetchCareEvents,
  deleteCareEvent,
  fetchPlantPhotos,
  addPlantPhoto,
  deleteLeaderboardEntry,
  getLocalUsername,
  setLocalUsername,
  clearLocalUsername,
  captureImageAsBase64,
  fetchUserInfo,
  updateUserInfo,
  createCareProgram,
  getCareProgram,
  completeCheckpoint
} from './apiClient';

// Helper per Gemini (se non già presente)
const imageToGenerativePart = (base64Image: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType
    }
  };
};
import { AuthModal } from './AuthModal';

// Gestione Robustezza API Key
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || (process as any).env?.API_KEY || 'AlzaSyBQk0ASh35YWvPoACz82uN-3yYInd1_zHo';

console.log('🔑 [DEBUG] Stato API Key:', {
  present: !!GEMINI_KEY,
  length: GEMINI_KEY?.length || 0,
  firstChar: GEMINI_KEY ? GEMINI_KEY.substring(0, 4) + '...' : 'N/A'
});

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
    max-width: 100%;
    margin: 0;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    position: relative;
    background: linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 10%, #F5FBF5 30%, #E8F5E9 60%, #DCEDC8 85%, #C5E1A5 100%);
    background-size: 100% 400%;
    animation: gradientShift 20s ease infinite;
    overflow: hidden;
  }
  
  @keyframes gradientShift {
    0% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 0% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }
  
  /* Elementi 3D Fluttuanti */
  .app-shell::before,
  .app-shell::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    animation: float3d 20s ease-in-out infinite;
    z-index: 0;
  }
  
  .app-shell::before {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(129, 199, 132, 0.3) 0%, transparent 70%);
    top: -100px;
    right: -100px;
    animation-delay: 0s;
  }
  
  .app-shell::after {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(197, 225, 165, 0.25) 0%, transparent 70%);
    bottom: -80px;
    left: -80px;
    animation-delay: 5s;
  }
  
  @keyframes float3d {
    0%, 100% { 
      transform: translate(0, 0) scale(1);
      opacity: 0.3;
    }
    25% { 
      transform: translate(30px, -30px) scale(1.1);
      opacity: 0.4;
    }
    50% { 
      transform: translate(-20px, 20px) scale(0.9);
      opacity: 0.25;
    }
    75% { 
      transform: translate(20px, 30px) scale(1.05);
      opacity: 0.35;
    }
  }
  
  .app-shell > * {
    position: relative;
    z-index: 1;
  }

  /* Elementi Fluttuanti Aggiuntivi */
  .floating-element {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  .floating-element-1 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(165, 214, 167, 0.2) 0%, transparent 70%);
    top: 20%;
    left: 10%;
    filter: blur(60px);
    animation: float3dAlt1 15s ease-in-out infinite;
  }

  .floating-element-2 {
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(220, 237, 200, 0.25) 0%, transparent 70%);
    top: 50%;
    right: 15%;
    filter: blur(70px);
    animation: float3dAlt2 18s ease-in-out infinite;
    animation-delay: 3s;
  }

  .floating-element-3 {
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(129, 199, 132, 0.15) 0%, transparent 70%);
    bottom: 30%;
    left: 20%;
    filter: blur(50px);
    animation: float3dAlt3 22s ease-in-out infinite;
    animation-delay: 7s;
  }

  .floating-element-4 {
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(197, 225, 165, 0.18) 0%, transparent 70%);
    top: 35%;
    right: 25%;
    filter: blur(65px);
    animation: float3dAlt1 17s ease-in-out infinite;
    animation-delay: 10s;
  }

  @keyframes float3dAlt1 {
    0%, 100% { 
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 0.3;
    }
    33% { 
      transform: translate(40px, -25px) rotate(120deg) scale(1.15);
      opacity: 0.4;
    }
    66% { 
      transform: translate(-30px, 35px) rotate(240deg) scale(0.85);
      opacity: 0.25;
    }
  }

  @keyframes float3dAlt2 {
    0%, 100% { 
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 0.35;
    }
    40% { 
      transform: translate(-35px, 30px) rotate(144deg) scale(0.9);
      opacity: 0.25;
    }
    80% { 
      transform: translate(25px, -40px) rotate(288deg) scale(1.1);
      opacity: 0.4;
    }
  }

  @keyframes float3dAlt3 {
    0%, 100% { 
      transform: translate(0, 0) scale(1);
      opacity: 0.25;
    }
    50% { 
      transform: translate(20px, -20px) scale(1.2);
      opacity: 0.35;
    }
  }

  /* Ombre Botaniche - Foglie Fluttuanti */
  .botanical-shadow {
    position: absolute;
    pointer-events: none;
    z-index: 0;
    opacity: 0.08;
  }

  .botanical-shadow-1 {
    width: 150px;
    height: 150px;
    top: 15%;
    left: 5%;
    background: radial-gradient(ellipse at center, rgba(27, 94, 32, 0.4) 0%, transparent 60%);
    border-radius: 50% 0% 50% 50%;
    transform: rotate(45deg);
    animation: botanicalFloat1 25s ease-in-out infinite;
  }

  .botanical-shadow-2 {
    width: 120px;
    height: 180px;
    top: 60%;
    right: 8%;
    background: radial-gradient(ellipse at center, rgba(46, 125, 50, 0.3) 0%, transparent 65%);
    border-radius: 80% 20% 80% 20%;
    transform: rotate(-30deg);
    animation: botanicalFloat2 30s ease-in-out infinite;
    animation-delay: 5s;
  }

  .botanical-shadow-3 {
    width: 100px;
    height: 100px;
    bottom: 20%;
    left: 15%;
    background: radial-gradient(circle, rgba(56, 142, 60, 0.35) 0%, transparent 70%);
    border-radius: 50% 50% 0% 50%;
    transform: rotate(120deg);
    animation: botanicalFloat3 20s ease-in-out infinite;
    animation-delay: 10s;
  }

  @keyframes botanicalFloat1 {
    0%, 100% { 
      transform: rotate(45deg) translate(0, 0) scale(1);
      opacity: 0.08;
    }
    50% { 
      transform: rotate(65deg) translate(20px, -15px) scale(1.1);
      opacity: 0.12;
    }
  }

  @keyframes botanicalFloat2 {
    0%, 100% { 
      transform: rotate(-30deg) translate(0, 0) scale(1);
      opacity: 0.08;
    }
    50% { 
      transform: rotate(-50deg) translate(-25px, 20px) scale(0.95);
      opacity: 0.1;
    }
  }

  @keyframes botanicalFloat3 {
    0%, 100% { 
      transform: rotate(120deg) translate(0, 0);
      opacity: 0.08;
    }
    50% { 
      transform: rotate(140deg) translate(15px, -10px);
      opacity: 0.11;
    }
  }

  /* Bordi Angolari Stile Mirino - Box Piccoli */
  .viewfinder-box {
    position: relative;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 20px;
  }

  .viewfinder-box::before,
  .viewfinder-box::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: var(--primary);
    border-style: solid;
  }

  /* Top-left corner */
  .viewfinder-box::before {
    top: 8px;
    left: 8px;
    border-width: 3px 0 0 3px;
    border-radius: 16px 0 0 0;
  }

  /* Bottom-right corner */
  .viewfinder-box::after {
    bottom: 8px;
    right: 8px;
    border-width: 0 3px 3px 0;
    border-radius: 0 0 16px 0;
  }

  /* Additional corners using pseudo-elements on child */
  .viewfinder-box > *:first-child::before,
  .viewfinder-box > *:first-child::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: var(--primary);
    border-style: solid;
    z-index: 1;
  }

  /* Top-right corner */
  .viewfinder-box > *:first-child::before {
    top: 8px;
    right: 8px;
    border-width: 3px 3px 0 0;
    border-radius: 0 16px 0 0;
  }

  /* Bottom-left corner */
  .viewfinder-box > *:first-child::after {
    bottom: 8px;
    left: 8px;
    border-width: 0 0 3px 3px;
    border-radius: 0 0 0 16px;
  }

  /* Bordi Mirino per Container Principale */
  .camera-overlay-corners::before,
  .camera-overlay-corners::after {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border-color: #1B5E20;
    border-style: solid;
    z-index: 10;
  }

  /* Top-left corner - Main Container */
  .camera-overlay-corners::before {
    top: 16px;
    left: 16px;
    border-width: 4px 0 0 4px;
    border-radius: 20px 0 0 0;
  }

  /* Bottom-right corner - Main Container */
  .camera-overlay-corners::after {
    bottom: 16px;
    right: 16px;
    border-width: 0 4px 4px 0;
    border-radius: 0 0 20px 0;
  }

  /* Pulse Animation for Buttons */
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 12px 40px rgba(46, 125, 50, 0.4), 0 0 0 0 rgba(46, 125, 50, 0.4);
    }
    50% {
      box-shadow: 0 12px 40px rgba(46, 125, 50, 0.4), 0 0 0 10px rgba(46, 125, 50, 0);
    }
  }

  /* Wiggle Animation - Button 1 (Camera) */
  @keyframes wiggle1 {
    0%, 90%, 100% {
      transform: translateY(0) scale(1) rotate(0deg);
    }
    91% {
      transform: translateY(0) scale(1) rotate(-5deg);
    }
    93% {
      transform: translateY(0) scale(1) rotate(5deg);
    }
    95% {
      transform: translateY(0) scale(1) rotate(-5deg);
    }
    97% {
      transform: translateY(0) scale(1) rotate(5deg);
    }
    99% {
      transform: translateY(0) scale(1) rotate(0deg);
    }
  }

  /* Wiggle Animation - Button 2 (Gallery) */
  @keyframes wiggle2 {
    0%, 40%, 100% {
      transform: translateY(0) scale(1) rotate(0deg);
    }
    41% {
      transform: translateY(0) scale(1) rotate(-5deg);
    }
    43% {
      transform: translateY(0) scale(1) rotate(5deg);
    }
    45% {
      transform: translateY(0) scale(1) rotate(-5deg);
    }
    47% {
      transform: translateY(0) scale(1) rotate(5deg);
    }
    49% {
      transform: translateY(0) scale(1) rotate(0deg);
    }
  }


  header {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 50;
    flex-shrink: 0;
  }

  /* Responsive header per smartphone */
  @media (max-width: 480px) {
    header {
      padding: 6px 8px;
    }
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 480px) {
    .logo {
      gap: 6px;
    }
  }

  .logo h1 {
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--primary);
  }

  @media (max-width: 480px) {
    .logo h1 {
      font-size: 0.95rem;
    }
  }

  .header-actions {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  @media (max-width: 480px) {
    .header-actions {
      gap: 2px;
    }
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
    min-width: 36px;
    min-height: 36px;
  }

  @media (max-width: 480px) {
    .btn-header-icon {
      padding: 6px;
      min-width: 32px;
      min-height: 32px;
    }
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

  @media (max-width: 480px) {
    .badge-xp-large {
      padding: 4px 8px;
      font-size: 0.7rem;
    }
  }

  .main-frame {
    position: relative;
    width: 100%;
    flex: 1;
    background: transparent; /* Fix per rimuovere cornice nera in dark mode */
    border-radius: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    box-shadow: none;
    border: none;
    margin: 0;
    overflow: hidden;
  }

  @media (max-width: 480px) {
    .main-frame {
      width: 100%;
    }
  }

  .frame-inner {
    width: 100%;
    height: 100%;
    flex: 1;
    border-radius: 0;
    overflow: hidden;
    background: transparent;
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
    justify-content: flex-start;
    position: relative;
    overflow: hidden;
    padding-top: 60px;
  }

  @media (max-width: 480px) {
    .camera-off-overlay {
      padding-top: 40px;
    }
  }

  .logo-off-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--primary-dark);
    opacity: 0.9;
    transform: scale(1.4);
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    .logo-off-center {
      transform: scale(1.2);
      margin-bottom: 16px;
    }
  }

  .logo-off-center h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 0.4em;
    text-transform: uppercase;
  }

  @media (max-width: 480px) {
    .logo-off-center h2 {
      font-size: 0.95rem;
      letter-spacing: 0.35em;
    }
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
    padding-bottom: calc(70px + env(safe-area-inset-bottom)); /* Aumentato per evitare overlay browser mobile */
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
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    font-size: 0.8rem;
    line-height: 1.4;
    opacity: 0.9;
    word-break: break-word;
    margin-top: 2px;
  }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }

  .achievement-toast {
    position: fixed;
    top: 30px;
    left: 20px;
    right: 20px;
    background: rgba(46, 125, 50, 0.95);
    backdrop-filter: blur(12px);
    color: white;
    padding: 18px 24px;
    border-radius: 24px;
    z-index: 2000;
    font-weight: 800;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    gap: 14px;
    animation: toastSlideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid rgba(255,255,255,0.3);
  }

  @keyframes toastSlideDown {
    from { transform: translateY(-120%) scale(0.9); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }

  .photo-archive-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 16px;
  }

  .photo-archive-item {
    aspect-ratio: 1;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--card-border);
    background: #eee;
  }

  .photo-archive-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-archive-date {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: white;
    font-size: 0.6rem;
    padding: 6px 4px 4px;
    text-align: center;
    font-weight: 700;
  }

  .install-hint {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 240px;
    height: 240px;
    background: var(--primary-dark);
    color: var(--white);
    padding: 24px;
    border-radius: 32px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    z-index: 1000;
    align-items: center;
    gap: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    z-index: 200;
    animation: float 4s ease-in-out infinite;
    border: 1px solid rgba(255,255,255,0.1);
  }
  @keyframes float {
    0% { transform: translate(-50%, -50%) translateY(0px); }
    50% { transform: translate(-50%, -50%) translateY(-15px); }
    100% { transform: translate(-50%, -50%) translateY(0px); }
  }

  .toast-confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 3000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  }
  
  .toast-confirm-box {
    background: var(--white);
    width: 100%;
    max-width: 400px;
    padding: 24px;
    border-radius: 32px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: slideUpToast 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  @keyframes slideUpToast {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .toast-actions {
    display: flex;
    gap: 12px;
  }
  
  .toast-actions button {
    flex: 1;
    padding: 14px;
    border-radius: 100px;
    border: none;
    font-weight: 800;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .cancel-btn { background: var(--primary-light); color: var(--primary); }
  .confirm-danger { background: var(--danger); color: white; }
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
  source?: 'garden' | 'history' | 'analysis';
  carePlan?: string;
  lastCareAt?: number;
  nextCheckAt?: number;
}

interface UserStats {
  xp: number;
  level: number;
  totalScans: number;
  completedQuests: string[];
  username?: string;
}

interface Quest {
  id: string;
  type: string;
  title: string;
  icon: React.ReactNode;
  xp: number;
  requirement?: string;
  desc: string;
  count?: number; // Optional property
  isWeekly?: boolean;
}

const WEEKLY_THEMES = [
  { requirement: 'Rosa', title: 'La Rosa più Bella', icon: <Flower2 size={24} /> },
  { requirement: 'Orchidea', title: 'Orchidea Reale', icon: <Flower size={24} /> },
  { requirement: 'Cactus', title: 'Cactus Spinosa', icon: <Sprout size={24} /> },
  { requirement: 'Bonsai', title: 'Maestro Bonsai', icon: <TreePine size={24} /> },
  { requirement: 'Margherita', title: 'Semplicità Margherita', icon: <Flower2 size={24} /> },
  { requirement: 'Girasole', title: 'Raggio di Sole', icon: <Sun size={24} /> },
  { requirement: 'Tulipano', title: 'Colore Tulipano', icon: <Flower size={24} /> },
  { requirement: 'Pianta Grassa', title: 'Succulenta Show', icon: <Sprout size={24} /> }
];

const getWeeklyChallengeInfo = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  const week = Math.floor(day / 7);
  const themeIndex = week % WEEKLY_THEMES.length;
  const theme = WEEKLY_THEMES[themeIndex];

  return {
    id: `weekly_${now.getFullYear()}_${week}`,
    type: 'beauty',
    title: `Sfida Settimanale: ${theme.requirement}`,
    icon: theme.icon,
    xp: 200,
    requirement: theme.requirement,
    desc: `Tema della settimana: ${theme.title}. Fotografa un esemplare di ${theme.requirement} e vinci XP!`,
    isWeekly: true
  };
};

const weeklyChallenge = getWeeklyChallengeInfo();

const QUESTS: Quest[] = [
  weeklyChallenge,
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
  { id: 'general_quiz', type: 'quiz', title: 'Maestro Botanico 1° Livello', icon: <HelpCircle size={24} />, xp: 40, desc: 'Rispondi al quiz generale sulla botanica.' },
  { id: 'general_quiz_2', type: 'quiz', title: 'Maestro Botanico 2° Livello', icon: <HelpCircle size={24} />, xp: 80, desc: 'Quiz intermedio su fotosintesi e adattamenti.' },
  { id: 'general_quiz_3', type: 'quiz', title: 'Maestro Botanico 3° Livello', icon: <HelpCircle size={24} />, xp: 120, desc: 'Quiz esperto su tassonomia e biologia.' }
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

const QUIZ_QUESTIONS_2 = [
  { q: 'Qual è il pigmento responsabile del colore verde?', answers: ['Melanina', 'Clorofilla', 'Carotene', 'Antociano'], correct: 1 },
  { q: 'Come si chiamano le piante che vivono un solo anno?', answers: ['Perenni', 'Annuali', 'Biennali', 'Decidue'], correct: 1 },
  { q: 'Quale di questi NON è un tipo di radice?', answers: ['Fittone', 'Fascicolata', 'Aerea', 'Spinale'], correct: 3 },
  { q: 'La patata è un esempio di:', answers: ['Radice', 'Fusto sotterraneo', 'Frutto', 'Foglia'], correct: 1 },
  { q: 'Quale albero perde le foglie in inverno?', answers: ['Pino', 'Abete', 'Quercia', 'Leccio'], correct: 2 },
  { q: 'Cosa trasporta la linfa grezza?', answers: ['Xilema', 'Floema', 'Midollo', 'Corteccia'], correct: 0 },
  { q: 'I funghi appartengono al regno delle piante?', answers: ['Sì', 'No', 'Solo alcuni', 'Dipende'], correct: 1 },
  { q: 'Quale pianta è nota per crescere nel deserto?', answers: ['Salice', 'Agave', 'Felce', 'Muschio'], correct: 1 }
];

const QUIZ_QUESTIONS_3 = [
  { q: 'Cos è una gimnosperma?', answers: ['Pianta con fiori', 'Pianta a seme nudo', 'Pianta acquatica', 'Felce'], correct: 1 },
  { q: 'Qual è la funzione degli stomi?', answers: ['Assorbire acqua', 'Scambio gassoso', 'Fotosintesi', 'Sostegno'], correct: 1 },
  { q: 'Il gineceo è l organo riproduttivo:', answers: ['Maschile', 'Femminile', 'Neutro', 'Ermafrodita'], correct: 1 },
  { q: 'Quale ormone stimola la maturazione dei frutti?', answers: ['Auxina', 'Etilene', 'Gibberellina', 'Citochinina'], correct: 1 },
  { q: 'Cosa sono i licheni?', answers: ['Muschi', 'Simbiosi fungo-alga', 'Parassiti', 'Radici'], correct: 1 },
  { q: 'La "Vite da vino" appartiene alla famiglia delle:', answers: ['Rosaceae', 'Vitaceae', 'Solanaceae', 'Fabaceae'], correct: 1 },
  { q: 'Quale parte della cellula vegetale dà rigidità?', answers: ['Membrana', 'Parete cellulare', 'Nucleo', 'Mitocondrio'], correct: 1 },
  { q: 'La sequoia è una:', answers: ['Angiosperma', 'Gimnosperma', 'Pteridofita', 'Briofita'], correct: 1 }
];


function App() {
  const [activeMode, setActiveMode] = useState<'scan' | 'chat' | 'garden'>('scan');
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
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
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
  const [questProgress, setQuestProgress] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('bio_questProgress');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [showQuestIntro, setShowQuestIntro] = useState(false);
  const [beautyScore, setBeautyScore] = useState<number | null>(null);
  const [beautyPlantName, setBeautyPlantName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<any[]>(() =>
    JSON.parse(localStorage.getItem('beauty_leaderboard') || '[]')
  );
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<any[]>([]);
  const [activeLeaderboardType, setActiveLeaderboardType] = useState<'beauty_contest' | string>('beauty_contest');
  const [username, setUsername] = useState<string | null>(getLocalUsername());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBeautyConfirm, setShowBeautyConfirm] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'week' | 'month' | 'today'>('all');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [showAddToGardenConfirm, setShowAddToGardenConfirm] = useState(false);
  const [pendingPlant, setPendingPlant] = useState<PlantAnalysis | null>(null);
  const [userPlants, setUserPlants] = useState<any[]>([]);
  const [gardenTab, setGardenTab] = useState<'plants' | 'care' | 'notifications'>('plants');
  const [isGardenScanning, setIsGardenScanning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [careHistory, setCareHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [detailTab, setDetailTab] = useState<'info' | 'care' | 'history'>('info');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [plantPhotos, setPlantPhotos] = useState<any[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // New state for notifications
  const [lightLevel, setLightLevel] = useState<number | null>(null); // Lux value
  const [lightSensorSupported, setLightSensorSupported] = useState(false);
  const lightSensorRef = useRef<any>(null);

  // Stati per sistema di cura progressivo
  const [activeCareProgram, setActiveCareProgram] = useState<any>(null);
  const [isLoadingProgram, setIsLoadingProgram] = useState(false);
  const [isCheckpointMode, setIsCheckpointMode] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<any>(null);
  const [showCareProgramDashboard, setShowCareProgramDashboard] = useState(false);

  const [confirmToast, setConfirmToast] = useState<{ message: string, onConfirm: () => void, onCancel: () => void } | null>(null);
  const lastLeaderboardFetch = useRef<number>(0);
  const pendingLocalEntry = useRef<any>(null);

  useEffect(() => {
    const savedPending = localStorage.getItem('pendingBeautyEntry');
    if (savedPending) {
      try {
        pendingLocalEntry.current = JSON.parse(savedPending);
      } catch (e) {
        console.error("Error loading pending entry", e);
      }
    }

    if (username && activeMode === 'garden') {
      fetchUserPlants(username).then((res: any) => {
        if (res.success) {
          setUserPlants(res.data);
          // Check automatico piante in scadenza
          checkPlantsNeedingCare(res.data);
        }
      }).catch((e: any) => console.error('Error loading plants', e));
    }

    // Registra Service Worker per notifiche
    if ('serviceWorker' in navigator && notificationsEnabled) {
      registerServiceWorker();
    }
  }, [username, activeMode]);

  // Registrazione Service Worker
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);

      // Richiedi permessi notifiche se non già concessi
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
        }
      }

      // Background Sync per check periodici (se supportato)
      if ('sync' in registration) {
        await (registration as any).sync.register('check-plants');
      }
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  };

  // Check piante che necessitano cure
  // Check piante che necessitano cure
  const checkPlantsNeedingCare = (plants: any[]) => {
    if (!notificationsEnabled || Notification.permission !== 'granted') return;

    const now = Date.now();
    const plantsNeedingCare = plants.filter(plant => {
      return plant.next_check_at && new Date(plant.next_check_at).getTime() < now;
    });

    if (plantsNeedingCare.length > 0) {
      // Mostra notifica locale
      const plantNames = plantsNeedingCare.slice(0, 3).map(p => p.plant_name).join(', ');
      const message = plantsNeedingCare.length === 1
        ? `🚨 ${plantNames} necessita cure!`
        : `🚨 ${plantsNeedingCare.length} piante necessitano cure: ${plantNames}${plantsNeedingCare.length > 3 ? '...' : ''}`;

      // Notifica browser
      if (document.hidden) {
        new Notification('🌱 BioExpert - Promemoria Cura', {
          body: message,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'plant-care-alert',
          requireInteraction: false
        });
      }

      // Toast in-app
      setAchievementToast(message);
      setTimeout(() => setAchievementToast(null), 6000);
    }
  };

  // Carica programma di cura per una pianta
  const loadCareProgram = async (plantId: string) => {
    setIsLoadingProgram(true);
    try {
      const result = await getCareProgram(plantId);
      if (result.success && result.program) {
        setActiveCareProgram(result);
      } else {
        setActiveCareProgram(null);
      }
    } catch (error) {
      console.error('Error loading care program:', error);
      setActiveCareProgram(null);
    } finally {
      setIsLoadingProgram(false);
    }
  };

  // Carica programma di cura quando si apre dettaglio pianta
  useEffect(() => {
    if (fullScreenAnalysis?.id && fullScreenAnalysis.source === 'garden') {
      loadCareProgram(fullScreenAnalysis.id);
    }
  }, [fullScreenAnalysis?.id]);

  useEffect(() => {
    if (activeGame === 'beauty_contest' || activeGame?.startsWith('weekly_') || isLeaderboardOpen) {
      fetchLeaderboard();
      // Fetch anche weekly se siamo nella home leaderboard
      if (isLeaderboardOpen) fetchLeaderboard(false, weeklyChallenge.id);
    }
  }, [leaderboardFilter, activeGame, isLeaderboardOpen, activeLeaderboardType]);

  const fetchLeaderboard = async (force = false, specificChallengeId?: string) => {
    // Determine which ID to fetch based on active context or argument
    const targetChallengeId = specificChallengeId || (activeLeaderboardType === 'beauty_contest' ? 'beauty_contest' : weeklyChallenge.id);
    const isTargetWeekly = targetChallengeId !== 'beauty_contest';

    // Check cache logic
    const now = Date.now();
    if (!force && now - lastLeaderboardFetch.current < 5000 && !specificChallengeId) {
      // Allow skipping only if not fetching a specific parallel board
      if (targetChallengeId === activeLeaderboardType) return;
    }

    lastLeaderboardFetch.current = now;
    // FORZA FILTRO 'all' COME RICHIESTO
    const result = await getLeaderboard('all', 100, targetChallengeId);

    if (result.success && Array.isArray(result.leaderboard)) {
      let finalLeaderboard = result.leaderboard;

      // Merge local pending entry IF it matches the challenge
      // (Simplified: pending entry is usually just for standard contest, handling multiple pending is complex)
      // For now, assume pending is mainly for the main contest.
      if (!isTargetWeekly && pendingLocalEntry.current) {
        finalLeaderboard = finalLeaderboard.filter((p: any) => p.username !== pendingLocalEntry.current.username);
        finalLeaderboard = [pendingLocalEntry.current, ...finalLeaderboard].sort((a: any, b: any) => b.score - a.score);
      }

      console.log(`✅ Leaderboard [${targetChallengeId}] aggiornata:`, finalLeaderboard.length, "entries");

      if (isTargetWeekly) {
        setWeeklyLeaderboard(finalLeaderboard);
      } else {
        setLeaderboard(finalLeaderboard);
      }
    } else {
      console.error("❌ Errore fetch leaderboard:", result);
    }
  };

  const showDeleteConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmToast({
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmToast(null);
      },
      onCancel: () => setConfirmToast(null)
    });
  };

  const fetchCareHistory = async (id: string) => {
    setIsLoadingHistory(true);
    const res = await fetchCareEvents(id);
    if (res.success) setCareHistory(res.data);
    setIsLoadingHistory(false);
  };

  const fetchPhotos = async (id: string) => {
    setIsLoadingPhotos(true);
    const res = await fetchPlantPhotos(id);
    if (res.success) setPlantPhotos(res.data);
    setIsLoadingPhotos(false);
  };

  const registerAction = async (type: string, note?: string) => {
    if (!fullScreenAnalysis?.id || !username) return;
    const res = await addCareEvent(fullScreenAnalysis.id, username, type, note);
    if (res.success) {
      setAchievementToast(`Azione registrata: ${type === 'watering' ? 'Irrigazione 💧' : 'Controllo 📸'}`);
      fetchCareHistory(fullScreenAnalysis.id);

      // Se irrigo, sposto in avanti il prossimo controllo di default (es. 3 giorni)
      if (type === 'watering') {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 3);
        await updateUserPlant(username, fullScreenAnalysis.id, { next_check_at: nextDate.toISOString() });
      }

      // Aggiorna lista generale
      const freshPlants = await fetchUserPlants(username);
      if (freshPlants.success) setUserPlants(freshPlants.data);

      setTimeout(() => setAchievementToast(null), 3000);
    }
  };

  const handleChronicPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fullScreenAnalysis?.id || !username) return;

    setAchievementToast('⏳ Analisi e salvataggio evoluzione...');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await addPlantPhoto(fullScreenAnalysis.id, base64, "Check-in periodico", 100);
      if (res.success) {
        setAchievementToast('📸 Nuova foto salvata! Crescita registrata. 🌱');
        fetchPhotos(fullScreenAnalysis.id);

        // Aggiorna data prossimo controllo (es. tra 30 giorni)
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 30);
        await updateUserPlant(username, fullScreenAnalysis.id, { next_check_at: nextDate.toISOString() });

        const freshPlants = await fetchUserPlants(username);
        if (freshPlants.success) setUserPlants(freshPlants.data);

        setTimeout(() => setAchievementToast(null), 3000);
      } else {
        setAchievementToast('❌ Errore nel salvataggio della foto.');
        setTimeout(() => setAchievementToast(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    // Timer per nascondere
    const timer = setTimeout(() => setShowInstallHint(false), 7000);

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

  // Inizializza Light Sensor
  useEffect(() => {
    const initLightSensor = async () => {
      if ('AmbientLightSensor' in window) {
        try {
          const sensor = new (window as any).AmbientLightSensor({ frequency: 1 });
          sensor.addEventListener('reading', () => {
            setLightLevel(Math.round(sensor.illuminance));
          });
          sensor.addEventListener('error', (event: any) => {
            console.error('Light sensor error:', event.error);
          });
          lightSensorRef.current = sensor;
          setLightSensorSupported(true);
        } catch (error) {
          console.log('Light sensor not available:', error);
          setLightSensorSupported(false);
        }
      } else {
        console.log('AmbientLightSensor API not supported');
        setLightSensorSupported(false);
      }
    };

    initLightSensor();

    return () => {
      if (lightSensorRef.current) {
        lightSensorRef.current.stop();
      }
    };
  }, []);

  // Attiva/disattiva sensore con la camera
  useEffect(() => {
    if (isCameraOn && lightSensorRef.current) {
      try {
        lightSensorRef.current.start();
      } catch (e) {
        console.error('Failed to start light sensor:', e);
      }
    } else if (!isCameraOn && lightSensorRef.current) {
      try {
        lightSensorRef.current.stop();
        setLightLevel(null);
      } catch (e) {
        console.error('Failed to stop light sensor:', e);
      }
    }
  }, [isCameraOn]);

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
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('bio_xp');
    return saved ? parseInt(saved) : 0;
  });

  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem('bio_level');
    return saved ? parseInt(saved) : 1;
  });

  // SYNC XP WITH SERVER
  useEffect(() => {
    if (username) {
      console.log('🔄 Syncing user stats...', username);
      fetchUserInfo(username).then(info => {
        if (info && typeof info.xp === 'number') {
          setXp(currentXp => {
            const maxXp = Math.max(currentXp, info.xp);
            const maxLevel = Math.max(level, info.level || 1);

            // Se server ha più XP (es. premio domenica), aggiorna locale
            if (info.xp > currentXp) {
              console.log('🎁 Received XP from server:', info.xp);
              localStorage.setItem('bio_xp', info.xp.toString());
              return info.xp;
            }

            // Se locale ha più XP (gioco offline), pusha al server
            if (currentXp > info.xp) {
              console.log('☁️ Pushing local XP to server:', currentXp);
              updateUserInfo(username, currentXp, level);
            }

            return currentXp; // Mantieni locale (che è uguale o maggiore)
          });

          setLevel(currentLevel => {
            const srvLevel = info.level || 1;
            if (srvLevel > currentLevel) {
              localStorage.setItem('bio_level', srvLevel.toString());
              return srvLevel;
            }
            return currentLevel;
          });
        }
      });
    }
  }, [username]);
  const [history, setHistory] = useState<PlantAnalysis[]>(() => {
    try {
      const saved = localStorage.getItem('bio_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [totalScans, setTotalScans] = useState<number>(() => {
    const saved = localStorage.getItem('bio_totalScans');
    return saved ? parseInt(saved) : 0;
  });

  const [completedQuests, setCompletedQuests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bio_completedQuests');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('bio_history', JSON.stringify(history));
    localStorage.setItem('bio_messages', JSON.stringify(messages));
    localStorage.setItem('beauty_leaderboard', JSON.stringify(leaderboard));
    localStorage.setItem('bio_xp', xp.toString());
    localStorage.setItem('bio_level', level.toString());
    localStorage.setItem('bio_totalScans', totalScans.toString());
    localStorage.setItem('bio_completedQuests', JSON.stringify(completedQuests));
    localStorage.setItem('bio_questProgress', JSON.stringify(questProgress));
  }, [history, messages, leaderboard, xp, level, totalScans, completedQuests, questProgress]);

  // Auth check on mount with Session Timeout (48h)
  useEffect(() => {
    const lastSession = localStorage.getItem('last_session_ts');
    const now = Date.now();
    const MAX_INACTIVE_TIME = 48 * 60 * 60 * 1000; // 48 ore

    if (lastSession && (now - parseInt(lastSession) > MAX_INACTIVE_TIME)) {
      console.warn('⚠️ Sessione scaduta (48h). Logout automatico.');
      localStorage.removeItem('bio_username');
      setUsername(null);
      return;
    }

    // Update timestamp
    localStorage.setItem('last_session_ts', now.toString());

    const storedUsername = getLocalUsername();
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Fetch history when opening full screen
  useEffect(() => {
    if (fullScreenAnalysis?.id && fullScreenAnalysis.source === 'garden') {
      fetchCareHistory(fullScreenAnalysis.id);
      fetchPhotos(fullScreenAnalysis.id);

      // Carica programma di cura se esiste
      loadCareProgram(fullScreenAnalysis.id);
    }
  }, [fullScreenAnalysis?.id]);





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
    setXp(prevXp => {
      const newXp = prevXp + amount;
      // Calcolo livello basato su formula fissa: 1 livello ogni 1000 XP
      // Livello 1: 0-999, Livello 2: 1000-1999, ecc.
      const calculatedLevel = Math.floor(newXp / 1000) + 1;

      // Se il livello calcolato è superiore a quello attuale (level up)
      // Usiamo calculatedLevel per correggere eventuali disallineamenti precedenti
      if (calculatedLevel > level) {
        setLevel(calculatedLevel);
        localStorage.setItem('bio_level', calculatedLevel.toString());
        setAchievementToast(`🎉 Livello ${calculatedLevel} raggiunto!`);
        setTimeout(() => setAchievementToast(null), 3000);

        // Sync to server con nuovo livello
        if (username) {
          updateUserInfo(username, newXp, calculatedLevel);
        }
      } else {
        // Nessun cambio livello, aggiorna solo XP
        if (username) {
          updateUserInfo(username, newXp, level);
        }
      }
      return newXp;
    });
  };

  const checkQuests = (analysis: PlantAnalysis) => {
    const newCompleted: string[] = [];
    let xpGained = 0;

    QUESTS.forEach(q => {
      // Usa completedQuests invece di stats.completedQuests
      if (!completedQuests.includes(q.id)) {
        // Logica semplice di matching
        if (q.type === 'photo' && analysis.category && analysis.category.toLowerCase().includes(q.requirement.toLowerCase())) {
          newCompleted.push(q.id);
          xpGained += q.xp;
          setAchievementToast(`Missione Compiuta: ${q.title}!`);
          setTimeout(() => setAchievementToast(null), 4000);
        }
      }
    });

    if (newCompleted.length > 0) {
      // Aggiorna XP
      addXp(xpGained);

      // Aggiorna Quests
      const updatedQuests = [...completedQuests, ...newCompleted];
      setCompletedQuests(updatedQuests);
      localStorage.setItem('bio_completedQuests', JSON.stringify(updatedQuests));
    }
  };

  const startGame = (questId: string) => {
    // 0. Blocco Domenicale per Beauty Contest (eccetto Weekly)
    const isSunday = new Date().getDay() === 0;
    if (questId === 'beauty_contest' && isSunday) {
      setAchievementToast("⛔ La competizione è chiusa la Domenica! Si riparte Lunedì.");
      setTimeout(() => setAchievementToast(null), 5000);
      return; // Blocca avvio
    }

    // Blocca se non loggato
    if (!username) {
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
      if (!GEMINI_KEY) {
        alert("Chiave API mancante! Controlla la console.");
        return;
      }
      const isWeekly = activeGame?.startsWith('weekly_');
      const info = QUESTS.find(q => q.id === activeGame);

      let prompt = 'Analizza l\'immagine. DEVE contenere una pianta, un fiore, un fungo o un elemento botanico naturale. Se l\'immagine è un selfie, una persona, un animale, un oggetto non botanico o è inappropriata, imposta "is_valid" a false. Se è valida, identifica la pianta e valuta la sua bellezza estetica da 1 a 100. Restituisci JSON.';

      if (isWeekly && info) {
        prompt = `Questa sfida richiede specificamente: ${info.requirement}. Analizza l'immagine. DEVE contenere: ${info.requirement}. Se l'immagine NON contiene ${info.requirement} o è inappropriata/selfie, imposta "is_valid" a false. Se valida, valuta bellezza da 1 a 100. Restituisci JSON.`;
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: photo.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              plant_name: { type: Type.STRING },
              is_valid: { type: Type.BOOLEAN },
              rejection_reason: { type: Type.STRING }
            },
            required: ['score', 'plant_name', 'is_valid']
          }
        }
      });
      const data = JSON.parse(res.text || '{}');

      if (data.is_valid === false) {
        setAchievementToast(`⛔ Foto Rifiutata: ${data.rejection_reason || 'Soggetto non pertinente!'}`);
        setTimeout(() => setAchievementToast(null), 4000);
        // Non chiudere tutto, permetti di riprovare
        setQuestPhoto(null);
        setIsCameraOn(true);
        return;
      }

      const score = data.score || 50;
      const name = data.plant_name || '';

      console.log('📊 Punteggio AI:', score, name);

      setBeautyScore(score);
      setBeautyPlantName(name);
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

      // 2. Salva su Vercel
      // 2. Salva su Vercel
      // Fallback robusto se username è null/undefined
      const currentUsername = username && username.trim() !== '' ? username : `Utente${Math.floor(Math.random() * 10000)}`;

      console.log('💾 Tentativo salvataggio su Vercel...', { username: currentUsername, score: beautyScore });

      // Determine challenge ID based on active game
      const challengeId = activeGame === 'beauty_contest' ? 'beauty_contest' : weeklyChallenge.id;

      const result = await saveBeautyScore(currentUsername, beautyScore, questPhoto, beautyPlantName, challengeId);

      // Prepara l'entry ORA per la UI ottimistica
      const newEntry = {
        username: currentUsername,
        score: beautyScore,
        timestamp: Date.now(),
        created_at: new Date().toISOString(),
        image: questPhoto, // Fallback visivo immediato
        image_url: questPhoto,
        plant_name: beautyPlantName
      };

      if (result.success) {
        setLeaderboardFilter('all');
        if (result.data?.url) {
          newEntry.image_url = result.data.url;
          newEntry.image = result.data.url;
        }
        pendingLocalEntry.current = newEntry; // Pin locale
        localStorage.setItem('pendingBeautyEntry', JSON.stringify(newEntry));

        // AGGIORNAMENTO LOCALE (NON chiamare fetchLeaderboard subito)
        setLeaderboard(prev => {
          const filtered = prev.filter(p => p.username !== currentUsername);
          return [newEntry, ...filtered].sort((a, b) => b.score - a.score).slice(0, 100);
        });

        setAchievementToast('Punteggio Pubblicato! 🏆');
        setTimeout(() => setAchievementToast(null), 3000);
        setActiveGame(null);
        setIsLeaderboardOpen(true);
      } else {
        if (result.isSunday) {
          setAchievementToast('🏆 Classifica chiusa la domenica!');
        } else {
          setAchievementToast(`⚠️ Errore: ${result.error || 'Sconosciuto'} (Salvato Locale)`);
        }
        pendingLocalEntry.current = newEntry; // Pin locale comunque
        localStorage.setItem('pendingBeautyEntry', JSON.stringify(newEntry));

        // INSERISCI COMUNQUE IN LOCALE
        setLeaderboard(prev => {
          const filtered = prev.filter(p => p.username !== currentUsername);
          return [newEntry, ...filtered].sort((a, b) => b.score - a.score).slice(0, 100);
        });

        setActiveGame(null);
        setIsLeaderboardOpen(true);
      }
    } catch (authError) {
      console.error(authError);
      alert("Errore salvataggio punteggio");
    }
  };

  const generateQuestQuestions = async (photo: string) => {
    try {
      const quest = QUESTS.find(q => q.id === activeGame);
      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

      const prompt = `La sfida è fotografare: ${quest?.requirement}.
      Analizza l'immagine. 
      Se l'immagine NON contiene ${quest?.requirement} o è inappropriata, un selfie, o sfocata, imposta "is_valid" a false e spiega perché.
      Se l'immagine è valida, imposta "is_valid" a true e genera 3 domande educative specifiche (con 4 opzioni e indice corretta).`;

      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: photo.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              is_valid: { type: Type.BOOLEAN },
              rejection_reason: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correct: { type: Type.NUMBER }
                  }
                }
              }
            },
            required: ['is_valid']
          }
        }
      });

      const data = JSON.parse(res.text || '{}');

      if (data.is_valid === false) {
        setAchievementToast(`⛔ Foto non valida: ${data.rejection_reason || 'Riprova!'}`);
        setTimeout(() => setAchievementToast(null), 4000);
        setQuestPhoto(null);
        setIsCameraOn(true);
        return;
      }

      const questions = data.questions || [];
      if (questions.length === 0) {
        // Fallback
        throw new Error("Nessuna domanda generata");
      }

      setQuestQuestions(questions.slice(0, 3));
      setIsGamesOpen(true);
    } catch (e) {
      console.error(e);
      alert('Errore generazione domande o validazione.');
      setQuestPhoto(null);
      setIsCameraOn(true);
    }
  };

  const answerQuestion = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const quest = QUESTS.find(q => q.id === activeGame);
    let questions;
    if (quest?.id === 'general_quiz_2') questions = QUIZ_QUESTIONS_2;
    else if (quest?.id === 'general_quiz_3') questions = QUIZ_QUESTIONS_3;
    else questions = quest?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions;

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
    let questions;
    if (quest?.id === 'general_quiz_2') questions = QUIZ_QUESTIONS_2;
    else if (quest?.id === 'general_quiz_3') questions = QUIZ_QUESTIONS_3;
    else questions = quest?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions;

    const requiredScore = quest?.type === 'quiz' ? 5 : 2; // Quiz generale richiede 5/8, foto quiz 2/3
    const xpEarned = gameScore * 10;
    addXp(xpEarned);

    if (activeGame && !completedQuests.includes(activeGame)) {
      if (quest && gameScore >= requiredScore) {
        // Aggiorna progresso per sfide multi-foto
        if (quest.count) {
          const progress = (questProgress[activeGame] || 0) + 1;
          setQuestProgress(prev => ({ ...prev, [activeGame!]: progress }));
          if (progress >= quest.count) {
            const updated = [...completedQuests, activeGame!];
            setCompletedQuests(updated);
            localStorage.setItem('bio_completedQuests', JSON.stringify(updated));

            setAchievementToast(`Missione Completata: ${quest.title}! +${quest.xp} XP`);
            addXp(quest.xp);
            setTimeout(() => setAchievementToast(null), 4000);
          } else {
            setAchievementToast(`Progresso: ${progress}/${quest.count} ${quest.requirement}`);
            setTimeout(() => setAchievementToast(null), 3000);
          }
        } else {
          const updated = [...completedQuests, activeGame!];
          setCompletedQuests(updated);
          localStorage.setItem('bio_completedQuests', JSON.stringify(updated));

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

  const capture = async () => {
    // ========== MODALITÀ CHECKPOINT ==========
    if (isCheckpointMode) {
      if (!videoRef.current || !canvasRef.current) return;

      const c = canvasRef.current;
      const v = videoRef.current;
      const size = Math.min(v.videoWidth, v.videoHeight);
      const startX = (v.videoWidth - size) / 2;
      const startY = (v.videoHeight - size) / 2;
      c.width = 1024;
      c.height = 1024;
      c.getContext('2d')?.drawImage(v, startX, startY, size, size, 0, 0, 1024, 1024);
      const photo = c.toDataURL('image/jpeg');

      setIsCameraOn(false);
      setIsAnalyzing(true);

      try {
        // Analisi AI
        const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
        const res = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: {
            parts: [
              { inlineData: { data: photo.split(',')[1], mimeType: 'image/jpeg' } },
              { text: "Analizza questa pianta. Restituisci JSON con: healthScore (0-100), improvements (array di miglioramenti rilevati), recommendations (consigli)." }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                healthScore: { type: Type.NUMBER },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.STRING }
              }
            }
          }
        });

        const aiAnalysis = JSON.parse(res.text || '{}');

        // Se è il primo checkpoint (creazione programma)
        if (!activeCareProgram && fullScreenAnalysis) {
          const result = await createCareProgram(
            fullScreenAnalysis.id,
            username!,
            aiAnalysis.healthScore,
            lightLevel || 0,
            photo,
            fullScreenAnalysis.name,
            fullScreenAnalysis.scientificName
          );

          if (result.success) {
            setAchievementToast('🎉 Programma di cura creato con successo!');
            await loadCareProgram(fullScreenAnalysis.id);
          }
        } else if (currentCheckpoint) {
          // Completa checkpoint esistente
          const result = await completeCheckpoint(
            currentCheckpoint.id,
            photo,
            lightLevel || 0,
            aiAnalysis
          );

          if (result.success) {
            setAchievementToast(result.message || '✅ Checkpoint completato!');
            if (fullScreenAnalysis) {
              await loadCareProgram(fullScreenAnalysis.id);
            }
          }
        }

        setIsCheckpointMode(false);
        setCurrentCheckpoint(null);
        setActiveMode('garden');

      } catch (e) {
        alert("Errore analisi checkpoint.");
      } finally {
        setIsAnalyzing(false);
      }

      return;
    }
    // ========== FINE MODALITÀ CHECKPOINT ==========

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
      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
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
      const entry: PlantAnalysis = { ...data, id: crypto.randomUUID(), timestamp: Date.now(), image: capturedImg, source: 'analysis' };
      setMessages(prev => [...prev, { role: 'analysis', data: entry }]);
      setHistory(prev => [entry, ...prev]);
      addXp(30);
      checkQuests(entry); // Verifica completamento missioni
      setCapturedImg(null);
      setActiveMode('chat');

      // AUTO-PROMPT ONLY IF INITIATED FROM GARDEN ADD FLOW
      if (username && isGardenScanning) {
        setPendingPlant(entry);
        setShowAddToGardenConfirm(true);
        setIsGardenScanning(false); // Reset flag
      } else {
        // Explicitly ensure prompt is OFF for normal scans
        setShowAddToGardenConfirm(false);
      }
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
      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
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

      {/* Elementi 3D Fluttuanti */}
      <div className="floating-element floating-element-1"></div>
      <div className="floating-element floating-element-2"></div>
      <div className="floating-element floating-element-3"></div>
      <div className="floating-element floating-element-4"></div>

      {/* Ombre Botaniche */}
      <div className="botanical-shadow botanical-shadow-1"></div>
      <div className="botanical-shadow botanical-shadow-2"></div>
      <div className="botanical-shadow botanical-shadow-3"></div>

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
          </div>
          <button onClick={() => setShowInstallHint(false)} style={{ background: 'transparent', border: 'none', color: 'white', opacity: 0.6, padding: 8, cursor: 'pointer' }}><X size={20} /></button>
        </div>
      )}

      {/* Palline Fluttuanti Sullo Sfondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Pallina Verde Grande */}
        <div style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(139, 195, 74, 0.3), rgba(139, 195, 74, 0.05))',
          top: '15%',
          left: '10%',
          animation: 'float3d 20s ease-in-out infinite',
          filter: 'blur(40px)'
        }}></div>
        {/* Pallina Gialla Media */}
        <div style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 235, 59, 0.25), rgba(255, 235, 59, 0.03))',
          top: '60%',
          right: '15%',
          animation: 'float3dAlt 25s ease-in-out infinite 5s',
          filter: 'blur(30px)'
        }}></div>
        {/* Pallina Verde Chiaro Piccola */}
        <div style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(174, 213, 129, 0.35), rgba(174, 213, 129, 0.05))',
          bottom: '25%',
          left: '20%',
          animation: 'float3dAlt2 18s ease-in-out infinite 10s',
          filter: 'blur(25px)'
        }}></div>
        {/* Pallina Verde Scuro */}
        <div style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(46, 125, 50, 0.2), rgba(46, 125, 50, 0.02))',
          top: '40%',
          right: '8%',
          animation: 'float3dAlt3 22s ease-in-out infinite 3s',
          filter: 'blur(35px)'
        }}></div>
        {/* Pallina Lime */}
        <div style={{
          position: 'absolute',
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(205, 220, 57, 0.3), rgba(205, 220, 57, 0.04))',
          bottom: '15%',
          right: '25%',
          animation: 'float3d 28s ease-in-out infinite 7s',
          filter: 'blur(28px)'
        }}></div>
      </div>

      <header style={{
        background: 'transparent',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        position: 'relative'
      }}>
        <div className="logo" onClick={() => { setActiveMode('scan'); setIsCameraOn(true); }} style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {/* Logo Minimal senza sfondo */}
          <Sprout size={24} color="#2E7D32" strokeWidth={2.5} />
          <h1 style={{
            color: '#1B5E20',
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: 800,
            letterSpacing: '-0.02em'
          }}>BioExpert</h1>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div className="badge-xp-large" style={{
            background: '#FFD700',
            color: '#333',
            fontWeight: 900,
            padding: '4px 10px',
            borderRadius: 16,
            fontSize: '0.7rem',
            boxShadow: '0 2px 6px rgba(255, 215, 0, 0.3)',
            border: 'none',
            marginRight: 2
          }}>LV.{level}</div>

          {/* Pulsanti Circolari Minimal */}
          {[
            { icon: <Trophy size={16} />, action: () => setIsLeaderboardOpen(true) },
            { icon: <History size={16} />, action: () => setIsHistoryOpen(true) },
            { icon: <Gamepad2 size={16} />, action: () => setIsGamesOpen(true) },
            { icon: <Settings size={16} />, action: () => setIsSettingsOpen(true) }
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'white',
              border: '1px solid #A5D6A7',
              color: '#2E7D32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              padding: 0
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </header>

      <div className="main-frame">
        <div className="frame-inner">
          {activeMode === 'garden' ? (
            <div style={{ height: '100%', width: '100%', background: 'var(--bg-warm)', overflowY: 'auto', padding: 20 }}>
              <h2 style={{ color: 'var(--primary)', marginTop: 0, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Sprout size={28} /> Il Mio Giardino
              </h2>

              {!username ? (
                <div style={{ textAlign: 'center', marginTop: 40, padding: 20, background: 'var(--white)', borderRadius: 24, border: '1px solid var(--card-border)' }}>
                  <h3 style={{ marginTop: 0 }}>Però... chi sei? 🤔</h3>
                  <p style={{ opacity: 0.7, lineHeight: 1.5 }}>Per creare il tuo giardino digitale e salvare le tue piante, devi registrarti o accedere.</p>
                  <button onClick={() => setShowAuthModal(true)} style={{ marginTop: 10, background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 100, fontWeight: 800 }}>ACCEDI ORA</button>
                </div>
              ) : userPlants.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <div style={{ opacity: 0.3 }}><Sprout size={64} /></div>
                  <h3 style={{ opacity: 0.5 }}>Il tuo giardino è vuoto</h3>
                  <p style={{ opacity: 0.5 }}>Scatta una foto a una pianta e salvala qui!</p>
                  <button onClick={() => setActiveMode('scan')} style={{ marginTop: 20, background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '12px 24px', borderRadius: 100, fontWeight: 800 }}>VAI ALLA FOTOCAMERA</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button onClick={() => { setActiveMode('scan'); setIsCameraOn(true); setIsGardenScanning(true); }} style={{ gridColumn: '1 / -1', padding: 16, border: '2px dashed var(--primary)', borderRadius: 20, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Plus size={20} /> AGGIUNGI NUOVA PIANTA
                  </button>
                  {userPlants.map((plant: any) => (
                    <div key={plant.id} onClick={() => setFullScreenAnalysis({
                      id: plant.id,
                      name: plant.plant_name,
                      scientificName: plant.scientific_name,
                      image: plant.image_url,
                      healthStatus: (plant.health_status || 'healthy') as 'healthy' | 'sick' | 'unknown',
                      diagnosis: 'Vedi Piano Cura per dettagli',
                      carePlan: plant.notes,
                      care: {
                        watering: plant.watering_guide || 'Controlla il terreno regolarmente',
                        general: plant.sunlight_guide || 'Posiziona in zona luminosa',
                        pruning: plant.pruning_guide || 'Rimuovi foglie secche all\'occorrenza',
                        repotting: plant.repotting_guide || 'Valuta ogni 2 anni'
                      },
                      lastCareAt: plant.last_care_at ? new Date(plant.last_care_at).getTime() : undefined,
                      nextCheckAt: plant.next_check_at ? new Date(plant.next_check_at).getTime() : undefined,
                      timestamp: new Date(plant.created_at).getTime(),
                      category: 'Pianta',
                      source: 'garden'
                    })}
                      style={{ background: 'var(--white)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', cursor: 'pointer', position: 'relative' }}>

                      {/* Badge Urgenza Cura con Livelli */}
                      {plant.next_check_at && (() => {
                        const daysOverdue = Math.floor((Date.now() - new Date(plant.next_check_at).getTime()) / (1000 * 60 * 60 * 24));

                        if (daysOverdue >= 7) {
                          // Rosso: 7+ giorni di ritardo
                          return (
                            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: '#d32f2f', color: 'white', padding: '6px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 4px 8px rgba(211,47,47,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AlertTriangle size={12} /> URGENTE ({daysOverdue}g)
                            </div>
                          );
                        } else if (daysOverdue >= 3) {
                          // Arancione: 3-6 giorni di ritardo
                          return (
                            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: '#f57c00', color: 'white', padding: '6px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 4px 8px rgba(245,124,0,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={12} /> ATTENZIONE ({daysOverdue}g)
                            </div>
                          );
                        } else if (daysOverdue >= 0) {
                          // Giallo: 0-2 giorni di ritardo
                          return (
                            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: '#fbc02d', color: '#333', padding: '6px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 4px 8px rgba(251,192,45,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Droplets size={12} /> DA CURARE
                            </div>
                          );
                        } else if (daysOverdue >= -2) {
                          // Verde chiaro: prossimi 2 giorni
                          return (
                            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: '#66bb6a', color: 'white', padding: '6px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 4px 8px rgba(102,187,106,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} /> PROSSIMAMENTE
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div style={{ height: 120, background: '#eee', position: 'relative' }}>
                        <img src={plant.image_url || 'https://placehold.co/400x300?text=Pianta'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                        {!plant.image_url && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}><Sprout size={32} /></div>}
                        <div style={{ position: 'absolute', top: 8, right: 8, background: plant.health_status === 'sick' ? '#ffebee' : '#e8f5e9', padding: '4px 8px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800, color: plant.health_status === 'sick' ? '#d32f2f' : '#2e7d32' }}>
                          {plant.health_status === 'sick' ? 'MALATA' : 'SANA'}
                        </div>
                      </div>
                      <div style={{ padding: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 2 }}>{plant.nickname || plant.plant_name}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic', marginBottom: 8 }}>{plant.scientific_name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, opacity: 0.5 }}>
                            <Droplets size={14} />
                            <Sun size={14} />
                          </div>
                          {plant.next_check_at && (
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>
                              {new Date(plant.next_check_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeMode === 'scan' ? (
            <div style={{ height: '100%', width: '100%', position: 'relative' }}>
              {cameraError ? (
                <div className="camera-error-view" style={{ textAlign: 'center', color: 'white', padding: 40 }}><ShieldAlert size={64} color="var(--danger)" /><h3>Errore Camera</h3></div>
              ) : capturedImg ? (
                <div className="preview-container">
                  <img src={capturedImg} className="preview-image" />
                  {!isAnalyzing && <button onClick={performAnalysis} style={{ position: 'absolute', bottom: 140, left: '50%', transform: 'translateX(-50%)', padding: '16px 32px', background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', color: 'white', border: 'none', borderRadius: 100, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(46, 125, 50, 0.4)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 120 }}><Sparkles size={24} /> ANALIZZA ORA</button>}
                  {isAnalyzing && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'rgba(0,0,0,0.7)' }}><RefreshCw className="spin" size={40} /></div>}
                </div>
              ) : isCameraOn ? (
                <>
                  <video ref={videoRef} className="camera-video" autoPlay playsInline muted />

                  {/* Luxmetro Overlay */}
                  {lightLevel !== null && (
                    <div style={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      right: 20,
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 16,
                      padding: '12px 16px',
                      color: 'white',
                      zIndex: 110,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Sun size={24} color="#FFD700" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                            Intensità Luminosa
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            {lightLevel}
                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>lux</span>
                          </div>
                        </div>
                        <div style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          background: lightLevel < 100 ? '#d32f2f' :
                            lightLevel < 500 ? '#f57c00' :
                              lightLevel < 1000 ? '#fbc02d' :
                                lightLevel < 10000 ? '#66bb6a' : '#2e7d32',
                          color: 'white'
                        }}>
                          {lightLevel < 100 ? '🌑 BUIO' :
                            lightLevel < 500 ? '🌙 OMBRA' :
                              lightLevel < 1000 ? '☁️ NUVOLOSO' :
                                lightLevel < 10000 ? '🌤️ LUMINOSO' : '☀️ PIENO SOLE'}
                        </div>
                      </div>
                      <div style={{
                        marginTop: 8,
                        fontSize: '0.7rem',
                        opacity: 0.8,
                        lineHeight: 1.4,
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: 8
                      }}>
                        💡 {lightLevel < 100 ? 'Troppo buio per le piante. Cerca più luce!' :
                          lightLevel < 500 ? 'Adatto per piante da ombra (Pothos, Sansevieria)' :
                            lightLevel < 1000 ? 'Luce indiretta ideale per molte piante d\'appartamento' :
                              lightLevel < 10000 ? 'Ottimo per piante che amano la luce!' :
                                'Luce diretta intensa - perfetto per succulente e cactus!'}
                      </div>
                    </div>
                  )}

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
                  <div style={{ position: 'absolute', bottom: 140, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 120 }}>
                    <button onClick={capture} style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', border: '6px solid rgba(255,255,255,0.3)', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'white', border: '2px solid #333' }}></div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="camera-off-overlay" style={{
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  padding: 0,
                  overflow: 'visible', /* Permette ombre */
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none'
                }}>
                  {/* MAIN WHITE CARD CONTAINER - Home View */}
                  <div className="home-main-card" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    borderRadius: 48,
                    margin: '0 15px',
                    padding: '20px 24px',
                    position: 'relative',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)',
                    overflow: 'auto',
                    maxHeight: 'calc(100vh - 220px)',
                    marginBottom: 0,
                    border: 'none',
                    outline: 'none'
                  }}>
                    {/* Background Texture Topografica */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
                      <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="none">
                        <path d="M0,100 Q100,50 200,100 T400,100" fill="none" stroke="#2E7D32" strokeWidth="2" />
                        <path d="M0,200 Q150,150 250,200 T400,180" fill="none" stroke="#2E7D32" strokeWidth="2" />
                        <path d="M400,300 Q250,350 100,300 T0,350" fill="none" stroke="#2E7D32" strokeWidth="2" />
                        <path d="M400,500 Q200,450 100,550 T0,500" fill="none" stroke="#2E7D32" strokeWidth="2" />
                        <path d="M200,0 Q250,100 200,200" fill="none" stroke="#2E7D32" strokeWidth="2" />
                      </svg>
                    </div>

                    {/* Palline Decorative Verdi Sfumate */}
                    <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 195, 74, 0.4) 0%, rgba(139, 195, 74, 0) 70%)', top: '45%', right: '5%', zIndex: 1, filter: 'blur(20px)' }}></div>
                    <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 195, 74, 0.3) 0%, rgba(139, 195, 74, 0) 70%)', bottom: '35%', left: '8%', zIndex: 1, filter: 'blur(15px)' }}></div>
                    <div style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 235, 59, 0.5) 0%, rgba(255, 235, 59, 0) 70%)', top: '65%', left: '5%', zIndex: 1, filter: 'blur(10px)' }}></div>

                    {/* Mirino Curvo Top-Left - Ridotto per mobile */}
                    <svg width="40" height="40" viewBox="0 0 60 60" style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                      <path d="M 5 55 Q 5 5 55 5" fill="none" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
                    </svg>

                    {/* Mirino Curvo Bottom-Right - Ridotto per mobile */}
                    <svg width="40" height="40" viewBox="0 0 60 60" style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10 }}>
                      <path d="M 55 5 Q 55 55 5 55" fill="none" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
                    </svg>


                    {/* Logo Centrale con Icona Foglia */}
                    <div style={{ marginTop: 50, textAlign: 'center', marginBottom: 20, zIndex: 2 }}>
                      {/* Icona Foglia Stilizzata (Simile a immagine) */}
                      <div style={{ display: 'inline-block', marginBottom: 10 }}>
                        <Sprout size={72} color="#33691E" strokeWidth={2.5} />
                      </div>
                      <h1 style={{ margin: 0, color: '#1B5E20', fontSize: '2.4rem', letterSpacing: '-0.03em', fontWeight: 800, fontFamily: 'sans-serif' }}>BIOEXPERT</h1>
                    </div>

                    {/* Box Curiosità Beige (Floating) */}
                    <div style={{
                      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
                      borderRadius: 24,
                      padding: '24px 20px',
                      position: 'relative',
                      marginBottom: 20,
                      boxShadow: '0 15px 35px rgba(255, 236, 179, 0.8), 0 5px 15px rgba(255, 160, 0, 0.1)', /* Ombra calda */
                      zIndex: 2,
                      border: 'none', /* RIMOSSO BORDO BIANCO */
                      outline: 'none'
                    }}>
                      {/* Decorazione Orchidea Outline (Left) */}
                      <div style={{ position: 'absolute', left: -10, bottom: -10, opacity: 0.15, transform: 'rotate(-10deg)' }}>
                        <Flower2 size={100} color="#E65100" strokeWidth={0.8} />
                      </div>
                      {/* Decorazione Ape Outline (Right) */}
                      <div style={{ position: 'absolute', right: 5, top: 5, opacity: 0.2 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12a4 4 0 1 1 8 0" /><path d="M12 7V3" /><path d="M9 4.5 10.5 6" /><path d="M15 4.5 13.5 6" /><path d="M20 12h-2" /><path d="M6 12H4" /><path d="M4 16c1 .5 2 .5 2 0" /><path d="M20 16c-1 .5-2 .5-2 0" /></svg>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8, color: '#333', fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <Sparkles size={14} fill="#333" /> LO SAPEVI CHE?
                      </div>
                      <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.4, color: '#3E2723', fontStyle: 'italic', fontWeight: 600, textAlign: 'center', fontFamily: 'serif' }}>
                        "{currentTip}"
                      </p>
                    </div>

                    {/* Refresh Button (Pillola Bianca Pulita) */}
                    <button
                      onClick={() => setCurrentTip(BIO_TIPS[Math.floor(Math.random() * BIO_TIPS.length)])}
                      style={{
                        margin: '0 auto',
                        background: 'white',
                        border: '1px solid #A5D6A7',
                        color: '#2E7D32',
                        padding: '10px 24px',
                        borderRadius: 100,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)', /* Ombra verde */
                        transition: 'all 0.2s',
                        zIndex: 2,
                        marginBottom: 'auto', /* Spinge i bottoni in fondo alla card */
                        outline: 'none'
                      }}
                    >
                      <RefreshCw size={14} /> Altra curiosità
                    </button>

                    {/* GLOSSY ACTION BUTTONS */}
                    <div style={{
                      marginTop: 20,
                      display: 'flex',
                      gap: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingBottom: 100,
                      zIndex: 2
                    }}>
                      {/* Camera Button: GLOSSY DEEP GREEN */}
                      <button
                        onClick={() => setIsCameraOn(true)}
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: '50%',
                          /* Gradiente complesso per effetto sferico/glossy */
                          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%), linear-gradient(145deg, #2E7D32 0%, #1B5E20 100%)',
                          border: 'none',
                          outline: 'none',
                          color: 'white',
                          boxShadow: '0 20px 40px rgba(27, 94, 32, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Camera size={64} strokeWidth={2.5} />
                      </button>

                      {/* Gallery Button: GLOSSY LIME/YELLOW */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: '50%',
                          /* Gradiente Giallo/Lime Glossy */
                          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 40%), linear-gradient(145deg, #E6EE9C 0%, #9CCC65 100%)',
                          border: 'none',
                          outline: 'none',
                          color: '#1B5E20', /* Icona Verde Scuro su sfondo chiaro */
                          boxShadow: '0 20px 40px rgba(139, 195, 74, 0.4), inset 0 2px 4px rgba(255,255,255,0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Upload size={64} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
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
                    <button className="quick-reply-chip" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--primary)' }} onClick={() => setFullScreenAnalysis({ ...m.data!, source: 'analysis' })}><Maximize2 size={14} /> VEDI DETTAGLI E CURA</button>
                    {username && (
                      <button className="quick-reply-chip" style={{ width: '100%', justifyContent: 'center', marginTop: 8, background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }} onClick={async (e) => {
                        const btn = e.currentTarget;
                        btn.innerHTML = '⏳ Salvataggio...';
                        btn.disabled = true;
                        try {
                          const res = await addUserPlant(username, {
                            plant_name: m.data.name,
                            scientific_name: m.data.scientificName,
                            imageBase64: m.data.image,
                            diagnosis: m.data.diagnosis
                          });
                          if (res.success) {
                            btn.innerHTML = '✅ Salvato!';
                            btn.style.background = '#e8f5e9';
                            btn.style.color = '#2e7d32';
                          } else {
                            btn.innerHTML = '❌ Errore';
                            btn.disabled = false;
                          }
                        } catch (err) {
                          console.error(err);
                          btn.innerHTML = '❌ Errore';
                          btn.disabled = false;
                        }
                      }}>
                        <Plus size={14} style={{ marginRight: 6 }} /> AGGIUNGI AL GIARDINO
                      </button>
                    )}
                  </div>
                ) : (
                  <div key={i} className={`msg msg-${m.role}`}>{m.text}</div>
                )
              ))}
              {isChatLoading && <div className="msg msg-bot" style={{ opacity: 0.5 }}><RefreshCw size={14} className="spin" /> Sto pensando...</div>}
            </div>
          )}
        </div>

        {
          activeMode === 'chat' && (
            <>
              <div className="quick-replies-container">
                {quickReplies.map((q, idx) => (
                  <button key={idx} className="quick-reply-chip" onClick={() => sendMessage(q)}>
                    <HelpCircle size={14} /> {q}
                  </button>
                ))}
              </div>
              <div className="chat-input-row" style={{ marginBottom: 120 }}>
                <input className="input-field" placeholder="Chiedi a BioExpert..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button className="btn-header-icon" style={{ background: 'var(--primary)', color: 'white', width: 44, height: 44 }} onClick={() => sendMessage()}><Send size={18} /></button>
              </div>
            </>
          )
        }
      </div >

      {/* PLANT DETAIL PAGE - Full Screen Modal */}
      {fullScreenAnalysis && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'white',
          zIndex: 2000,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header Verde */}
          <div style={{
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            padding: '16px 20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <button onClick={() => setFullScreenAnalysis(null)} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}>
              <ChevronLeft size={24} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sprout size={24} />
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{fullScreenAnalysis.name}</h2>
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, fontStyle: 'italic' }}>{fullScreenAnalysis.scientificName}</div>
            </div>
            {/* Campanella Notifiche */}
            <button onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
            }} style={{
              background: notificationsEnabled ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: notificationsEnabled ? '#FFD700' : 'white'
            }}>
              <Bell size={20} />
            </button>
          </div>

          {/* Foto Pianta */}
          <div style={{ position: 'relative', height: 300, background: '#f5f5f5' }}>
            <img
              src={fullScreenAnalysis.image || 'https://placehold.co/600x400?text=Pianta'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: fullScreenAnalysis.healthStatus === 'sick' ? '#ffebee' : '#e8f5e9',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 800,
              color: fullScreenAnalysis.healthStatus === 'sick' ? '#d32f2f' : '#2e7d32',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {fullScreenAnalysis.healthStatus === 'sick' ? 'MALATA' : 'SANA'}
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '16px 20px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {['INFO', 'CURA'].map((tab) => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab.toLowerCase() as any)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: detailTab === tab.toLowerCase() ? '#2E7D32' : 'transparent',
                  color: detailTab === tab.toLowerCase() ? 'white' : '#666',
                  border: detailTab === tab.toLowerCase() ? 'none' : '1px solid #e0e0e0',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, padding: '20px', paddingBottom: 20, overflow: 'auto' }}>
            {detailTab === 'info' && (
              <>
                {/* Diagnosi */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#2E7D32' }}>
                    <ShieldCheck size={20} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Diagnosi</h3>
                  </div>
                  <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>{fullScreenAnalysis.diagnosis}</p>
                </div>

                {/* Consigli Rapidi */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#d32f2f' }}>
                    <Heart size={20} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Consigli Rapidi</h3>
                  </div>

                  {/* Irrigazione */}
                  <div style={{
                    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                    borderRadius: 16,
                    padding: '16px',
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#1B5E20' }}>
                      <Droplets size={18} />
                      <strong style={{ fontSize: '0.9rem' }}>Irrigazione</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#2E7D32' }}>{fullScreenAnalysis.care?.watering}</p>
                  </div>

                  {/* Esposizione */}
                  <div style={{
                    background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
                    borderRadius: 16,
                    padding: '16px',
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#E65100' }}>
                      <Sun size={18} />
                      <strong style={{ fontSize: '0.9rem' }}>Esposizione</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#F57C00' }}>{fullScreenAnalysis.care?.general}</p>
                  </div>

                  {/* Potatura */}
                  <div style={{
                    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                    borderRadius: 16,
                    padding: '16px',
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#1B5E20' }}>
                      <Scissors size={18} />
                      <strong style={{ fontSize: '0.9rem' }}>Potatura</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#2E7D32' }}>{fullScreenAnalysis.care?.pruning}</p>
                  </div>

                  {/* Rinvaso */}
                  <div style={{
                    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                    borderRadius: 16,
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#1B5E20' }}>
                      <Package size={18} />
                      <strong style={{ fontSize: '0.9rem' }}>Rinvaso</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#2E7D32' }}>{fullScreenAnalysis.care?.repotting}</p>
                  </div>

                  {/* Luxometro */}
                  {lightLevel !== null && (
                    <div style={{
                      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
                      borderRadius: 16,
                      padding: '16px',
                      marginTop: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#E65100' }}>
                        <Sun size={18} />
                        <strong style={{ fontSize: '0.9rem' }}>Luce Ambiente</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#F57C00' }}>
                        {lightLevel.toFixed(0)} lux
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#666' }}>
                        {lightLevel < 100 ? '🌑 Molto buio' : lightLevel < 500 ? '🌙 Ombra' : lightLevel < 1000 ? '☁️ Luce indiretta' : lightLevel < 5000 ? '⛅ Luminoso' : '☀️ Pieno sole'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {detailTab === 'cura' && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <Calendar size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <p>Piano di cura in arrivo...</p>
              </div>
            )}

            {detailTab === 'album' && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <p>Album foto in arrivo...</p>
              </div>
            )}
          </div>

          {/* Pulsante RIMUOVI Fluttuante */}
          <button
            onClick={() => {
              setConfirmToast({
                message: '🗑️ Vuoi davvero rimuovere questa pianta dal giardino?',
                onConfirm: async () => {
                  try {
                    if (fullScreenAnalysis.id) {
                      await deleteUserPlant(fullScreenAnalysis.id);
                      showToast('✅ Pianta rimossa dal giardino', 'success');
                      setFullScreenAnalysis(null);
                      // Refresh plant list
                      const plants = await fetchUserPlants();
                      setUserPlants(plants);
                    }
                  } catch (error) {
                    showToast('❌ Errore durante la rimozione', 'error');
                  }
                  setConfirmToast(null);
                },
                onCancel: () => setConfirmToast(null)
              });
            }}
            style={{
              position: 'fixed',
              bottom: 120,
              right: 20,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
              zIndex: 2001,
              transition: 'all 0.3s'
            }}
          >
            <Trash2 size={24} />
          </button>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR (Fixed Dock) */}
      < div style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        height: 80,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        zIndex: 1000,
        border: '1px solid rgba(255,255,255,0.5)'
      }
      }>
        {/* HOME Button */}
        < button
          onClick={() => { setActiveMode('scan'); setIsCameraOn(false); }}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: 10,
            cursor: 'pointer',
            opacity: activeMode === 'scan' ? 1 : 0.5,
            transform: activeMode === 'scan' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Home size={28} color="#1B5E20" strokeWidth={activeMode === 'scan' ? 2.5 : 2} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#1B5E20' }}>HOME</span>
        </button >

        {/* GARDEN Button */}
        < button
          onClick={() => setActiveMode('garden')}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: 10,
            cursor: 'pointer',
            opacity: activeMode === 'garden' ? 1 : 0.5,
            transform: activeMode === 'garden' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Sprout size={28} color="#1B5E20" strokeWidth={activeMode === 'garden' ? 2.5 : 2} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#1B5E20' }}>GIARDINO</span>
        </button >

        {/* CHAT Button */}
        < button
          onClick={() => setActiveMode('chat')}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: 10,
            cursor: 'pointer',
            opacity: activeMode === 'chat' ? 1 : 0.5,
            transform: activeMode === 'chat' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <MessageSquare size={28} color="#1B5E20" strokeWidth={activeMode === 'chat' ? 2.5 : 2} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#1B5E20' }}>CHAT</span>
        </button >
      </div >

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />

      {
        isHistoryOpen && (
          <div className="side-overlay">
            {/* Banner Header Integrato - Erbario (Uniformato) */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              padding: '24px 20px 28px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              flexShrink: 0
            }}>
              <Sprout size={140} style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, color: 'white', transform: 'rotate(15deg)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                <button
                  className="btn-header-icon"
                  onClick={() => setIsHistoryOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                  <ChevronLeft size={24} />
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BookOpen size={24} color="white" fill="white" fillOpacity={0.3} />
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Il Tuo Erbario</h2>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 4, fontWeight: 500 }}>Cronologia delle tue scoperte botaniche</div>
                </div>
              </div>
            </div>
            <div className="overlay-content">
              {!username && (
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
                <div key={h.id} style={{ padding: 14, background: 'var(--white)', borderRadius: 24, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--card-border)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <img src={h.image} style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover' }} onClick={() => setFullScreenAnalysis({ ...h, source: 'history' })} />
                  <div style={{ flex: 1 }} onClick={() => setFullScreenAnalysis({ ...h, source: 'history' })}><div style={{ fontWeight: 800 }}>{h.name}</div><div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(h.timestamp).toLocaleDateString()}</div></div>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    showDeleteConfirmation('Eliminare questa scansione dalla cronologia?', () => {
                      const newHistory = history.filter(item => item.id !== h.id);
                      setHistory(newHistory);
                    });
                  }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: 8, cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {
        isGamesOpen && (
          <div className="side-overlay">
            {/* Banner Header Integrato - Sfide */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              padding: '24px 20px 28px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              flexShrink: 0
            }}>
              <Sprout size={140} style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, color: 'white', transform: 'rotate(15deg)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                <button
                  className="btn-header-icon"
                  onClick={() => { setIsGamesOpen(false); setActiveGame(null); setShowQuestIntro(false); }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                  <ChevronLeft size={24} />
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Gamepad2 size={24} color="white" fill="white" fillOpacity={0.3} />
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Sfide Botaniche</h2>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 4, fontWeight: 500 }}>Completa missioni e guadagna XP</div>
                </div>
              </div>
            </div>
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
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Award size={20} color="var(--primary)" /> Top Performer</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '350px', overflowY: 'auto' }}>
                          {/* LISTA CLASSIFICHE DISPONIBILI (BOX DESIGN AGGIORNATO) */}
                          <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {/* Card 1: Concorso Globale */}
                            <div
                              onClick={() => { setActiveLeaderboardType('beauty_contest'); fetchLeaderboard(); }}
                              style={{
                                background: activeLeaderboardType === 'beauty_contest'
                                  ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                  : 'var(--white)',
                                color: activeLeaderboardType === 'beauty_contest' ? 'white' : 'var(--dark)',
                                padding: 16,
                                borderRadius: 24,
                                border: `2px solid ${activeLeaderboardType === 'beauty_contest' ? 'transparent' : 'var(--card-border)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeLeaderboardType === 'beauty_contest' ? '0 8px 20px rgba(46, 125, 50, 0.3)' : 'none',
                                transform: activeLeaderboardType === 'beauty_contest' ? 'scale(1.02)' : 'scale(1)',
                                position: 'relative',
                                overflow: 'hidden',
                                height: 160,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              {activeLeaderboardType === 'beauty_contest' && <Sparkles size={80} style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }} />}

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{
                                    background: activeLeaderboardType === 'beauty_contest' ? 'rgba(255,255,255,0.2)' : 'var(--primary-light)',
                                    padding: 8,
                                    borderRadius: 12,
                                    color: activeLeaderboardType === 'beauty_contest' ? 'white' : 'var(--primary)'
                                  }}>
                                    <Award size={20} />
                                  </div>
                                  {(() => {
                                    const myRank = leaderboard.findIndex(u => u.username === username);
                                    return myRank !== -1 ? <div style={{ background: activeLeaderboardType === 'beauty_contest' ? 'white' : 'var(--primary)', color: activeLeaderboardType === 'beauty_contest' ? 'var(--primary)' : 'white', padding: '4px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>#{myRank + 1}</div> : null;
                                  })()}
                                </div>
                                <h3 style={{ margin: '12px 0 4px', fontSize: '0.95rem', fontWeight: 800 }}>Generale</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.3 }}>Bellezza vegetale assoluta</p>
                              </div>

                              {/* Mini Preview Classifica */}
                              <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                                {leaderboard.slice(0, 3).map((u, i) => (
                                  <div key={i} style={{
                                    width: 24, height: 24,
                                    borderRadius: '50%',
                                    background: activeLeaderboardType === 'beauty_contest' ? 'white' : '#eee',
                                    border: '2px solid white',
                                    marginLeft: i > 0 ? -8 : 0,
                                    fontSize: '0.6rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800,
                                    color: activeLeaderboardType === 'beauty_contest' ? 'var(--primary)' : '#666'
                                  }}>
                                    {u.username.charAt(0).toUpperCase()}
                                  </div>
                                ))}
                                {leaderboard.length > 3 && <div style={{ marginLeft: 6, fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>+{leaderboard.length - 3}</div>}
                              </div>
                            </div>

                            {/* Card 2: Sfida Settimanale */}
                            <div
                              onClick={() => { setActiveLeaderboardType(weeklyChallenge.id); fetchLeaderboard(false, weeklyChallenge.id); }}
                              style={{
                                background: activeLeaderboardType !== 'beauty_contest'
                                  ? 'linear-gradient(135deg, #FF9800, #F57C00)'
                                  : 'var(--white)',
                                color: activeLeaderboardType !== 'beauty_contest' ? 'white' : 'var(--dark)',
                                padding: 16,
                                borderRadius: 24,
                                border: `2px solid ${activeLeaderboardType !== 'beauty_contest' ? 'transparent' : 'var(--card-border)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeLeaderboardType !== 'beauty_contest' ? '0 8px 20px rgba(245, 124, 0, 0.3)' : 'none',
                                transform: activeLeaderboardType !== 'beauty_contest' ? 'scale(1.02)' : 'scale(1)',
                                position: 'relative',
                                overflow: 'hidden',
                                height: 160,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              {activeLeaderboardType !== 'beauty_contest' && <Star size={80} style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }} />}

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{
                                    background: activeLeaderboardType !== 'beauty_contest' ? 'rgba(255,255,255,0.2)' : '#FFF3E0',
                                    padding: 8,
                                    borderRadius: 12,
                                    color: activeLeaderboardType !== 'beauty_contest' ? 'white' : '#F57C00'
                                  }}>
                                    <Star size={20} />
                                  </div>
                                  {(() => {
                                    const myRank = weeklyLeaderboard.findIndex(u => u.username === username);
                                    return myRank !== -1 ? <div style={{ background: activeLeaderboardType !== 'beauty_contest' ? 'white' : '#F57C00', color: activeLeaderboardType !== 'beauty_contest' ? '#F57C00' : 'white', padding: '4px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>#{myRank + 1}</div> : null;
                                  })()}
                                </div>
                                <h3 style={{ margin: '12px 0 4px', fontSize: '0.95rem', fontWeight: 800 }}>Settimanale</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.3 }}>{weeklyChallenge.requirement}</p>
                              </div>

                              {/* Mini Preview Classifica */}
                              <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                                {weeklyLeaderboard.slice(0, 3).map((u, i) => (
                                  <div key={i} style={{
                                    width: 24, height: 24,
                                    borderRadius: '50%',
                                    background: activeLeaderboardType !== 'beauty_contest' ? 'white' : '#eee',
                                    border: '2px solid white',
                                    marginLeft: i > 0 ? -8 : 0,
                                    fontSize: '0.6rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800,
                                    color: activeLeaderboardType !== 'beauty_contest' ? '#F57C00' : '#666'
                                  }}>
                                    {u.username.charAt(0).toUpperCase()}
                                  </div>
                                ))}
                                {weeklyLeaderboard.length > 3 && <div style={{ marginLeft: 6, fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>+{weeklyLeaderboard.length - 3}</div>}
                              </div>
                            </div>
                          </div>

                          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {activeLeaderboardType === 'beauty_contest' ? <Award size={20} color="var(--primary)" /> : <Star size={20} color="#F57C00" />}
                            {activeLeaderboardType === 'beauty_contest' ? 'Classifica Generale' : weeklyChallenge.title}
                          </h3>

                          {(activeLeaderboardType === 'beauty_contest' ? leaderboard : weeklyLeaderboard).length === 0 ? <p style={{ opacity: 0.5, textAlign: 'center', margin: '40px 0' }}>Nessun campione ancora...</p> : (activeLeaderboardType === 'beauty_contest' ? leaderboard : weeklyLeaderboard).map((entry: any, idx) => {
                            if (!entry) return null;
                            const isTop3 = idx < 3;
                            const bg = idx === 0 ? 'linear-gradient(135deg, #FFF9C4 0%, #FFFDE7 100%)' :
                              idx === 1 ? 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)' :
                                idx === 2 ? 'linear-gradient(135deg, #EFEBE9 0%, #FBE9E7 100%)' : 'white';

                            return (
                              <div key={idx} onClick={() => setSelectedEntry(entry)} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: bg,
                                borderRadius: 16,
                                marginBottom: 4,
                                border: '1px solid var(--card-border)',
                                cursor: 'pointer',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: 28, textAlign: 'center' }}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                  </div>
                                  {(entry.image_url || entry.image) && <img src={entry.image_url || entry.image} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />}
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: entry.username === username ? 'var(--primary)' : 'var(--dark)' }}>{entry.username || 'Anonimo'}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{entry.score} PT</div>
                                  </div>
                                </div>
                                <ChevronRight size={16} opacity={0.3} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <button onClick={() => { setActiveGame(null); setBeautyScore(null); setQuestPhoto(null); }} style={{ width: '100%', marginTop: 20, background: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: 100, fontWeight: 800, cursor: 'pointer' }}>CHIUDI</button>

                      {selectedEntry && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedEntry(null)}>
                          <div style={{ background: 'white', borderRadius: 24, padding: 20, maxWidth: 350, width: '100%', textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelectedEntry(null)} style={{ position: 'absolute', top: 10, right: 10, background: '#eee', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
                            <img src={selectedEntry.image_url || selectedEntry.image} style={{ width: '100%', borderRadius: 16, marginBottom: 16, maxHeight: '50vh', objectFit: 'contain', background: '#f5f5f5' }} />
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                              <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '2.5rem' }}>{selectedEntry.score}</h2>
                              <span style={{ fontSize: '1rem', opacity: 0.5, fontWeight: 700 }}>/ 100</span>
                            </div>
                            <div style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '1.2rem' }}>{selectedEntry.username || 'Anonimo'}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: 20 }}>Scattata il {new Date(selectedEntry.created_at || selectedEntry.timestamp || Date.now()).toLocaleDateString()}</div>

                            {selectedEntry.username === username && (
                              <button onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Vuoi davvero cancellare questo risultato?')) {
                                  await deleteLeaderboardEntry(username!);
                                  const leaderboardResult = await getLeaderboard('all', 100);
                                  if (leaderboardResult.success && Array.isArray(leaderboardResult.leaderboard)) {
                                    setLeaderboard(leaderboardResult.leaderboard);
                                  }
                                  setSelectedEntry(null);
                                  setAchievementToast('Risultato rimosso 🗑️');
                                }
                              }} style={{ width: '100%', padding: 14, background: '#fee', color: '#c00', border: 'none', borderRadius: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Trash2 size={18} /> ELIMINA RISULTATO
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : activeGame ? (
                <div style={{ padding: '20px' }}>
                  {questPhoto && <img src={questPhoto} style={{ width: '100%', borderRadius: 20, marginBottom: 20, maxHeight: 200, objectFit: 'cover' }} />}
                  <div style={{ background: 'var(--white)', borderRadius: 24, padding: 24, marginBottom: 20, border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Domanda {currentQuestion + 1}/{(() => {
                        const qId = QUESTS.find(q => q.id === activeGame)?.id;
                        if (qId === 'general_quiz_2') return QUIZ_QUESTIONS_2.length;
                        if (qId === 'general_quiz_3') return QUIZ_QUESTIONS_3.length;
                        return (QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions).length;
                      })()}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Punteggio: {gameScore}</div>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', lineHeight: 1.4, marginBottom: 24 }}>
                      {(() => {
                        const qId = QUESTS.find(q => q.id === activeGame)?.id;
                        if (qId === 'general_quiz_2') return QUIZ_QUESTIONS_2[currentQuestion]?.q;
                        if (qId === 'general_quiz_3') return QUIZ_QUESTIONS_3[currentQuestion]?.q;
                        return (QUESTS.find(q => q.id === activeGame)?.type === 'quiz'
                          ? QUIZ_QUESTIONS[currentQuestion]?.q
                          : questQuestions[currentQuestion]?.question);
                      })()}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {((() => {
                        const qId = QUESTS.find(q => q.id === activeGame)?.id;
                        if (qId === 'general_quiz_2') return QUIZ_QUESTIONS_2[currentQuestion]?.answers;
                        if (qId === 'general_quiz_3') return QUIZ_QUESTIONS_3[currentQuestion]?.answers;
                        return (QUESTS.find(q => q.id === activeGame)?.type === 'quiz'
                          ? QUIZ_QUESTIONS[currentQuestion]?.answers
                          : questQuestions[currentQuestion]?.options || []);
                      })()).map((ans: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => !showResult && answerQuestion(idx)}
                          disabled={showResult}
                          style={{
                            padding: '20px 24px', // Increased padding
                            fontSize: '1.1rem', // Increased font size
                            borderRadius: 20,
                            border: showResult && idx === (activeGame === 'general_quiz_2' ? QUIZ_QUESTIONS_2[currentQuestion].correct : activeGame === 'general_quiz_3' ? QUIZ_QUESTIONS_3[currentQuestion].correct : (QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS[currentQuestion].correct : questQuestions[currentQuestion].correct)) ? '3px solid var(--primary)' : showResult && idx === selectedAnswer ? '3px solid var(--danger)' : '1px solid var(--card-border)',
                            background: showResult && idx === (activeGame === 'general_quiz_2' ? QUIZ_QUESTIONS_2[currentQuestion].correct : activeGame === 'general_quiz_3' ? QUIZ_QUESTIONS_3[currentQuestion].correct : (QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS[currentQuestion].correct : questQuestions[currentQuestion].correct)) ? '#E8F5E9' : showResult && idx === selectedAnswer ? '#FFEBEE' : 'var(--white)',
                            color: showResult && idx === (activeGame === 'general_quiz_2' ? QUIZ_QUESTIONS_2[currentQuestion].correct : activeGame === 'general_quiz_3' ? QUIZ_QUESTIONS_3[currentQuestion].correct : (QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS[currentQuestion].correct : questQuestions[currentQuestion].correct)) ? 'var(--primary-dark)' : 'var(--dark)',
                            fontWeight: 800,
                            cursor: showResult ? 'default' : 'pointer',
                            textAlign: 'center', // Center text
                            transition: 'all 0.2s',
                            width: '100%',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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
                      <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: '8px 0' }}>Hai risposto correttamente a {gameScore}/{(() => {
                        const qId = QUESTS.find(q => q.id === activeGame)?.id;
                        if (qId === 'general_quiz_2') return QUIZ_QUESTIONS_2.length;
                        if (qId === 'general_quiz_3') return QUIZ_QUESTIONS_3.length;
                        return (QUESTS.find(q => q.id === activeGame)?.type === 'quiz' ? QUIZ_QUESTIONS : questQuestions).length;
                      })()} domande</p>
                      <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem', margin: 0 }}>+{gameScore * 10} XP</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {!username && (
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
                  <div style={{ padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 28, padding: 24, color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(46, 125, 50, 0.2)' }}>
                      <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}><Award size={150} color="white" /></div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '4px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900 }}>
                          {level}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Livello Attuale</div>
                          <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 900 }}>
                            {level >= 21 ? 'LEGGENDA VIVENTE' :
                              level >= 13 ? 'MAESTRO ERBORISTA' :
                                level >= 8 ? 'CUSTODE VERDE' :
                                  level >= 4 ? 'ESPLORATORE NATURA' : 'APPRENDISTA BOTANICO'}
                          </h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.9, fontSize: '0.85rem' }}>
                            <Zap size={14} fill="currentColor" /> {xp % 1000} / 1000 XP per il liv. {level + 1}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 20, height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'white', width: `${((xp % 1000) / 1000) * 100}%`, borderRadius: 100, boxShadow: '0 0 10px white' }}></div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'var(--white)', padding: 20, borderRadius: 24, border: '1px solid var(--card-border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{completedQuests.length}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Sfide Completate</div>
                      </div>
                      <div style={{ background: 'var(--white)', padding: 20, borderRadius: 24, border: '1px solid var(--card-border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFD700' }}>
                          {level >= 21 ? '🥇' : level >= 13 ? '🥈' : level >= 8 ? '🥉' : '🌱'}
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Rango Attuale</div>
                      </div>
                    </div>
                  </div>
                  {QUESTS.map(q => {
                    const done = completedQuests.includes(q.id);
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
        )
      }

      {
        isSettingsOpen && (
          <div className="side-overlay">
            {/* Banner Header Integrato - Impostazioni */}
            {/* Banner Header Integrato - Impostazioni (Uniformato) */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              padding: '24px 20px 28px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              flexShrink: 0
            }}>
              <Sprout size={140} style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, color: 'white', transform: 'rotate(15deg)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                <button
                  className="btn-header-icon"
                  onClick={() => setIsSettingsOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                  <ChevronLeft size={24} />
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <User size={24} color="white" fill="white" fillOpacity={0.3} />
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Impostazioni</h2>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 4, fontWeight: 500 }}>Personalizza la tua esperienza</div>
                </div>
              </div>
            </div>
            <div className="overlay-content">
              <div className="profile-card">
                <div className="profile-avatar"><User size={32} /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                    {username || 'Ospite'}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    {username ? 'Utente Registrato' : `Livello ${level} • Non registrato`}
                  </div>
                </div>
              </div>

              {!username ? (
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
                    clearLocalUsername();
                    setUsername(null);
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
                  <div className="settings-row" onClick={async () => {
                    if (!notificationsEnabled) {
                      // Abilita: richiedi permessi
                      if ('Notification' in window) {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                          setNotificationsEnabled(true);
                          setAchievementToast('✅ Notifiche attivate! Riceverai promemoria per le tue piante.');
                          setTimeout(() => setAchievementToast(null), 3000);
                          // Registra SW
                          if ('serviceWorker' in navigator) {
                            registerServiceWorker();
                          }
                        } else {
                          alert('⚠️ Permesso negato. Abilita le notifiche dalle impostazioni del browser.');
                        }
                      } else {
                        alert('❌ Il tuo browser non supporta le notifiche.');
                      }
                    } else {
                      // Disabilita
                      setNotificationsEnabled(false);
                      setAchievementToast('🔕 Notifiche disattivate.');
                      setTimeout(() => setAchievementToast(null), 3000);
                    }
                  }}>
                    <div className="settings-icon-box"><Bell size={18} /></div>
                    <span style={{ flex: 1, fontWeight: 600 }}>Notifiche Cura</span>
                    <div className={`toggle-switch ${notificationsEnabled ? 'active' : ''}`}></div>
                  </div>
                </div>
              </div>

              {username && (
                <div className="settings-section">
                  <div className="settings-section-title">Account</div>
                  <div className="settings-group">
                    <div className="settings-row" onClick={() => {
                      const newUsername = prompt("Inserisci nuovo nome utente:", username);
                      if (newUsername) {
                        setUsername(newUsername);
                        setLocalUsername(newUsername);
                        alert("Nome utente aggiornato!");
                      }
                    }}>
                      <div className="settings-icon-box"><User size={18} /></div>
                      <span style={{ flex: 1, fontWeight: 600 }}>Modifica Nome Utente</span>
                      <ChevronRight size={16} opacity={0.3} />
                    </div>
                  </div>
                </div>
              )}

              <div className="settings-section">
                <div className="settings-section-title">Sicurezza & Dati</div>
                <div className="settings-group">
                  <div className="settings-row" onClick={() => (window as any).aistudio && (window as any).aistudio.openSelectKey()}>
                    <div className="settings-icon-box"><Key size={18} /></div>
                    <span style={{ flex: 1, fontWeight: 600 }}>Configura API Key</span>
                    <ExternalLink size={16} opacity={0.3} />
                  </div>
                  <div className="settings-row" onClick={() => setIsPrivacyOpen(true)}>
                    <div className="settings-icon-box"><ShieldCheck size={18} /></div>
                    <span style={{ flex: 1, fontWeight: 600 }}>Privacy e Sicurezza</span>
                    <ChevronRight size={16} opacity={0.3} />
                  </div>
                </div>
              </div>

              {/* Privacy Modal */}
              {isPrivacyOpen && (
                <div className="side-overlay" style={{ zIndex: 600 }}>
                  <div style={{
                    background: 'var(--white)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{
                      padding: '20px',
                      borderBottom: '1px solid var(--card-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16
                    }}>
                      <button onClick={() => setIsPrivacyOpen(false)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
                        <ChevronLeft size={24} color="var(--dark)" />
                      </button>
                      <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Privacy & Termini</h2>
                    </div>

                    <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                      <section style={{ marginBottom: 32 }}>
                        <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ShieldCheck size={20} /> Informativa Privacy
                        </h3>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8 }}>
                          Ultimo aggiornamento: Gennaio 2026
                        </p>
                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                          La tua privacy è fondamentale per noi. BioExpert è progettata per minimizzare la raccolta di dati personali.
                        </p>

                        <h4 style={{ marginTop: 20, marginBottom: 8 }}>1. Raccolta Dati</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8 }}>
                          BioExpert raccoglie solo i dati strettamente necessari al funzionamento dell'app:
                          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                            <li><b>Foto delle piante:</b> Vengono analizzate dall'AI e salvate solo se esplicitamente richiesto (es. Classifiche).</li>
                            <li><b>Dati di gioco (XP, Livello):</b> Salvati localmente e sincronizzati per le classifiche.</li>
                            <li><b>Local Storage:</b> Utilizziamo la memoria del tuo dispositivo per salvare preferenze e progressi.</li>
                          </ul>
                        </p>

                        <h4 style={{ marginTop: 20, marginBottom: 8 }}>2. Trattamento Immagini AI</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8 }}>
                          Le immagini caricate per l'analisi o le sfide vengono processate da Google Gemini AI. Non conserviamo le immagini sui nostri server in modo permanente salvo per le "Classifiche" pubbliche, dove l'immagine è visibile agli altri utenti.
                        </p>
                      </section>

                      <section style={{ marginBottom: 32 }}>
                        <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText size={20} /> Termini di Servizio
                        </h3>

                        <h4 style={{ marginTop: 20, marginBottom: 8 }}>1. Utilizzo dell'App</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8 }}>
                          L'uso di BioExpert è consentito per scopi personali, educativi e ludici. È vietato caricare contenuti offensivi, appropriati, o che violino copyright altrui.
                        </p>

                        <h4 style={{ marginTop: 20, marginBottom: 8 }}>2. Avvertenza AI (Disclaimer)</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8, background: '#FFF3E0', padding: 12, borderRadius: 12, borderLeft: '4px solid #FFB74D' }}>
                          <b>IMPORTANTE:</b> I consigli, le diagnosi e le identificazioni fornite dall'Intelligenza Artificiale sono a scopo puramente informativo e ludico. Non sostituiscono il parere professionale di un botanico o agronomo. Non usare per funghi commestibili o piante medicinali con scopi di salute.
                        </p>

                        <h4 style={{ marginTop: 20, marginBottom: 8 }}>3. Condotta Classifiche</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8 }}>
                          Ci riserviamo il diritto di rimuovere dalla classifica e bannare utenti che caricano foto non pertinenti (spam), false o inappropriate, grazie ai nostri sistemi di validazione AI automatici.
                        </p>
                      </section>

                      <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.5, fontSize: '0.8rem' }}>
                        BioExpert © 2026 - Tutti i diritti riservati<br />
                        Sviluppato da Castro Massimo
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="settings-section">
                <div className="settings-section-title">Sistema</div>
                <div className="settings-group">
                  <div className="settings-row" style={{ color: 'var(--danger)' }} onClick={() => {
                    showDeleteConfirmation("Cancellare tutti i dati e resettare l'app?", () => {
                      localStorage.clear();
                      window.location.reload();
                    });
                  }}>
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
        )
      }

      {
        fullScreenAnalysis && (
          <div className="side-overlay">
            {/* Banner Header Integrato - Dettaglio Pianta */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), #4CAF50)',
              padding: '20px 16px 24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <button
                  className="btn-header-icon"
                  onClick={() => { setFullScreenAnalysis(null); setDetailTab('info'); }}
                  style={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  flex: 1
                }}>
                  🌿 {fullScreenAnalysis.name || 'Dettaglio Pianta'}
                </h2>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                {fullScreenAnalysis.scientificName || 'Informazioni e cura'}
              </div>
            </div>
            <div className="overlay-content" style={{ paddingBottom: 100 }}>
              <img src={fullScreenAnalysis.image || 'https://placehold.co/600x400?text=No+Image'} style={{ width: '100%', borderRadius: 32, marginBottom: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', minHeight: 200, objectFit: 'cover', background: '#f0f0f0' }} onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image')} />

              {fullScreenAnalysis.source === 'garden' && (
                <div style={{ display: 'flex', background: 'var(--primary-light)', padding: 4, borderRadius: 16, marginBottom: 20 }}>
                  <button onClick={() => setDetailTab('info')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: detailTab === 'info' ? 'var(--primary)' : 'transparent', color: detailTab === 'info' ? 'white' : 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>INFO</button>
                  <button onClick={() => setDetailTab('care')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: detailTab === 'care' ? 'var(--primary)' : 'transparent', color: detailTab === 'care' ? 'white' : 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>CURA</button>
                  <button onClick={() => setDetailTab('history')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: detailTab === 'history' ? 'var(--primary)' : 'transparent', color: detailTab === 'history' ? 'white' : 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>ALBUM</button>
                </div>
              )}

              {detailTab === 'info' ? (
                <>
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

                    <h4 style={{ margin: '24px 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={18} color="var(--danger)" /> Consigli Rapidi</h4>
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
                </>
              ) : detailTab === 'care' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Sistema di Cura Progressivo */}
                  {activeCareProgram && activeCareProgram.program ? (
                    // Dashboard Programma Attivo
                    <div style={{
                      padding: 24,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 24,
                      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
                      color: 'white'
                    }}>

                      {/* Progress Ring */}
                      <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{
                          width: 140,
                          height: 140,
                          margin: '0 auto',
                          borderRadius: '50%',
                          background: `conic-gradient(#FFD700 ${activeCareProgram.program.completionPercentage || 0}%, rgba(255,255,255,0.2) 0)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }}>
                          <div style={{
                            width: 110,
                            height: 110,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#667eea' }}>
                              {activeCareProgram.program.completionPercentage || 0}%
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, color: '#333' }}>Completato</div>
                          </div>
                        </div>
                        <div style={{ marginTop: 16, fontSize: '1.1rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                          🌿 Fase {activeCareProgram.program.current_phase} di {activeCareProgram.program.total_phases}
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: 4 }}>
                          {activeCareProgram.currentPhase?.title || 'Caricamento...'}
                        </div>
                      </div>

                      {/* Fase Corrente Card */}
                      {activeCareProgram.currentPhase && (
                        <div style={{
                          background: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(10px)',
                          padding: 20,
                          borderRadius: 20,
                          marginBottom: 20,
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 8 }}>
                            {activeCareProgram.currentPhase.title}
                          </div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5 }}>
                            {activeCareProgram.currentPhase.description}
                          </div>
                          <div style={{ fontSize: '0.75rem', marginTop: 12, opacity: 0.8 }}>
                            ⏱️ Durata: {activeCareProgram.currentPhase.duration_days} giorni
                          </div>
                        </div>
                      )}

                      {/* Azioni Checklist */}
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: '0.85rem', marginBottom: 12, opacity: 0.9, letterSpacing: '1px' }}>AZIONI DA COMPLETARE</h4>
                        {activeCareProgram.currentPhase?.actions?.map((action: any, idx: number) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 14,
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 16,
                            marginBottom: 10,
                            border: '1px solid rgba(255,255,255,0.15)'
                          }}>
                            <div style={{ fontSize: '1.4rem' }}>
                              {action.type === 'water' ? '💧' :
                                action.type === 'fertilize' ? '🌱' :
                                  action.type === 'prune' ? '✂️' :
                                    action.type === 'photo_check' ? '📸' : '✅'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{action.title}</div>
                              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                {action.frequency === 'daily' ? 'Quotidiano' :
                                  action.frequency === 'weekly' ? 'Settimanale' :
                                    action.frequency === 'every_2_days' ? 'Ogni 2 giorni' :
                                      action.frequency === 'every_3_days' ? 'Ogni 3 giorni' : 'Al bisogno'}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7 }}>
                              {action.completed || 0}/{action.total}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Prossimo Checkpoint */}
                      {activeCareProgram.nextCheckpoint && (
                        <div style={{
                          background: 'rgba(255, 215, 0, 0.2)',
                          backdropFilter: 'blur(10px)',
                          padding: 16,
                          borderRadius: 16,
                          marginBottom: 16,
                          border: '2px dashed rgba(255, 215, 0, 0.5)'
                        }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>
                            📅 PROSSIMO CHECK FOTOGRAFICO
                          </div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                            {new Date(activeCareProgram.nextCheckpoint.scheduled_date).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      )}

                      {/* Bottone Check Foto */}
                      <button
                        onClick={() => {
                          setIsCheckpointMode(true);
                          setCurrentCheckpoint(activeCareProgram.nextCheckpoint);
                          setActiveMode('scan');
                          setIsCameraOn(true);
                        }}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: '#333',
                          border: 'none',
                          padding: '18px',
                          borderRadius: 100,
                          fontWeight: 900,
                          fontSize: '1.05rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 12,
                          boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                          transition: 'transform 0.2s',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Camera size={22} /> FAI CHECK FOTO
                      </button>

                      {/* Statistiche */}
                      <div style={{
                        marginTop: 24,
                        padding: 20,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 20,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 16,
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.15)'
                      }}>
                        <div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFD700' }}>
                            {activeCareProgram.stats?.healthImprovement > 0 ? '+' : ''}{activeCareProgram.stats?.healthImprovement || 0}%
                          </div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: 4 }}>Salute</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFD700' }}>
                            {activeCareProgram.stats?.completedCheckpoints || 0}/{activeCareProgram.stats?.totalCheckpoints || 0}
                          </div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: 4 }}>Checkpoint</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFD700' }}>
                            {activeCareProgram.stats?.daysActive || 0}
                          </div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: 4 }}>Giorni</div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    // Nessun Programma - Mostra Pulsante Avvio
                    <div style={{
                      padding: 32,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 24,
                      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌱</div>
                      <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: '1.4rem', fontWeight: 900 }}>
                        Programma di Cura Personalizzato
                      </h3>
                      <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24, maxWidth: '400px', margin: '0 auto 24px' }}>
                        Avvia un programma di cura guidato con checkpoint fotografici, luxometro integrato e tracking del progresso.
                      </p>
                      <button
                        onClick={async () => {
                          if (!username || !fullScreenAnalysis) return;

                          setAchievementToast('📸 Scatta una foto iniziale per iniziare...');
                          setIsCheckpointMode(true);
                          setActiveMode('scan');
                          setIsCameraOn(true);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: '#333',
                          border: 'none',
                          padding: '16px 32px',
                          borderRadius: 100,
                          fontWeight: 900,
                          cursor: 'pointer',
                          fontSize: '1rem',
                          boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
                      >
                        🚀 AVVIA PROGRAMMA DI RECUPERO
                      </button>
                    </div>
                  )}



                  {/* Storico Recente */}
                  <div style={{ padding: 20, background: 'var(--white)', borderRadius: 28, border: '1px solid var(--card-border)' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><History size={18} color="var(--primary)" /> Storico Cure</h3>
                    {isLoadingHistory ? <div className="spin" style={{ margin: '20px auto' }} /> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {careHistory.length === 0 ? <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Nessuna azione registrata.</p> : careHistory.slice(0, 5).map((ev: any) => (
                          <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 8, borderBottom: '1px solid #f5f5f5' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.event_type === 'watering' ? '#1976D2' : '#7B1FA2' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ev.event_type === 'watering' ? 'Irrigazione' : 'Controllo'}</div>
                              <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(ev.created_at).toLocaleString()}</div>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Vuoi eliminare questa registrazione?")) {
                                  await deleteCareEvent(ev.id);
                                  const res = await fetchCareEvents(fullScreenAnalysis.id);
                                  if (res.success) setCareHistory(res.data);
                                }
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: 4, cursor: 'pointer', opacity: 0.6 }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Tab History
                <div style={{ padding: 20, background: 'var(--white)', borderRadius: 28, border: '1px solid var(--card-border)' }}>
                  <h3 style={{ marginTop: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><History size={18} color="var(--primary)" /> Evoluzione Pianta</h3>
                  <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 16 }}>Diario fotografico per monitorare la crescita e la salute nel tempo.</p>
                  {isLoadingPhotos ? <div className="loader-box"><div className="spin" /></div> : (
                    <div className="photo-archive-grid">
                      {plantPhotos.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px 0', opacity: 0.4 }}>
                          <CameraOff size={32} style={{ marginBottom: 8 }} />
                          <p style={{ fontSize: '0.8rem' }}>Nessuna foto salvata.<br />Usa "CHECK FOTO" per iniziare l'album!</p>
                        </div>
                      ) : plantPhotos.map((p: any) => (
                        <div key={p.id} className="photo-archive-item" onClick={() => window.open(p.photo_url, '_blank')}>
                          <img src={p.photo_url} alt="Crescita" />
                          <div className="photo-archive-date">{new Date(p.taken_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {fullScreenAnalysis.source === 'garden' ? (
                <>
                  <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: detailTab === 'info' ? '1fr 1fr' : '1fr', gap: 10 }}>
                    {detailTab === 'info' && (
                      <button className="btn-game-action" style={{ background: 'var(--primary-dark)', color: 'white', padding: 16, borderRadius: 16, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setDetailTab('care')}>
                        <Calendar size={18} /> GESTISCI CURA
                      </button>
                    )}
                    <button className="btn-game-action" style={{ background: '#e0f7fa', color: '#006064', padding: 16, borderRadius: 16, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={async () => {
                      if (!username || !fullScreenAnalysis?.id) return;
                      const nextDate = new Date();
                      nextDate.setDate(nextDate.getDate() + 1); // Notifica domani di default
                      await updateUserPlant(username, fullScreenAnalysis.id, { next_check_at: nextDate.toISOString() });

                      const freshPlants = await fetchUserPlants(username);
                      if (freshPlants.success) setUserPlants(freshPlants.data);

                      setAchievementToast('🔔 Notifiche attivate! Ti avviserò domani per il controllo.');
                      setTimeout(() => setAchievementToast(null), 3000);
                    }}>
                      <Bell size={18} /> NOTIFICAMI
                    </button>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button className="btn-game-action" style={{ width: '100%', background: '#fee', color: '#c00', padding: 16, borderRadius: 16, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 size={18} /> RIMOVI DAL GIARDINO
                    </button>
                  </div>
                </>
              ) : (
                <button className="btn-game-action" style={{ marginTop: 24, width: '100%', background: 'var(--primary)', color: 'white', padding: 18, borderRadius: 20, border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => { setFullScreenAnalysis(null); setActiveMode('chat'); sendMessage(`Qual è la cura migliore per questa ${fullScreenAnalysis.name}?`); }}>
                  <MessageSquare size={20} /> CHIEDI AIUTO AI
                </button>
              )}
            </div>

            {
              showDeleteConfirm && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
                  <div style={{ background: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, width: '100%', animation: 'slideUp 0.3s ease-out' }}>
                    <h3 style={{ marginTop: 0, textAlign: 'center', color: 'var(--danger)' }}>Eliminare Pianta?</h3>
                    <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: 24 }}>Questa azione non può essere annullata.</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: 16, borderRadius: 16, border: 'none', background: '#f5f5f5', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>ANNULLA</button>
                      <button onClick={async () => {
                        if (username && fullScreenAnalysis?.id) {
                          const resDel = await deleteUserPlant(username, fullScreenAnalysis.id);
                          if (resDel.success) {
                            setAchievementToast('Pianta rimossa dal giardino 🗑️');
                            setTimeout(() => setAchievementToast(null), 3000);
                            setFullScreenAnalysis(null);
                            setShowDeleteConfirm(false);
                            // Refresh
                            const res = await fetchUserPlants(username);
                            if (res.success) setUserPlants(res.data);
                          } else {
                            alert("Errore eliminazione: " + (resDel.error || 'Sconosciuto'));
                          }
                        }
                      }} style={{ flex: 1, padding: 16, borderRadius: 16, border: 'none', background: '#fee', color: '#c00', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>ELIMINA</button>
                    </div>
                  </div>
                </div>
              )
            }
          </div >
        )
      }

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Add To Garden Confirm Modal */}
      {
        showAddToGardenConfirm && pendingPlant && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'white', borderRadius: 24, padding: 24, maxWidth: 350, width: '100%', textAlign: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e0f2f1', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', fontWeight: 800 }}>
                  {username ? username.charAt(0).toUpperCase() : <User size={40} />}
                </div>
                <h2 style={{ margin: 0, color: 'var(--dark)' }}>{username || 'Ospite'}</h2>
                <div style={{ opacity: 0.6 }}>Livello {level} • {xp} XP</div>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: 'var(--primary)' }}>Aggiungi al Giardino?</h3>
              <p style={{ opacity: 0.7, margin: '0 0 24px', lineHeight: 1.5 }}>
                Vuoi salvare <b>{pendingPlant.name}</b> nel tuo giardino virtuale per monitorarne la salute?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={async () => {
                    const btn = document.getElementById('btn-confirm-add');
                    if (btn) { btn.innerHTML = '⏳ Salvataggio...'; (btn as HTMLButtonElement).disabled = true; }

                    try {
                      const { addUserPlant } = await import('./apiClient');
                      const res = await addUserPlant(username!, {
                        plant_name: pendingPlant.name,
                        scientific_name: pendingPlant.scientificName,
                        imageBase64: pendingPlant.image,
                        diagnosis: pendingPlant.diagnosis
                      });

                      if (res.success) {
                        setAchievementToast('Pianta aggiunta al giardino! 🌱');
                        setTimeout(() => setAchievementToast(null), 3000);
                        setShowAddToGardenConfirm(false);
                        setPendingPlant(null);
                        // Refresh plants if we are in garden mode
                        if (activeMode === 'garden') {
                          const plantsRes = await fetchUserPlants(username!);
                          if (plantsRes.success) setUserPlants(plantsRes.data);
                        }
                      } else {
                        alert('Errore salvataggio: ' + (res.error || 'Sconosciuto'));
                        if (btn) { btn.innerHTML = 'SÌ, AGGIUNGI'; (btn as HTMLButtonElement).disabled = false; }
                      }
                    } catch (e) {
                      alert('Errore invio dati.');
                      if (btn) { btn.innerHTML = 'SÌ, AGGIUNGI'; (btn as HTMLButtonElement).disabled = false; }
                    }
                  }}
                  id="btn-confirm-add"
                  style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}
                >
                  SÌ, AGGIUNGI ORA
                </button>
                <button
                  onClick={() => { setShowAddToGardenConfirm(false); setPendingPlant(null); }}
                  style={{ width: '100%', background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '12px', cursor: 'pointer', fontWeight: 700 }}
                >
                  No, grazie
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Toast Notifiche Premium */}
      {
        achievementToast && (
          <div className="achievement-toast">
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 }}><Sparkles size={20} /></div>
            <span>{achievementToast}</span>
          </div>
        )
      }

      {
        isLeaderboardOpen && (
          <div className="side-overlay" style={{ zIndex: 450 }}>
            {/* Banner Header Integrato */}
            {/* Banner Header Integrato (Uniformato) */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              padding: '24px 20px 28px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              flexShrink: 0
            }}>
              <Sprout size={140} style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, color: 'white', transform: 'rotate(15deg)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                <button
                  className="btn-header-icon"
                  onClick={() => setIsLeaderboardOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                  <ChevronLeft size={24} />
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Trophy size={24} color="white" fill="white" fillOpacity={0.3} />
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Classifica Globale</h2>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 4, fontWeight: 500 }}>I migliori BioExpert della settimana</div>
                </div>
              </div>
            </div>
            <div className="overlay-content" style={{ padding: 0 }}>
              {/* Banner Premi Dinamico */}
              <div style={{
                background: activeLeaderboardType === 'beauty_contest' ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'linear-gradient(135deg, #FFD700, #FFA000)',
                margin: '16px',
                borderRadius: '24px',
                padding: '20px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: activeLeaderboardType === 'beauty_contest' ? '0 8px 20px rgba(46, 125, 50, 0.3)' : '0 8px 20px rgba(255, 160, 0, 0.3)'
              }}>
                <Trophy size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2, transform: 'rotate(15deg)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 900 }}>
                    {activeLeaderboardType === 'beauty_contest' ? '🏆 PREMI DEL MESE' : '🏆 PREMI DELLA SETTIMANA'}
                  </h4>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.95 }}>
                    {activeLeaderboardType === 'beauty_contest'
                      ? "I migliori curatori del mese riceveranno il badge 'Pollice Verde' e sconti esclusivi!"
                      : "I primi 3 classificati riceveranno XP bonus e semi digitali rari per il proprio giardino!"}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    {activeLeaderboardType === 'beauty_contest' ? (
                      <>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800 }}>🥇 1000 XP</div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800 }}>🥈 Badge Raro</div>
                      </>
                    ) : (
                      <>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800 }}>🥇 500 XP</div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800 }}>🥈 300 XP</div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800 }}>🥉 150 XP</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 16px 24px' }}>
                {/* NEW DOUBLE CARD SELECTOR */}
                <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Card 1: Concorso Globale */}
                  <div
                    onClick={() => { setActiveLeaderboardType('beauty_contest'); fetchLeaderboard(); }}
                    style={{
                      background: activeLeaderboardType === 'beauty_contest'
                        ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                        : 'var(--white)',
                      color: activeLeaderboardType === 'beauty_contest' ? 'white' : 'var(--dark)',
                      padding: 16,
                      borderRadius: 24,
                      border: `2px solid ${activeLeaderboardType === 'beauty_contest' ? 'transparent' : 'var(--card-border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: activeLeaderboardType === 'beauty_contest' ? '0 8px 20px rgba(46, 125, 50, 0.3)' : 'none',
                      transform: activeLeaderboardType === 'beauty_contest' ? 'scale(1.02)' : 'scale(1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: 160,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {activeLeaderboardType === 'beauty_contest' && <Sparkles size={80} style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }} />}

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{
                          background: activeLeaderboardType === 'beauty_contest' ? 'rgba(255,255,255,0.2)' : 'var(--primary-light)',
                          padding: 8,
                          borderRadius: 12,
                          color: activeLeaderboardType === 'beauty_contest' ? 'white' : 'var(--primary)'
                        }}>
                          <Award size={20} />
                        </div>
                        {(() => {
                          const myRank = leaderboard.findIndex(u => u.username === username);
                          return myRank !== -1 ? <div style={{ background: activeLeaderboardType === 'beauty_contest' ? 'white' : 'var(--primary)', color: activeLeaderboardType === 'beauty_contest' ? 'var(--primary)' : 'white', padding: '4px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>#{myRank + 1}</div> : null;
                        })()}
                      </div>
                      <h3 style={{ margin: '12px 0 4px', fontSize: '0.95rem', fontWeight: 800 }}>Generale</h3>
                      <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.3 }}>Bellezza vegetale assoluta</p>
                    </div>

                    {/* Mini Preview Classifica */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                      {leaderboard.slice(0, 3).map((u, i) => (
                        <div key={i} style={{
                          width: 24, height: 24,
                          borderRadius: '50%',
                          background: activeLeaderboardType === 'beauty_contest' ? 'white' : '#eee',
                          border: '2px solid white',
                          marginLeft: i > 0 ? -8 : 0,
                          fontSize: '0.6rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800,
                          color: activeLeaderboardType === 'beauty_contest' ? 'var(--primary)' : '#666'
                        }}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {leaderboard.length > 3 && <div style={{ marginLeft: 6, fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>+{leaderboard.length - 3}</div>}
                    </div>
                  </div>

                  {/* Card 2: Sfida Settimanale */}
                  <div
                    onClick={() => { setActiveLeaderboardType(weeklyChallenge.id); fetchLeaderboard(false, weeklyChallenge.id); }}
                    style={{
                      background: activeLeaderboardType !== 'beauty_contest'
                        ? 'linear-gradient(135deg, #FF9800, #F57C00)'
                        : 'var(--white)',
                      color: activeLeaderboardType !== 'beauty_contest' ? 'white' : 'var(--dark)',
                      padding: 16,
                      borderRadius: 24,
                      border: `2px solid ${activeLeaderboardType !== 'beauty_contest' ? 'transparent' : 'var(--card-border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: activeLeaderboardType !== 'beauty_contest' ? '0 8px 20px rgba(245, 124, 0, 0.3)' : 'none',
                      transform: activeLeaderboardType !== 'beauty_contest' ? 'scale(1.02)' : 'scale(1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: 160,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {activeLeaderboardType !== 'beauty_contest' && <Star size={80} style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }} />}

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{
                          background: activeLeaderboardType !== 'beauty_contest' ? 'rgba(255,255,255,0.2)' : '#FFF3E0',
                          padding: 8,
                          borderRadius: 12,
                          color: activeLeaderboardType !== 'beauty_contest' ? 'white' : '#F57C00'
                        }}>
                          <Star size={20} />
                        </div>
                        {(() => {
                          const myRank = weeklyLeaderboard.findIndex(u => u.username === username);
                          return myRank !== -1 ? <div style={{ background: activeLeaderboardType !== 'beauty_contest' ? 'white' : '#F57C00', color: activeLeaderboardType !== 'beauty_contest' ? '#F57C00' : 'white', padding: '4px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>#{myRank + 1}</div> : null;
                        })()}
                      </div>
                      <h3 style={{ margin: '12px 0 4px', fontSize: '0.95rem', fontWeight: 800 }}>Settimanale</h3>
                      <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.3 }}>{weeklyChallenge.requirement}</p>
                    </div>

                    {/* Mini Preview Classifica */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                      {weeklyLeaderboard.slice(0, 3).map((u, i) => (
                        <div key={i} style={{
                          width: 24, height: 24,
                          borderRadius: '50%',
                          background: activeLeaderboardType !== 'beauty_contest' ? 'white' : '#eee',
                          border: '2px solid white',
                          marginLeft: i > 0 ? -8 : 0,
                          fontSize: '0.6rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800,
                          color: activeLeaderboardType !== 'beauty_contest' ? '#F57C00' : '#666'
                        }}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {weeklyLeaderboard.length > 3 && <div style={{ marginLeft: 6, fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>+{weeklyLeaderboard.length - 3}</div>}
                    </div>
                  </div>
                </div>

                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {activeLeaderboardType === 'beauty_contest' ? <Award size={20} color="var(--primary)" /> : <Star size={20} color="#F57C00" />}
                  {activeLeaderboardType === 'beauty_contest' ? 'Classifica Generale' : weeklyChallenge.title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {!(activeLeaderboardType === 'beauty_contest' ? leaderboard : weeklyLeaderboard).length && (activeLeaderboardType === 'beauty_contest' ? leaderboard : weeklyLeaderboard).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
                      <p>Nessun campione ancora...</p>
                    </div>
                  ) : (
                    <>
                      {(activeLeaderboardType === 'beauty_contest' ? leaderboard : weeklyLeaderboard).map((entry: any, idx) => {
                        if (!entry) return null;
                        const isTop3 = idx < 3;
                        const bg = idx === 0 ? 'linear-gradient(135deg, #FFF9C4 0%, #FFFDE7 100%)' :
                          idx === 1 ? 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)' :
                            idx === 2 ? 'linear-gradient(135deg, #EFEBE9 0%, #FBE9E7 100%)' : 'white';
                        const border = idx === 0 ? '2px solid #FFD700' :
                          idx === 1 ? '2px solid #C0C0C0' :
                            idx === 2 ? '2px solid #CD7F32' : '1px solid var(--card-border)';

                        return (
                          <div key={idx} onClick={() => setSelectedEntry(entry)} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: isTop3 ? '16px' : '12px 16px',
                            background: bg,
                            borderRadius: 20,
                            border: border,
                            boxShadow: isTop3 ? '0 4px 15px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer'
                          }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: isTop3 ? 'white' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: isTop3 ? '1.2rem' : '0.9rem',
                              color: isTop3 ? 'var(--dark)' : 'var(--text-muted)'
                            }}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                            </div>

                            <div style={{ position: 'relative' }}>
                              <img
                                src={entry.image_url || entry.image || 'https://placehold.co/100x100/e8f5e9/2e7d32?text=🌿'}
                                style={{ width: 50, height: 50, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--card-border)' }}
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/e8f5e9/2e7d32?text=🌿'; }}
                              />
                              {isTop3 && <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'white', borderRadius: '50%', padding: 2, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}><Award size={14} color={idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'} /></div>}
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: isTop3 ? '1rem' : '0.9rem', color: entry.username === username ? 'var(--primary)' : 'var(--dark)' }}>
                                {entry.username || 'Anonimo'} {entry.username === username && '(Tu)'}
                              </div>
                              {entry.plant_name && <div style={{ fontSize: '0.75rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--primary)', marginBottom: 2 }}>{entry.plant_name}</div>}
                              <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(entry.created_at || entry.timestamp).toLocaleDateString()}</div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>{entry.score}</div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.4 }}>PUNTI AI</div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        confirmToast && (
          <div className="toast-confirm-overlay">
            <div className="toast-confirm-box">
              <h3 style={{ margin: 0, color: 'var(--dark)' }}>Conferma</h3>
              <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.4 }}>{confirmToast.message}</p>
              <div className="toast-actions">
                <button className="cancel-btn" onClick={confirmToast.onCancel}>Annulla</button>
                <button className="confirm-danger" onClick={confirmToast.onConfirm}>Elimina</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Dettaglio Entry Classifica */}
      {
        selectedEntry && (
          <div className="toast-confirm-overlay" onClick={() => setSelectedEntry(null)}>
            <div className="toast-confirm-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, padding: 0, overflow: 'hidden' }}>
              {(selectedEntry.image_url || selectedEntry.image) && (
                <img
                  src={selectedEntry.image_url || selectedEntry.image}
                  style={{ width: '100%', height: 300, objectFit: 'cover' }}
                  alt="Foto concorso"
                />
              )}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '1.4rem' }}>{selectedEntry.username}</h3>
                    <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{new Date(selectedEntry.created_at || selectedEntry.timestamp).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{selectedEntry.score}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5 }}>PUNTI AI</div>
                  </div>
                </div>

                {selectedEntry.plant_name && (
                  <div style={{ background: 'var(--primary-light)', padding: 16, borderRadius: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>PIANTA FOTOGRAFATA</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedEntry.plant_name}</div>
                    {selectedEntry.scientific_name && (
                      <div style={{ fontSize: '0.85rem', opacity: 0.7, fontStyle: 'italic', marginTop: 2 }}>{selectedEntry.scientific_name}</div>
                    )}
                  </div>
                )}

                {selectedEntry.health_status && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 12,
                      background: selectedEntry.health_status === 'healthy' ? '#e8f5e9' : '#ffebee',
                      color: selectedEntry.health_status === 'healthy' ? '#2e7d32' : '#d32f2f',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textAlign: 'center'
                    }}>
                      {selectedEntry.health_status === 'healthy' ? '✓ SANA' : '⚠ MALATA'}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedEntry(null)}
                  style={{
                    width: '100%',
                    padding: 14,
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 100,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  CHIUDI
                </button>
              </div>
            </div>
          </div>
        )
      }

      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={(u) => { setUsername(u); setLocalUsername(u); }} />}
    </div >
  );
}

export default App;

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', color: '#333', maxWidth: 600, margin: '20px auto' }}>
          <h1 style={{ color: '#BA1A1A' }}>Errore Imprevisto 😔</h1>
          <p>L'applicazione ha riscontrato un errore critico.</p>
          <div style={{ background: '#fee', padding: 15, borderRadius: 8, overflow: 'auto', fontFamily: 'monospace', border: '1px solid #fcc', fontSize: 13, marginBottom: 20 }}>
            {this.state.error?.toString()}
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', fontSize: 16, background: '#333', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Ricarica Pagina
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
