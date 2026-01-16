// API Client per chiamare le Vercel Edge Functions

// Usa percorsi relativi per funzionare sia in dev che in prod
const API_BASE = '';

// ============ AUTHENTICATION FUNCTIONS ============

export async function registerUser(username: string, password: string, email?: string) {
    try {
        const response = await fetch(`${API_BASE}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', username, password, email })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error registering user:', error);
        return { success: false, error: 'Errore di connessione' };
    }
}

export async function loginUser(username: string, password: string) {
    try {
        const response = await fetch(`${API_BASE}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, error: 'Errore di connessione' };
    }
}

export async function requestPasswordReset(email: string) {
    try {
        const response = await fetch(`${API_BASE}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'request_reset', email })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error requesting password reset:', error);
        return { success: false, error: 'Errore di connessione' };
    }
}

// Legacy function - mantieni per compatibilità
export async function registerUsername(username: string) {
    console.warn('registerUsername is deprecated, use registerUser instead');
    return registerUser(username, 'temp123'); // Fallback temporaneo
}

export async function fetchUserInfo(username: string) {
    try {
        const response = await fetch(`${API_BASE}/api/user-info?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching user info:', error);
        return { xp: 0, level: 1 };
    }
}

export async function updateUserInfo(username: string, xp: number, level: number) {
    try {
        await fetch(`${API_BASE}/api/user-info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, xp, level })
        });
    } catch (error) {
        console.error('Error updating user info:', error);
    }
}

// ============ BEAUTY SCORE FUNCTIONS ============

export async function saveBeautyScore(username: string, score: number, imageData: string, plantName?: string, challengeId?: string) {
    try {
        const response = await fetch(`${API_BASE}/api/save-beauty-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score, imageBase64: imageData, plantName, challengeId })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving beauty score:', error);
        return { success: false, error: 'Errore di connessione' };
    }
}

export async function getLeaderboard(period: 'all' | 'week' | 'month' | 'today' = 'all', limit = 100, challengeId = 'beauty_contest') {
    try {
        const response = await fetch(`${API_BASE}/api/leaderboard?period=${period}&limit=${limit}&challengeId=${challengeId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return { success: false, leaderboard: [], error: 'Errore di connessione' };
    }
}

// ============ USER PLANTS FUNCTIONS ============

export async function fetchUserPlants(username: string) {
    try {
        const response = await fetch(`${API_BASE}/api/plants?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching plants:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

export async function addUserPlant(username: string, plantData: any) {
    try {
        const response = await fetch(`${API_BASE}/api/plants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...plantData, username })
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding plant:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

export async function deleteUserPlant(username: string, id: string) {
    try {
        const response = await fetch(`${API_BASE}/api/plants`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, id })
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting plant:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

export async function updateUserPlant(username: string, id: string, updates: { notes?: string, health_status?: string, watering?: string, sunlight?: string, pruning?: string, repotting?: string, next_check_at?: string }) {
    try {
        const response = await fetch(`${API_BASE}/api/plants`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, id, ...updates })
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating plant:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

export async function addCareEvent(plantId: string, username: string, eventType: string, notes?: string) {
    try {
        const response = await fetch(`${API_BASE}/api/care-events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plant_id: plantId, username, event_type: eventType, notes })
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding care event:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

export async function fetchCareEvents(plantId: string) {
    try {
        const response = await fetch(`${API_BASE}/api/care-events?plant_id=${plantId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching care events:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

export async function fetchPlantPhotos(plantId: string) {
    try {
        const response = await fetch(`${API_BASE}/api/plant-photos?plant_id=${plantId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching plant photos:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

export async function addPlantPhoto(plantId: string, imageBase64: string, notes?: string, health_score?: number) {
    try {
        const response = await fetch(`${API_BASE}/api/plant-photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plant_id: plantId, imageBase64, notes, health_score })
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding plant photo:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

// ============ BEAUTY SCORE FUNCTIONS ============

export async function deleteLeaderboardEntry(username: string) {
    try {
        const response = await fetch(`${API_BASE}/api/save-beauty-score`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting entry:', error);
        return { success: false, error: 'Errore connessione' };
    }
}

// ============ LOCAL STORAGE HELPERS ============

export function getLocalUsername(): string | null {
    return localStorage.getItem('bioexpert_username');
}

export function setLocalUsername(username: string) {
    localStorage.setItem('bioexpert_username', username);
}

export function clearLocalUsername() {
    localStorage.removeItem('bioexpert_username');
}

// ============ IMAGE HELPERS ============

export function captureImageAsBase64(video: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas context not available');
    }

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
}

// ============ ANALYSES HISTORY FUNCTIONS ============

export async function saveAnalysis(username: string, analysisData: any) {
    try {
        const response = await fetch(`${API_BASE}/api/analyses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, analysis_data: analysisData })
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving analysis:', error);
        return { success: false, error: 'Errore salvataggio analisi' };
    }
}

export async function fetchAnalyses(username: string) {
    try {
        const response = await fetch(`${API_BASE}/api/analyses?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching analyses:', error);
        return { success: false, data: [] };
    }
}

