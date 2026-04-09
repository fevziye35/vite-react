import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface User {
    id: string;
    email: string;
    role: string;
    fullName: string;
    permissions: any;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchUserProfile(session.user.id, session.user.email!);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchUserProfile(session.user.id, session.user.email!);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (id: string, email: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (error) throw error;
            setUser({
                id,
                email,
                role: data.role,
                fullName: data.full_name,
                permissions: data.permissions
            });
        } catch (error) {
            console.error('Profil çekme hatası:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Giriş hatası:', error);
            return false;
        }
    };

    const loginWithOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: 'https://crm.makfaglobal.com/reset-password'
                }
            });
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('OTP Giriş hatası:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (email: string, _fullName?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // ŞİFRESİZ GİRİŞ LİNKİ GÖNDERME (Sihirli Link)
            // Redirect to /reset-password so user sets password immediately
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: 'https://crm.makfaglobal.com/reset-password',
                }
            });
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithOtp, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};