import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, Fingerprint } from 'lucide-react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import biometricService from '../services/biometricService';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricType, setBiometricType] = useState('Biometric');
    const { login, loginWithBiometric, loading } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            await loginWithBiometric();
        } catch (error) {
            console.log('Biometric login error:', error.message);

            // Don't show alert if user just cancelled
            if (error.message && error.message.includes('cancelled')) {
                // User cancelled, just return silently
                return;
            }

            // Show error for actual failures
            Alert.alert(
                'Biometric Login Failed',
                error.message || 'Please try again or use password login'
            );
        }
    };

    useEffect(() => {
        const checkBiometric = async () => {
            try {
                const available = await biometricService.isAvailable();
                const enabled = await biometricService.isBiometricEnabled();
                const typeName = await biometricService.getBiometricTypeName();

                setBiometricAvailable(available);
                setBiometricEnabled(enabled);
                setBiometricType(typeName);
            } catch (error) {
                console.error('Error checking biometric:', error);
            }
        };

        checkBiometric();
    }, []);

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
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo & Header */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../assets/logo.png')}
                                    style={styles.logo}
                                    resizeMode="cover"
                                />
                            </View>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Sign in to continue to ZippyPay</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.formCard}>
                            {/* Email Input */}
                            <View style={styles.inputWrapper}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'email' && styles.inputContainerFocused
                                ]}>
                                    <Mail size={20} color={focusedInput === 'email' ? '#5C2D91' : '#9CA3AF'} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email address"
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

                            {/* Password Input */}
                            <View style={styles.inputWrapper}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'password' && styles.inputContainerFocused
                                ]}>
                                    <Lock size={20} color={focusedInput === 'password' ? '#5C2D91' : '#9CA3AF'} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="#9CA3AF"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        {showPassword ? (
                                            <Eye size={20} color="#9CA3AF" />
                                        ) : (
                                            <EyeOff size={20} color="#9CA3AF" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ForgotPassword')}
                                style={styles.forgotPassword}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#7C3AED', '#5C2D91']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.loginButtonGradient}
                                >
                                    <Text style={styles.loginButtonText}>
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Biometric Login Button */}
                            {biometricAvailable && biometricEnabled && (
                                <TouchableOpacity
                                    style={styles.biometricButton}
                                    onPress={handleBiometricLogin}
                                    disabled={loading}
                                    activeOpacity={0.7}
                                >
                                    <Fingerprint size={24} color="#5C2D91" />
                                    <Text style={styles.biometricButtonText}>
                                        Login with {biometricType}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Register Link */}
                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.registerLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
            <LoadingSpinner visible={loading} text="Logging in..." />
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
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
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
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
        marginBottom: 16,
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
    eyeIcon: {
        padding: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#5C2D91',
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9CA3AF',
        fontSize: 14,
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    biometricButtonText: {
        color: '#5C2D91',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#6B7280',
        fontSize: 15,
    },
    registerLink: {
        color: '#5C2D91',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
