"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    email: string;
    full_name: string;
    role: string;
    id: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Helper to decode JWT roughly to get user data (simplification)
// In production, we should hit a /me endpoint, but for now we trust the token payload or decode it
function parseJwt(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            setToken(storedToken);
            try {
                // We'll just store the user email in localstorage or derive from token for now
                // For a thorough implementation, we'd fetch /users/me here.
                // Let's rely on a stored 'user_data' for MVP speed, or fetch it.
                const userData = localStorage.getItem('user_data');
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (e) {
                console.error("Failed to restore session", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('access_token', newToken);
        localStorage.setItem('user_data', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
