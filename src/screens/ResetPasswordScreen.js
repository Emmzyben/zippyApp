import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../context/NotificationContext';
import { authService } from '../services/authService';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';

const ResetPasswordScreen = ({ navigation, route }) => {
    const { email, code } = route.params;
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleReset = async () => {
        if (!password || !confirm) return showNotification('error', 'Error', 'Please fill in both fields');
        if (password !== confirm) return showNotification('error', 'Error', 'Passwords do not match');
        if (password.length < 6) return showNotification('error', 'Error', 'Password must be at least 6 characters');

        setLoading(true);
        try {
            await authService.resetPassword(code, password); // API takes token (code) and newPassword
            showNotification('success', 'Success', 'Your password has been reset successfully');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (error) {
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
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
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
                            <Text style={styles.title}>New Password</Text>
                            <Text style={styles.subtitle}>Set a secure password for your account</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.formCard}>
                            {/* Password Input */}
                            <View style={styles.inputWrapper}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'password' && styles.inputContainerFocused
                                ]}>
                                    <Lock size={20} color={focusedInput === 'password' ? '#5C2D91' : '#9CA3AF'} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="New Password"
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

                            {/* Confirm Password Input */}
                            <View style={styles.inputWrapper}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'confirm' && styles.inputContainerFocused
                                ]}>
                                    <Lock size={20} color={focusedInput === 'confirm' ? '#5C2D91' : '#9CA3AF'} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        placeholderTextColor="#9CA3AF"
                                        value={confirm}
                                        onChangeText={setConfirm}
                                        secureTextEntry={!showConfirm}
                                        onFocus={() => setFocusedInput('confirm')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirm(!showConfirm)}
                                        style={styles.eyeIcon}
                                    >
                                        {showConfirm ? (
                                            <Eye size={20} color="#9CA3AF" />
                                        ) : (
                                            <EyeOff size={20} color="#9CA3AF" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Requirements */}
                            <View style={styles.requirements}>
                                <Text style={styles.reqTitle}>Security Checklist:</Text>
                                <View style={styles.reqItem}>
                                    <CheckCircle2 size={14} color={password.length >= 6 ? '#10B981' : '#9CA3AF'} />
                                    <Text style={[styles.reqText, password.length >= 6 && styles.reqTextSuccess]}>Minimum 6 characters</Text>
                                </View>
                                <View style={styles.reqItem}>
                                    <CheckCircle2 size={14} color={(password && password === confirm) ? '#10B981' : '#9CA3AF'} />
                                    <Text style={[styles.reqText, (password && password === confirm) && styles.reqTextSuccess]}>Passwords matches</Text>
                                </View>
                            </View>

                            {/* Reset Button */}
                            <TouchableOpacity
                                style={[styles.btn, loading && styles.btnDisabled]}
                                onPress={handleReset}
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
                                        <Text style={styles.btnText}>Update Password</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
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
        shadowColor: '#5C2D91',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
    requirements: {
        marginBottom: 24,
        marginTop: 8,
    },
    reqTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    reqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    reqText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 8,
    },
    reqTextSuccess: {
        color: '#10B981',
        fontWeight: '500',
    },
    btn: {
        borderRadius: 12,
        overflow: 'hidden',
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
});

export default ResetPasswordScreen;
