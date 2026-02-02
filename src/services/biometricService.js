import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_EMAIL_KEY = 'biometric_email';
const BIOMETRIC_PASSWORD_KEY = 'biometric_password';

class BiometricService {
    // Check if device supports biometric authentication
    async isAvailable() {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            return hasHardware && isEnrolled;
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            return false;
        }
    }

    // Get supported authentication types
    async getSupportedTypes() {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            return types;
        } catch (error) {
            console.error('Error getting supported types:', error);
            return [];
        }
    }

    // Authenticate with biometrics
    async authenticate(promptMessage = 'Authenticate to continue') {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                disableDeviceFallback: false, // Allow fallback for Expo Go compatibility
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel',
            });

            console.log('Authentication result:', JSON.stringify(result, null, 2));

            return result.success;
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return false;
        }
    }

    // Save credentials securely
    async saveCredentials(email, password) {
        try {
            await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
            await SecureStore.setItemAsync(BIOMETRIC_PASSWORD_KEY, password);
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
            return true;
        } catch (error) {
            console.error('Error saving credentials:', error);
            return false;
        }
    }

    // Get saved credentials
    async getCredentials() {
        try {
            const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
            const password = await SecureStore.getItemAsync(BIOMETRIC_PASSWORD_KEY);

            if (email && password) {
                return { email, password };
            }
            return null;
        } catch (error) {
            console.error('Error getting credentials:', error);
            return null;
        }
    }

    // Check if biometric login is enabled
    async isBiometricEnabled() {
        try {
            const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
            return enabled === 'true';
        } catch (error) {
            console.error('Error checking biometric status:', error);
            return false;
        }
    }

    // Enable biometric login
    async enableBiometric(email, password) {
        try {
            const isAvailable = await this.isAvailable();
            if (!isAvailable) {
                throw new Error('Biometric authentication is not available on this device');
            }

            const authenticated = await this.authenticate('Authenticate to enable biometric login');
            if (!authenticated) {
                throw new Error('Authentication failed');
            }

            await this.saveCredentials(email, password);
            return true;
        } catch (error) {
            console.error('Error enabling biometric:', error);
            throw error;
        }
    }

    // Disable biometric login
    async disableBiometric() {
        try {
            await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
            await SecureStore.deleteItemAsync(BIOMETRIC_PASSWORD_KEY);
            await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
            return true;
        } catch (error) {
            console.error('Error disabling biometric:', error);
            return false;
        }
    }

    // Login with biometric
    async loginWithBiometric() {
        try {
            const isEnabled = await this.isBiometricEnabled();
            if (!isEnabled) {
                throw new Error('Biometric login is not enabled');
            }

            const authenticated = await this.authenticate('Login with biometric');

            // Log the authentication result for debugging
            console.log('Biometric authentication result:', authenticated);

            if (!authenticated) {
                // User cancelled or authentication failed
                throw new Error('Biometric authentication was cancelled or failed');
            }

            const credentials = await this.getCredentials();
            if (!credentials) {
                throw new Error('No saved credentials found');
            }

            return credentials;
        } catch (error) {
            console.error('Error logging in with biometric:', error);
            throw error;
        }
    }

    // Get biometric type name for display
    async getBiometricTypeName() {
        try {
            const types = await this.getSupportedTypes();
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                return 'Face ID';
            } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                return 'Fingerprint';
            } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                return 'Iris';
            }
            return 'Biometric';
        } catch (error) {
            console.error('Error getting biometric type name:', error);
            return 'Biometric';
        }
    }
}

export default new BiometricService();
