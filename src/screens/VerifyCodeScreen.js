import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/authService';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';

const VerifyCodeScreen = ({ navigation, route }) => {
    const { email, type } = route.params; // type: 'reset' or 'verify'
    const [code, setCode] = useState(new Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const { showNotification } = useNotification();
    const inputs = useRef([]);

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length < 6) return showNotification('error', 'Error', 'Please enter the complete 6-digit code');

        setLoading(true);
        try {
            if (type === 'reset') {
                await authService.verifyCode(email, fullCode);
                navigation.navigate('ResetPassword', { email, code: fullCode });
            } else {
                await authService.verifyEmail(email, fullCode);
                showNotification('success', 'Success', 'Email verified successfully!');
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
        } catch (error) {
            showNotification('error', 'Verification Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (text, index) => {
        if (text.length > 1) {
            text = text.slice(-1);
        }
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient
                colors={['#0F172A', '#1E293B', '#5C2D91']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.innerContainer}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <ArrowLeft color="#FFFFFF" size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.topSection}>
                                <View style={styles.logoContainer}>
                                    <Image
                                        source={require('../../assets/logo.png')}
                                        style={styles.logo}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={styles.title}>Account Security</Text>
                                <Text style={styles.subtitle}>Enter the 6-digit code sent to:</Text>
                                <Text style={styles.emailText}>{email}</Text>
                            </View>

                            <View style={styles.formCard}>
                                <View style={styles.codeContainer}>
                                    {code.map((digit, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.inputWrapper,
                                                focusedIndex === index && styles.inputWrapperFocused
                                            ]}
                                        >
                                            <TextInput
                                                ref={ref => inputs.current[index] = ref}
                                                style={styles.codeInput}
                                                value={digit}
                                                onChangeText={text => handleChange(text, index)}
                                                onKeyPress={e => handleKeyPress(e, index)}
                                                onFocus={() => setFocusedIndex(index)}
                                                onBlur={() => setFocusedIndex(null)}
                                                maxLength={1}
                                                keyboardType="number-pad"
                                                textAlign="center"
                                                placeholder="0"
                                                placeholderTextColor="#E5E7EB"
                                            />
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[styles.btn, loading && styles.btnDisabled]}
                                    onPress={handleVerify}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#7C3AED', '#5C2D91']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.btnGradient}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <View style={styles.btnInner}>
                                                <ShieldCheck size={20} color="#fff" style={styles.btnIcon} />
                                                <Text style={styles.btnText}>Verify Now</Text>
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.resendContainer}>
                                    <Text style={styles.resendText}>Haven't received the code?</Text>
                                    <Text style={styles.resendAction}>Resend Code</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    topSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    emailText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginTop: 4,
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    inputWrapper: {
        width: '14%',
        aspectRatio: 0.8,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapperFocused: {
        borderColor: '#5C2D91',
        backgroundColor: '#FFFFFF',
        shadowColor: '#5C2D91',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    codeInput: {
        width: '100%',
        height: '100%',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    btn: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    btnDisabled: {
        opacity: 0.7,
    },
    btnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    btnInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnIcon: {
        marginRight: 8,
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendContainer: {
        alignItems: 'center',
    },
    resendText: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 4,
    },
    resendAction: {
        color: '#5C2D91',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default VerifyCodeScreen;
