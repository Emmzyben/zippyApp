import api from './api';

export const flightService = {
    async getAirports() {
        try {
            const response = await api.get('/flights/airports');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch airports');
        }
    },

    async searchFlights(data) {
        try {
            const response = await api.post('/flights/search', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Flight search failed');
        }
    },

    async selectFlight(data) {
        try {
            const response = await api.post('/flights/select', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Flight selection failed');
        }
    },

    async bookFlight(data) {
        try {
            const response = await api.post('/flights/book', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Flight booking failed');
        }
    },

    async issueTicket(data) {
        try {
            const response = await api.post('/flights/ticket', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Ticket issuance failed');
        }
    },

    async getBookingDetails(bookingId) {
        try {
            const response = await api.get(`/flights/details/${bookingId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
        }
    }
};
