import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/walletService';
import { useNotification } from '../context/NotificationContext';
import { useWallet } from '../context/WalletContext';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard } from 'lucide-react-native';
import { CONFIG } from '../constants/Config';

/**
 * PaystackPayment Component
 * Handles Paystack payment integration for wallet funding
 * 
 * @param {number} amount - Amount to fund in Naira
 * @param {function} onSuccess - Callback function on successful payment
 * @param {function} onCancel - Callback function when payment is cancelled
 */
const PaystackPayment = ({ amount, onSuccess, onCancel }) => {
    const { popup } = usePaystack();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const { refreshWallet } = useWallet();
    const [loading, setLoading] = useState(false);
    const [publicKey, setPublicKey] = useState(null);

    React.useEffect(() => {
        const fetchKey = async () => {
            try {
                const key = await walletService.getPaystackKey();
                if (key) {
                    setPublicKey(key);
                } else {
                    console.warn('Paystack key not found');
                }
            } catch (error) {
                console.error('Error fetching Paystack key:', error);
            }
        };
        fetchKey();
    }, []);

    const initiatePayment = async () => {
        if (!publicKey) {
            showNotification('error', 'Configuration Error', 'Payment service not initialized. Please try again.');
            // Try fetching again if missing
            const key = await walletService.getPaystackKey();
            if (key) setPublicKey(key);
            else return;
            // If we just fetched it, we can proceed, but let's keep it simple and return first.
            // Actually, let's just return if still null.
            return;
        }

        if (!amount || parseFloat(amount) < 100) {
            showNotification('error', 'Error', 'Minimum amount is ₦100');
            return;
        }

        try {
            setLoading(true);

            // Generate unique reference
            const reference = `ZP_MOB_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

            // Open Paystack payment - let it generate reference
            popup.newTransaction({
                key: publicKey,
                email: user.email,
                amount: parseFloat(amount), // Amount in Naira
                reference: reference, // Explicitly set reference
                onSuccess: async (data) => {
                    setLoading(true);
                    showNotification('info', 'Processing', 'Verifying your payment...');

                    try {
                        const paystackReference = data.reference || data.trxref;

                        // Create transaction with Paystack's reference
                        await walletService.fundWalletMobile(parseFloat(amount), paystackReference);

                        // Small delay to let webhook arrive and process
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Poll for webhook to process the payment
                        let attempts = 0;
                        const maxAttempts = 8; // 8 seconds total

                        const checkStatus = async () => {
                            attempts++;

                            try {
                                const result = await walletService.verifyPayment(paystackReference);

                                if (result.status === 'success') {
                                    await refreshWallet();
                                    showNotification('success', 'Success', 'Wallet funded successfully!');

                                    if (onSuccess) {
                                        onSuccess(data);
                                    }
                                    setLoading(false);
                                    return true;
                                } else if (result.status === 'pending' && attempts < maxAttempts) {
                                    setTimeout(checkStatus, 1000);
                                } else if (attempts >= maxAttempts) {
                                    await refreshWallet();
                                    showNotification('warning', 'Payment Pending', 'Your payment is being processed. Please refresh your wallet in a moment.');
                                    setLoading(false);
                                } else {
                                    showNotification('error', 'Payment Failed', result.message || 'Payment was not successful');
                                    setLoading(false);
                                }
                            } catch (error) {
                                if (attempts < maxAttempts) {
                                    setTimeout(checkStatus, 1000);
                                } else {
                                    await refreshWallet();
                                    showNotification('warning', 'Payment Pending', 'Please refresh your wallet to check balance');
                                    setLoading(false);
                                }
                            }
                        };

                        checkStatus();

                    } catch (error) {
                        console.error('Payment processing error:', error);
                        showNotification('warning', 'Payment Pending', 'Please refresh your wallet to check balance');
                        await refreshWallet();
                        setLoading(false);
                    }
                },
                onError: (error) => {
                    console.error('Payment error:', error);
                    showNotification('error', 'Payment Failed', error.message || 'An error occurred during payment');
                    setLoading(false);
                },
                onCancel: () => {
                    console.log('Payment cancelled');
                    showNotification('info', 'Cancelled', 'Payment was cancelled');
                    setLoading(false);
                    if (onCancel) {
                        onCancel();
                    }
                },
            });

        } catch (error) {
            console.error('Payment initialization error:', error);
            showNotification('error', 'Error', error.message || 'Failed to initialize payment');
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.payButton, (loading || !publicKey) && styles.buttonDisabled]}
            onPress={initiatePayment}
            disabled={loading || !publicKey}
        >
            <LinearGradient
                colors={['#7C3AED', '#5C2D91']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <View style={styles.buttonContent}>
                        <CreditCard size={20} color="#FFFFFF" style={styles.icon} />
                        <Text style={styles.buttonText}>Pay with Paystack</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    payButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 16,
    },
    gradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});

export default PaystackPayment;