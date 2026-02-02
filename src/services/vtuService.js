import api from './api';

export const vtuService = {
    async buyAirtime(data) {
        try {
            const response = await api.post('/vtu/airtime', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Airtime purchase failed');
        }
    },

    async buyData(data) {
        try {
            const response = await api.post('/vtu/data', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Data purchase failed');
        }
    },

    async payBill(data) {
        try {
            const response = await api.post('/vtu/bills', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Bill payment failed');
        }
    },

    async verifySmartcard(data) {
        try {
            const response = await api.post('/vtu/verify-smartcard', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Smartcard verification failed');
        }
    },

    async verifyMeter(data) {
        try {
            const response = await api.post('/vtu/verify-meter', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Meter verification failed');
        }
    },

    async getServices() {
        try {
            const response = await api.get('/vtu/services');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch services');
        }
    },

    async getVariations(serviceID) {
        try {
            const response = await api.get(`/vtu/variations/${serviceID}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch service variations');
        }
    }
};
