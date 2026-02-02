import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../context/NotificationContext';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { showNotification } = useNotification();

    const handleRegister = async () => {
        if (!formData.full_name || !formData.email || !formData.password) {
            showNotification('error', 'Error', 'Please fill in all required fields');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            showNotification('error', 'Error', 'Passwords do not match');
            return;
        }
        if (formData.password.length < 8) {
            showNotification('error', 'Error', 'Password must be at least 8 characters');
            return;
        }

        const complexityRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]).*$/;
        if (!complexityRegex.test(formData.password)) {
            showNotification('error', 'Error', 'Password must contain at least one uppercase letter and one special character');
            return;
        }

        console.log('Attempting registration with:', {
            ...formData,
            password: '***',
            confirmPassword: '***'
        });

        try {
            setLoading(true);
            const response = await register({
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            console.log('Registration success response:', response);
            showNotification('success', 'Welcome!', 'Account created successfully');
        } catch (error) {
            console.error('Registration failed:', error);
            console.error('Error message:', error.message);
            if (error.response) {
                console.error('Error details:', error.response.data);
                console.error('Status:', error.response.status);
            }
            showNotification('error', 'Registration Failed', error.message);
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
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join ZippyPay today</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.formCard}>
                            {/* Full Name Input */}
                            <View style={styles.inputWrapper}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'name' && styles.inputContainerFocused
                                ]}>
                                    <User size={20} color={focusedInput === 'name' ? '#5C2D91' : '#9CA3AF'} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full name"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.full_name}
                                        onChangeText={t => setFormData({ ...formData, full_name: t })}
                                        onFocus={() => setFocusedInput('name')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>

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
                                        value={formData.email}
                                        onChangeText={t => setFormData({ ...formData, email: t })}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>

                            {/* Phone Input */}
                            <View style={styles.inputWrapper}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'phone' && styles.inputContainerFocused
                                ]}>
                                    <Phone size={20} color={focusedInput === 'phone' ? '#5C2D91' : '#9CA3AF'} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Phone number"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.phone}
                                        onChangeText={t => setFormData({ ...formData, phone: t })}
                                        keyboardType="phone-pad"
                                        onFocus={() => setFocusedInput('phone')}
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
                                        value={formData.password}
                                        onChangeText={t => setFormData({ ...formData, password: t })}
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
                                    focusedInput === 'confirmPassword' && styles.inputContainerFocused
                                ]}>
                                    <Lock size={20} color={focusedInput === 'confirmPassword' ? '#5C2D91' : '#9CA3AF'} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm password"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.confirmPassword}
                                        onChangeText={t => setFormData({ ...formData, confirmPassword: t })}
                                        secureTextEntry={!showConfirmPassword}
                                        onFocus={() => setFocusedInput('confirmPassword')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        {showConfirmPassword ? (
                                            <Eye size={20} color="#9CA3AF" />
                                        ) : (
                                            <EyeOff size={20} color="#9CA3AF" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Password Strength Indicator */}
                            {formData.password.length > 0 && (
                                <View style={styles.passwordStrength}>
                                    <View style={styles.strengthBar}>
                                        <View style={[
                                            styles.strengthFill,
                                            {
                                                width: formData.password.length >= 8 ? '100%' :
                                                    formData.password.length >= 6 ? '66%' : '33%',
                                                backgroundColor: formData.password.length >= 8 ? '#10B981' :
                                                    formData.password.length >= 6 ? '#F59E0B' : '#EF4444'
                                            }
                                        ]} />
                                    </View>
                                    <Text style={styles.strengthText}>
                                        {formData.password.length >= 8 ? 'Strong' :
                                            formData.password.length >= 6 ? 'Medium' : 'Weak'}
                                    </Text>
                                </View>
                            )}

                            {/* Register Button */}
                            <TouchableOpacity
                                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                                onPress={handleRegister}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#7C3AED', '#5C2D91']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.registerButtonGradient}
                                >
                                    <Text style={styles.registerButtonText}>
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Terms */}
                            <Text style={styles.termsText}>
                                By signing up, you agree to our{' '}
                                <Text style={styles.termsLink}>Terms of Service</Text>
                                {' '}and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Login Link */}
                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.loginLink}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
            <LoadingSpinner visible={loading} text="Creating account..." />
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
        marginBottom: 24,
    },
    logoContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
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
    passwordStrength: {
        marginBottom: 20,
    },
    strengthBar: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 12,
        color: '#6B7280',
    },
    registerButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    termsText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 18,
    },
    termsLink: {
        color: '#5C2D91',
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#6B7280',
        fontSize: 15,
    },
    loginLink: {
        color: '#5C2D91',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
