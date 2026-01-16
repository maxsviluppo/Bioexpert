# 🎯 GUIDA COMPLETAMENTO SISTEMA DI CURA - ISTRUZIONI FINALI

**Data**: 14 Gennaio 2026  
**Ora**: 09:17
**Stato Implementazione**: 75% Completato

## ✅ GIÀ FATTO

1. ✅ Backend completo (database + API)
2. ✅ API client aggiornato
3. ✅ Import e stati React aggiunti
4. ✅ Funzione `loadCareProgram()` creata
5. ✅ useEffect per caricare programma automaticamente

## 📝 DA COMPLETARE - ISTRUZIONI PRECISE

### STEP 1: Trovare e Modificare il Tab CURA (Linea ~3330-3450)

**Cerca in index.tsx:**
```typescript
{detailTab === 'care' ? (
```

**Sostituisci l'intera sezione con:**

```typescript
{detailTab === 'care' ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    
    {/* NUOVO: Sistema di Cura Progressivo */}
    {activeCareProgram && activeCareProgram.program ? (
      // Dashboard Programma Attivo
      <div style={{ padding: 20, background: 'var(--white)', borderRadius: 28, border: '1px solid var(--card-border)' }}>
        
        {/* Progress Ring */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ 
            width: 120, 
            height: 120, 
            margin: '0 auto',
            borderRadius: '50%',
            background: `conic-gradient(var(--primary) ${activeCareProgram.program.completionPercentage}%, #E0E0E0 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
                {activeCareProgram.program.completionPercentage}%
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Completato</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: '0.9rem', fontWeight: 700 }}>
            🌿 Fase {activeCareProgram.program.current_phase} di {activeCareProgram.program.total_phases}: {activeCareProgram.currentPhase?.title}
          </div>
        </div>

        {/* Fase Corrente Card */}
        {activeCareProgram.currentPhase && (
          <div style={{ 
            background: activeCareProgram.program.current_phase === 1 ? '#FFE5E5' : 
                       activeCareProgram.program.current_phase === 2 ? '#FFF9E5' :
                       activeCareProgram.program.current_phase === 3 ? '#E8F5E9' : '#E8F5E9',
            padding: 16,
            borderRadius: 20,
            marginBottom: 20,
            border: `2px solid ${
              activeCareProgram.program.current_phase === 1 ? '#FF6B6B' :
              activeCareProgram.program.current_phase === 2 ? '#FFD93D' :
              activeCareProgram.program.current_phase === 3 ? '#6BCF7F' : '#2E7D32'
            }`
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 4 }}>
              {activeCareProgram.currentPhase.title}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              {activeCareProgram.currentPhase.description}
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: 8, opacity: 0.7 }}>
              Durata: {activeCareProgram.currentPhase.duration_days} giorni
            </div>
          </div>
        )}

        {/* Azioni Checklist */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: 12, opacity: 0.7 }}>AZIONI DA COMPLETARE</h4>
          {activeCareProgram.currentPhase?.actions?.map((action: any, idx: number) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: 12,
              background: '#F5F5F5',
              borderRadius: 12,
              marginBottom: 8
            }}>
              <div style={{ fontSize: '1.2rem' }}>
                {action.type === 'water' ? '💧' : 
                 action.type === 'fertilize' ? '🌱' :
                 action.type === 'prune' ? '✂️' :
                 action.type === 'photo_check' ? '📸' : '✅'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{action.title}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                  {action.frequency === 'daily' ? 'Quotidiano' :
                   action.frequency === 'weekly' ? 'Settimanale' :
                   action.frequency === 'every_2_days' ? 'Ogni 2 giorni' :
                   action.frequency === 'every_3_days' ? 'Ogni 3 giorni' : 'Al bisogno'}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>
                {action.completed || 0}/{action.total}
              </div>
            </div>
          ))}
        </div>

        {/* Prossimo Checkpoint */}
        {activeCareProgram.nextCheckpoint && (
          <div style={{ 
            background: 'var(--primary-light)', 
            padding: 16, 
            borderRadius: 16,
            marginBottom: 16,
            border: '2px dashed var(--primary)'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 4, color: 'var(--primary)' }}>
              📅 PROSSIMO CHECK FOTOGRAFICO
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {new Date(activeCareProgram.nextCheckpoint.scheduled_date).toLocaleDateString('it-IT', { 
                day: 'numeric', 
                month: 'long' 
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
            background: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            padding: '16px', 
            borderRadius: 100, 
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
          }}
        >
          <Camera size={20} /> FAI CHECK FOTO
        </button>

        {/* Statistiche */}
        <div style={{ 
          marginTop: 20, 
          padding: 16, 
          background: '#F9F9F9', 
          borderRadius: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
              {activeCareProgram.stats.healthImprovement > 0 ? '+' : ''}{activeCareProgram.stats.healthImprovement}%
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Salute</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
              {activeCareProgram.stats.completedCheckpoints}/{activeCareProgram.stats.totalCheckpoints}
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Checkpoint</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
              {activeCareProgram.stats.daysActive}
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Giorni</div>
          </div>
        </div>

      </div>
    ) : (
      // Nessun Programma - Mostra Pulsante Avvio
      <div style={{ padding: 20, background: 'var(--white)', borderRadius: 28, border: '1px solid var(--card-border)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌱</div>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Programma di Cura Personalizzato</h3>
        <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 20 }}>
          Avvia un programma di cura guidato con checkpoint fotografici, luxometro integrato e tracking del progresso.
        </p>
        <button
          onClick={async () => {
            if (!username || !fullScreenAnalysis) return;
            
            setAchievementToast('📸 Scatta una foto iniziale per iniziare...');
            setIsCheckpointMode(true);
            setActiveMode('scan');
            setIsCameraOn(true);
            
            // Dopo la foto, creeremo il programma
          }}
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            padding: '14px 28px', 
            borderRadius: 100, 
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          🚀 AVVIA PROGRAMMA DI RECUPERO
        </button>
      </div>
    )}

    {/* Resto del contenuto esistente (azioni rapide, storico, ecc.) */}
    {/* MANTIENI IL CODICE ESISTENTE QUI */}
    
  </div>
) : (
  // Altri tab (info, history)
  // MANTIENI IL CODICE ESISTENTE
)}
```

### STEP 2: Modificare la Fotocamera per Checkpoint (Linea ~2150)

**Cerca:**
```typescript
{isCameraOn ? (
```

**Aggiungi PRIMA del video:**
```typescript
{isCheckpointMode && (
  <div style={{
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: 16,
    color: 'white',
    zIndex: 120
  }}>
    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>
      📸 CHECKPOINT FOTOGRAFICO
    </div>
    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
      Scatta una foto per registrare il progresso della pianta
    </div>
  </div>
)}
```

### STEP 3: Modificare la Funzione `capture()` (Linea ~1880)

**Trova:**
```typescript
const capture = () => {
```

**Sostituisci con:**
```typescript
const capture = async () => {
  const quest = QUESTS.find(q => q.id === activeGame);
  
  // Modalità Checkpoint
  if (isCheckpointMode) {
    if (!videoRef.current || !canvasRef.current) return;
    const c = canvasRef.current;
    const v = videoRef.current;
    const size = Math.min(v.videoWidth, v.videoHeight);
    const startX = (v.videoWidth - size) / 2;
    const startY = (v.videoHeight - size) / 2;
    c.width = 1024; c.height = 1024;
    c.getContext('2d')?.drawImage(v, startX, startY, size, size, 0, 0, 1024, 1024);
    const photo = c.toDataURL('image/jpeg');
    
    setIsCameraOn(false);
    setIsAnalyzing(true);
    
    try {
      // Analisi AI
      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
  
  // MANTIENI IL RESTO DEL CODICE ESISTENTE PER QUEST E SCAN NORMALE
  if (activeGame && (quest?.type === 'photo' || quest?.type === 'beauty')) {
    handleQuestPhotoCapture();
  } else {
    // ... codice esistente
  }
};
```

## 🎯 RISULTATO FINALE

Dopo queste modifiche avrai:
- ✅ Dashboard programma nel tab CURA
- ✅ Fotocamera checkpoint con luxometro
- ✅ Creazione automatica programma
- ✅ Completamento checkpoint
- ✅ Progress tracking visivo

## 🚀 TEST LOCALE

1. Vai al Giardino
2. Clicca su una pianta
3. Tab CURA → Vedi "AVVIA PROGRAMMA"
4. Clicca → Scatta foto con luxometro
5. Programma creato → Dashboard visibile
6. Dopo 3 giorni → Fai check foto
7. Progresso aggiornato!

## ⚠️ NOTE

- Il luxometro è già integrato (variabile `lightLevel`)
- Il modello AI rimane `gemini-3-flash-preview`
- La grafica è coerente con i mockup
- Tutto il codice esistente è preservato

---

**TEMPO STIMATO**: 30-40 minuti per implementare questi 3 step
**DIFFICOLTÀ**: Media (copia-incolla con attenzione)
