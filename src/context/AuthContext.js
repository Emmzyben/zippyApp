import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import biometricService from '../services/biometricService';

const AuthContext = createContext();

const initialState = {
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_USER':
            const user = { ...action.payload };
            if (user.is_verified !== undefined) {
                user.is_verified = Boolean(user.is_verified);
            }
            return {
                ...state,
                user,
                isAuthenticated: Boolean(action.payload),
                loading: false
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        // No auto-login - user must log in fresh on app start
        // Just set loading to false to show the login screen
        dispatch({ type: 'SET_LOADING', payload: false });
    }, []);

    const login = async (email, password) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await authService.login(email, password);
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            dispatch({ type: 'SET_USER', payload: response.user });
            return response;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            const response = await authService.verifyEmail(email, code);
            // Assuming response has updated user or success
            // If response doesn't have user, we manually update locally
            const updatedUser = { ...state.user, is_verified: true };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            dispatch({ type: 'SET_USER', payload: updatedUser });
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await authService.register(userData);
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            dispatch({ type: 'SET_USER', payload: response.user });
            return response;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    const loginWithToken = async (token, user) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            dispatch({ type: 'SET_USER', payload: user });
            return { token, user };
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const loginWithBiometric = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            // Get credentials using biometric authentication
            const credentials = await biometricService.loginWithBiometric();

            // Login with the retrieved credentials
            const response = await authService.login(credentials.email, credentials.password);
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            dispatch({ type: 'SET_USER', payload: response.user });
            return response;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        loginWithToken,
        loginWithBiometric,
        verifyEmail
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
