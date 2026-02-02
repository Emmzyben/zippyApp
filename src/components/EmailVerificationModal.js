import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { Mail } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';

const EmailVerificationModal = ({ isOpen }) => {
    const { user, verifyEmail } = useAuth(); // Assuming verifyEmail updates the user context state
    const { showNotification } = useNotification();

    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [verified, setVerified] = useState(false);

    const inputRefs = useRef([]);
    const email = user?.email;

    useEffect(() => {
        if (isOpen && email && !verified) {
            sendVerification();
        }
    }, [isOpen]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const sendVerification = async () => {
        try {
            await authService.sendVerification(email);
            showNotification('info', 'Code Sent', `A code has been sent to ${email}`);
            setCountdown(30);
        } catch (error) {
            showNotification('error', 'Error', error.response?.data?.message || 'Failed to send code');
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) return showNotification('error', 'Error', 'Enter complete code');

        setLoading(true);
        try {
            await verifyEmail(email, code); // This should update the global user state
            setVerified(true);
            showNotification('success', 'Verified', 'Email verified successfully!');
            // Modal closes via parent checking user.is_verified
        } catch (error) {
            showNotification('error', 'Failed', error.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await authService.sendVerification(email);
            showNotification('info', 'Code Sent', 'New code sent to your email');
            setCountdown(30);
            setOtp(new Array(6).fill(''));
        } catch (error) {
            showNotification('error', 'Error', error.message);
        } finally {
            setResendLoading(false);
        }
    };

    const handleChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleBackspace = (key, index) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal visible={Boolean(isOpen)} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconBox}>
                        <Mail color="#5C2D91" size={32} />
                    </View>

                    <Text style={styles.title}>Email Verification</Text>
                    <Text style={styles.subtitle}>
                        Verify your email address to continue. Using <Text style={{ fontWeight: 'bold' }}>{email}</Text>
                    </Text>

                    {!verified && (
                        <>
                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={ref => inputRefs.current[index] = ref}
                                        style={styles.otpInput}
                                        value={digit}
                                        onChangeText={text => handleChange(text, index)}
                                        onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        textAlign="center"
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.btn, (loading || otp.join('').length < 6) && styles.btnDisabled]}
                                onPress={handleVerify}
                                disabled={loading || otp.join('').length < 6}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Email</Text>}
                            </TouchableOpacity>

                            <View style={styles.resendContainer}>
                                {countdown > 0 ? (
                                    <Text style={styles.resendText}>Resend in {countdown}s</Text>
                                ) : (
                                    <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                                        {resendLoading ? (
                                            <ActivityIndicator size="small" color="#5C2D91" />
                                        ) : (
                                            <Text style={styles.resendLink}>Resend Code</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center'
    },
    iconBox: {
        backgroundColor: '#F3E8FF',
        padding: 15,
        borderRadius: 50,
        marginBottom: 15
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1F2937'
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22
    },
    otpContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 25,
        justifyContent: 'center'
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 10,
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#F9FAFB'
    },
    btn: {
        backgroundColor: '#5C2D91',
        paddingVertical: 14,
        width: '100%',
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20
    },
    btnDisabled: {
        opacity: 0.7,
        backgroundColor: '#A78BFA'
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    resendContainer: {
        height: 30,
        justifyContent: 'center'
    },
    resendText: {
        color: '#9CA3AF'
    },
    resendLink: {
        color: '#5C2D91',
        fontWeight: '600',
        fontSize: 15
    }
});

export default EmailVerificationModal;
