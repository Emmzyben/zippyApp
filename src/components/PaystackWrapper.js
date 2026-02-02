import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PaystackProvider } from 'react-native-paystack-webview';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/walletService';

export const PaystackWrapper = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [publicKey, setPublicKey] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKey = async () => {
            if (isAuthenticated) {
                try {
                    const key = await walletService.getPaystackKey();
                    if (key) {
                        setPublicKey(key);
                    } else {
                        console.warn('Paystack public key not found from backend');
                    }
                } catch (error) {
                    console.error('Failed to fetch Paystack public key:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchKey();
    }, [isAuthenticated]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#5C2D91" />
            </View>
        );
    }

    if (!publicKey) {
        // Fallback or render children without provider if key is missing (might cause errors in usePaystack)
        // ideally we shouldn't be here if authenticated and config is correct
        console.warn('PaystackWrapper rendering without valid public key');
        return <>{children}</>;
    }

    return (
        <PaystackProvider
            debug
            publicKey={publicKey}
            currency='NGN'
            defaultChannels={['card', 'bank', 'ussd', 'qr', 'bank_transfer']}
        >
            {children}
        </PaystackProvider>
    );
};
