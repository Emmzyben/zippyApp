import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { walletService } from '../services/walletService';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

const initialState = {
    balance: 0,
    transactions: [],
    loading: false,
    error: null
};

const walletReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_BALANCE':
            return { ...state, balance: action.payload };
        case 'SET_TRANSACTIONS':
            return { ...state, transactions: action.payload };
        case 'ADD_TRANSACTION':
            return {
                ...state,
                transactions: [action.payload, ...state.transactions]
            };
        case 'UPDATE_BALANCE':
            return {
                ...state,
                balance: state.balance + action.payload
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

export const WalletProvider = ({ children }) => {
    const [state, dispatch] = useReducer(walletReducer, initialState);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchWalletData();
        }
    }, [isAuthenticated, user]);

    const fetchWalletData = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const balance = await walletService.getBalance();
            const transactions = await walletService.getTransactions();
            dispatch({ type: 'SET_BALANCE', payload: balance });
            dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
        } catch (error) {
            // Quietly log error if wallet fetch fails to avoid disrupting the UI flow too much
            console.log("Wallet fetch error", error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const fundWallet = async (amount) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await walletService.fundWallet(amount);
            await fetchWalletData();
            return response;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const processTransaction = async (transactionData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await walletService.processTransaction(transactionData);
            dispatch({ type: 'ADD_TRANSACTION', payload: response.transaction });
            dispatch({ type: 'UPDATE_BALANCE', payload: -response.transaction.amount });
            return response;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const deductFromWallet = (amount) => {
        dispatch({ type: 'UPDATE_BALANCE', payload: -amount });
    };

    const addTransaction = (transaction) => {
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    };

    const value = {
        ...state,
        fundWallet,
        processTransaction,
        deductFromWallet,
        addTransaction,
        refreshWallet: fetchWalletData
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
