import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/authService';
import { Mail, ArrowLeft } from 'lucide-react-native';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const { showNotification } = useNotification();

    const handleSend = async () => {
        if (!email) return showNotification('error', 'Error', 'Please enter your email');

        console.log('Attempting to send forgot password email to:', email);
        setLoading(true);

        try {
            const result = await authService.forgotPassword(email);
            console.log('Forgot password success:', result);

            // Backend sends a link, not a code. So we just inform the user.
            showNotification('success', 'Email Sent', 'A password reset link has been sent to your email. Please check your inbox.');

            // Navigate back to login since reset happens in browser/webview via link
            navigation.navigate('Login');
        } catch (error) {
            console.error('Forgot password error:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            showNotification('error', 'Failed', error.message);
        } finally {
            setLoading(false);
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
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    enabled={Platform.OS === 'ios'}
                    style={styles.keyboardView}
                >
                    <View style={styles.innerContainer}>
                        {/* Custom Header with Back Button */}
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
                            {/* Logo & Header */}
                            <View style={styles.topSection}>
                                <View style={styles.logoContainer}>
                                    <Image
                                        source={require('../../assets/logo.png')}
                                        style={styles.logo}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={styles.title}>Forgot Password?</Text>
                                <Text style={styles.subtitle}>Enter your email to receive a reset code</Text>
                            </View>

                            {/* Form Card */}
                            <View style={styles.formCard}>
                                <View style={styles.inputWrapper}>
                                    <View style={[
                                        styles.inputContainer,
                                        focusedInput === 'email' && styles.inputContainerFocused
                                    ]}>
                                        <Mail size={20} color={focusedInput === 'email' ? '#5C2D91' : '#9CA3AF'} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email Address"
                                            placeholderTextColor="#9CA3AF"
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            onFocus={() => setFocusedInput('email')}
                                            onBlur={() => setFocusedInput(null)}
                                        />
                                    </View>
                                </View>

                                {/* Send Button */}
                                <TouchableOpacity
                                    style={[styles.btn, loading && styles.btnDisabled]}
                                    onPress={handleSend}
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
                                            <Text style={styles.btnText}>Send Reset Code</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Back to Login Link */}
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Login')}
                                    style={styles.loginLinkContainer}
                                >
                                    <Text style={styles.loginLinkText}>Remembered password? <Text style={styles.loginLinkAction}>Sign In</Text></Text>
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
        paddingHorizontal: 20,
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
    inputWrapper: {
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    inputContainerFocused: {
        borderColor: '#5C2D91',
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
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
    btnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLinkContainer: {
        alignItems: 'center',
    },
    loginLinkText: {
        color: '#6B7280',
        fontSize: 15,
    },
    loginLinkAction: {
        color: '#5C2D91',
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
