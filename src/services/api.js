import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://zippy-vtu.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/user/me')) {
            await AsyncStorage.removeItem('token');
            // Navigation to login should be handled by the UI/Context monitoring the token
        }
        return Promise.reject(error);
    }
);


export const phoneBeneficiariesAPI = {
    getAll: () => api.get('/beneficiaries/phone'),
    add: (data) => api.post('/beneficiaries/phone', data),
    delete: (id) => api.delete(`/beneficiaries/phone/${id}`),
};

export const emailBeneficiariesAPI = {
    getAll: () => api.get('/beneficiaries/email'),
    add: (data) => api.post('/beneficiaries/email', data),
    delete: (id) => api.delete(`/beneficiaries/email/${id}`),
};

export default api;
