import api from './api';

export const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            const data = error.response?.data;
            if (data && data.errors) {
                throw new Error(data.errors.map(e => e.msg).join(', '));
            }
            throw new Error(data?.message || 'Registration failed');
        }
    },

    async getCurrentUser() {
        try {
            const response = await api.get('/user/me');
            return response.data.user;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get user');
        }
    },

    async updateProfile(userData) {
        try {
            const response = await api.put('/user/profile', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Profile update failed');
        }
    },

    async changePassword(passwords) {
        try {
            const response = await api.put('/user/password', passwords);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Password change failed');
        }
    },

    async forgotPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send reset email');
        }
    },

    async resetPassword(token, newPassword) {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to reset password');
        }
    },

    async verifyEmail(email, code) {
        try {
            const response = await api.post('/auth/verify-email', { email, code });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Email verification failed');
        }
    },

    async sendVerification(email) {
        try {
            const response = await api.post('/auth/send-verification', { email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send verification code');
        }
    },

    async verifyCode(email, code) {
        try {
            const response = await api.post('/auth/verify-code', { email, code });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Code verification failed');
        }
    },
};
