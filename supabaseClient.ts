// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

// ⚠️ IMPORTANTE: Aggiungi queste variabili in Vercel Environment Variables:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials MISSING! Check Vercel Env Vars.');
}

// Prevent crash if vars are missing
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// Helper: Salva punteggio bellezza
export async function saveBeautyScore(username: string, score: number, imageFile: File) {
    try {
        // 1. Upload immagine a Supabase Storage
        const fileName = `${Date.now()}-${username}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bioexpert-beauty-photos')
            .upload(fileName, imageFile, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
            });

        if (uploadError) throw uploadError;

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('bioexpert-beauty-photos')
            .getPublicUrl(fileName);

        // 3. Salva nel database
        const { data, error } = await supabase
            .from('bioexpert_beauty_scores')
            .insert({
                username,
                score,
                image_url: publicUrl,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error saving beauty score:', error);
        return { success: false, error };
    }
}

// Helper: Get classifica
export async function getLeaderboard(period: 'all' | 'week' | 'month' | 'today' = 'all', limit = 100) {
    try {
        let query = supabase
            .from('bioexpert_beauty_scores')
            .select('id, username, score, image_url, created_at')
            .order('score', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(limit);

        // Filtri periodo
        const now = new Date();
        if (period === 'today') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            query = query.gte('created_at', today.toISOString());
        } else if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', weekAgo.toISOString());
        } else if (period === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', monthAgo.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        // Aggiungi rank
        const leaderboard = data?.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        })) || [];

        return { success: true, leaderboard };
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return { success: false, error, leaderboard: [] };
    }
}

// Helper: Converti base64 a File
export function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

// ============ AUTHENTICATION ============

// Helper: Sign in with Google
export async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error signing in with Google:', error);
        return { success: false, error };
    }
}

// Helper: Sign up with email/password
export async function signUpWithEmail(email: string, password: string, displayName: string) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                }
            }
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error signing up:', error);
        return { success: false, error };
    }
}

// Helper: Sign in with email/password
export async function signInWithEmail(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error signing in:', error);
        return { success: false, error };
    }
}

// Helper: Sign out
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error signing out:', error);
        return { success: false, error };
    }
}

// Helper: Get current user
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { success: true, user };
    } catch (error) {
        console.error('Error getting user:', error);
        return { success: false, user: null, error };
    }
}

// Helper: Update user profile
export async function updateUserProfile(displayName: string, avatarUrl?: string) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: {
                display_name: displayName,
                avatar_url: avatarUrl,
            }
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error };
    }
}
