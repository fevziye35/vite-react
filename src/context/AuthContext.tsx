import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../services/supabase'; // Yeni oluşturduğumuz dosya

interface User {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Oturumu kontrol et (Bilgisayar kapansa da telefonun hatırlar)
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    fullName: session.user.user_metadata?.fullName,
                });
            }
            setIsLoading(false);
        };

        initializeAuth();

        // Oturum değişikliklerini dinle
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    fullName: session.user.user_metadata?.fullName,
                });
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

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

    const register = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { fullName }
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
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}