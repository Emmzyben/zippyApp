import api from './api';

export const walletService = {
    async getBalance() {
        try {
            const response = await api.get('/wallet/balance');
            return response.data.balance;
        } catch (error) {
            console.error('Get Balance detailed error:', error.response?.status, error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to get balance. Check connection.');
        }
    },

    async getTransactions() {
        try {
            const response = await api.get('/transactions');
            return response.data.transactions;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get transactions');
        }
    },

    async fundWallet(amount) {
        try {
            const response = await api.post('/wallet/fund', { amount });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to initialize payment');
        }
    },

    async fundWalletMobile(amount, reference) {
        try {
            const response = await api.post('/wallet/fund-mobile', { amount, reference });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create transaction');
        }
    },

    async processTransaction(transactionData) {
        try {
            const response = await api.post('/wallet/transaction', transactionData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Transaction failed');
        }
    },

    async verifyPayment(reference) {
        try {
            const response = await api.post('/wallet/verify', { reference });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Payment verification failed');
        }
    },


    async getPaystackKey() {
        try {
            const response = await api.get('/wallet/config/paystack');
            return response.data.key;
        } catch (error) {
            console.error('Failed to fetch Paystack key:', error);
            return null;
        }
    }
};
