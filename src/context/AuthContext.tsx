import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

interface User {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
    permissions?: Record<string, boolean> | null;
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
        // Check for existing token on mount
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    // Verify token with server
                    const response = await axios.get(`${API_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Error checking session:', error);
                // Token is invalid, clear it
                localStorage.removeItem('auth_token');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            });

            const { user: userData, token } = response.data;

            // Store token
            localStorage.setItem('auth_token', token);
            setUser(userData);

            return true;
        } catch (error: any) {
            console.error('Login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            // If it's a validation/credential error, return false to show "Invalid credentials"
            if (error.response?.status === 401 || error.response?.status === 400) {
                return false;
            }
            
            // For other errors (network, 500), throw so the UI can show a more specific error
            throw error;
        }
    };

    const register = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                email,
                password,
                fullName
            });

            const { user: userData, token } = response.data;

            // Store token and login user
            localStorage.setItem('auth_token', token);
            setUser(userData);

            return { success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
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
