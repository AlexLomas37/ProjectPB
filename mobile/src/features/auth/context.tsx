import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthService } from './api';
import { api } from '@/src/shared/api/client';
import { AuthState, LoginRequest, RegisterRequest, User } from './types';
import { router } from 'expo-router';

interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'projectpb_auth_token';
const USER_KEY = 'projectpb_auth_user';

const Storage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        await SecureStore.setItemAsync(key, value);
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        await SecureStore.deleteItemAsync(key);
    },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Load session on startup
    useEffect(() => {
        const loadSession = async () => {
            try {
                const token = await Storage.getItem(TOKEN_KEY);
                const userStr = await Storage.getItem(USER_KEY);

                if (token && userStr) {
                    const user = JSON.parse(userStr);
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setState({
                        token,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (e) {
                console.error('[Auth] Failed to load session', e);
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };
        loadSession();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            setState((prev) => ({ ...prev, isLoading: true }));

            // OFFLINE MODE CHECK
            if (credentials.username.toLowerCase() === 'offline') {
                const offlineUser: User = {
                    id: 'offline',
                    username: 'Offline Player',
                    email: 'offline@bmad.gg',
                    roles: ['ROLE_USER'],
                };
                const offlineToken = 'offline_token_secret';

                await Storage.setItem(TOKEN_KEY, offlineToken);
                await Storage.setItem(USER_KEY, JSON.stringify(offlineUser));

                setState({
                    user: offlineUser,
                    token: offlineToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
                router.replace('/(app)/(tabs)/training');
                return;
            }

            const response = await AuthService.login(credentials);
            // ... rest of normal login
            const user: User = {
                id: response.id,
                username: response.username,
                email: response.email,
                roles: response.roles,
            };

            await Storage.setItem(TOKEN_KEY, response.token);
            await Storage.setItem(USER_KEY, JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

            setState({
                user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
            });

            router.replace('/(app)/(tabs)/training');
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            setState((prev) => ({ ...prev, isLoading: true }));
            await AuthService.register(data);
            // Auto-login after register
            await login({ username: data.username, password: data.password });
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const signOut = async () => {
        await Storage.deleteItem(TOKEN_KEY);
        await Storage.deleteItem(USER_KEY);
        delete api.defaults.headers.common['Authorization'];

        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });

        router.replace('/(auth)/login');
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
