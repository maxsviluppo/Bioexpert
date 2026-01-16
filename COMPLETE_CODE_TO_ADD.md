# 🚀 CODICE COMPLETO DA AGGIUNGERE A INDEX.TSX

## ⚠️ IMPORTANTE
A causa della complessità del file, ti fornisco il codice esatto da aggiungere manualmente.

---

## STEP 1: Aggiungi useEffect per caricare programma

Cerca questa riga (circa linea 1030):
```typescript
}, [username, activeMode]);
```

Subito DOPO aggiungi:

```typescript
// Carica programma di cura quando si apre dettaglio pianta
useEffect(() => {
  if (fullScreenAnalysis?.id && fullScreenAnalysis.source === 'garden') {
    loadCareProgram(fullScreenAnalysis.id);
  }
}, [fullScreenAnalysis?.id]);
```

---

## STEP 2: Modifica funzione capture per checkpoint

Cerca la funzione `const capture = () => {` (circa linea 2000-2500)

All'INIZIO della funzione, PRIMA di tutto il resto, aggiungi:

```typescript
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
  
  // RESTO DEL CODICE ESISTENTE DELLA FUNZIONE CAPTURE...
```

---

## STEP 3: Sostituisci completamente il tab CURA

Cerca questa sezione (circa linea 3300-3600):

```typescript
{detailTab === 'care' ? (
```

Sostituisci TUTTA la sezione del tab care con questo codice:

```typescript
{detailTab === 'care' ? (
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

  </div>
) : detailTab === 'history' ? (
  // TAB HISTORY - MANTIENI IL CODICE ESISTENTE
```

---

## RISULTATO FINALE

Dopo queste modifiche avrai:
- ✅ Dashboard stile mockup con gradiente viola/oro
- ✅ Progress ring animato
- ✅ Pulsante "AVVIA PROGRAMMA" funzionante
- ✅ Fotocamera che si apre per checkpoint
- ✅ Sistema completo integrato

**Tempo stimato**: 10-15 minuti per copiare tutto

Vuoi che continui io con le modifiche automatiche o preferisci copiare manualmente?
