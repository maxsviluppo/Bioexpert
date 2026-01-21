# 🌿 BioExpert - Assistente Botanico AI

BioExpert è un'applicazione web progressiva (PWA) che utilizza l'intelligenza artificiale per identificare e diagnosticare piante, fornendo consigli personalizzati per la loro cura.

## ✨ Caratteristiche Principali

- 🔍 **Identificazione Piante**: Scatta una foto e l'AI riconosce la pianta
- 🏥 **Diagnosi Salute**: Analisi dello stato di salute della pianta
- 📚 **Giardino Personale**: Gestisci tutte le tue piante in un unico posto
- 💬 **Chat AI**: Chiedi consigli al tuo assistente botanico personale
- 📸 **Album Fotografico**: Monitora la crescita delle tue piante nel tempo
- 🎮 **Sfide Botaniche**: Quiz e giochi per imparare divertendosi
- 🏆 **Sistema XP**: Guadagna punti esperienza e sali di livello
- 🌙 **Modalità Scura**: Interfaccia ottimizzata per la visione notturna
- 📱 **PWA**: Installabile su dispositivi mobili e desktop

## 🚀 Tecnologie Utilizzate

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **AI**: Google Gemini API
- **Database**: Vercel Postgres (Neon)
- **Storage**: Vercel Blob
- **Hosting**: Vercel
- **Autenticazione**: Sistema custom con bcrypt
- **UI**: Lucide React Icons

## 📦 Installazione

1. Clona il repository:
```bash
git clone https://github.com/TUO_USERNAME/bioexpert.git
cd bioexpert
```

2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente:
Crea un file `.env.local` con le seguenti variabili:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
POSTGRES_URL=your_postgres_connection_string
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

4. Avvia il server di sviluppo:
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 🔧 Comandi Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione
- `npm run preview` - Anteprima della build di produzione

## 🗄️ Struttura Database

Il progetto utilizza Vercel Postgres con le seguenti tabelle principali:

- `users` - Utenti registrati
- `user_plants` - Piante nel giardino degli utenti
- `care_events` - Storico delle cure effettuate
- `plant_photos` - Album fotografico delle piante
- `beauty_scores` - Punteggi delle sfide fotografiche
- `analyses` - Storico delle analisi effettuate

## 🔐 Sicurezza

- Le password sono hashate con bcrypt
- Le API keys sono gestite tramite variabili d'ambiente
- Autenticazione richiesta per funzionalità avanzate
- Validazione input lato client e server

## 📱 PWA Features

- Installabile su dispositivi mobili
- Funziona offline (cache delle risorse statiche)
- Icone e splash screen personalizzati
- Manifest.json configurato

## 🤝 Contribuire

Le contribuzioni sono benvenute! Per favore:

1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha sul branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## 👨‍💻 Autore

**Il Tuo Nome**

## 🙏 Ringraziamenti

- Google Gemini per l'API di intelligenza artificiale
- Vercel per l'hosting e i servizi cloud
- Lucide per le icone
- La community open source

---

Made with 💚 and 🌱
