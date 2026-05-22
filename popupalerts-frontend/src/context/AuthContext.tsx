import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const verifyUser = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
            const response = await apiClient.get('/auth/profile');
            setUser(response.data);
        } catch (error) {
            console.error("Token invalid, logging out.", error);
            localStorage.removeItem('access_token');
            delete apiClient.defaults.headers.common['Authorization'];
            setUser(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        verifyUser();
    }, [verifyUser]);

    const login = (token: string, userData: User) => {
        // Store everything synchronously
        localStorage.setItem('access_token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Use window.location for hard navigation - this ensures everything is saved
        const redirectPath = userData.role === 'admin' ? '/admin/dashboard' : '/app/dashboard';
        window.location.href = redirectPath;
    };
    
    const logout = () => {
        localStorage.removeItem('access_token');
        delete apiClient.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};