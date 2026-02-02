import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Image, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { flightService } from '../services/flightService';
import { useWallet } from '../context/WalletContext';
import { useNotification } from '../context/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Plane, ArrowLeft, ChevronRight, CheckCircle2, CreditCard, Info, MapPin, Calendar, Users, Briefcase, Search, X } from 'lucide-react-native';

const FlightScreen = ({ navigation }) => {
    const { refreshWallet, balance } = useWallet();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("search"); // search, results, details, confirmation
    const [airports, setAirports] = useState([]);
    const [searchResults, setSearchResults] = useState(null);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [itineraryDetails, setItineraryDetails] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(""); // Departure or Destination
    const [searchQuery, setSearchQuery] = useState("");

    const [searchParams, setSearchParams] = useState({
        type: "Oneway",
        class: "Y",
        adult: 1,
        itineraries: [
            { Departure: "", Destination: "", DepartureDate: "" }
        ]
    });

    const [passengerData, setPassengerData] = useState({
        firstname: "", lastname: "", email: "", phone: "", dob: "", title: "Mr"
    });

    useEffect(() => {
        fetchAirports();
    }, []);

    const fetchAirports = async () => {
        try {
            const data = await flightService.getAirports();
            setAirports(data || []);
        } catch (error) {
            showNotification('error', 'Error', 'Failed to load airports');
        }
    };

    const handleSearch = async () => {
        const itin = searchParams.itineraries[0];
        if (!itin.Departure || !itin.Destination) {
            return showNotification('error', 'Error', 'Select Departure & Destination');
        }
        if (!itin.DepartureDate) {
            return showNotification('error', 'Error', 'Select Departure Date');
        }
        setLoading(true);
        try {
            const results = await flightService.searchFlights(searchParams);
            setSearchResults(results);
            setStep("results");
        } catch (error) {
            showNotification('error', 'Search Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFlight = async (flight) => {
        setLoading(true);
        try {
            const res = await flightService.selectFlight({ id: flight.order_id || flight.trip_id, currency: "NGN" });
            setSelectedFlight(flight);
            setItineraryDetails(res);
            setStep("details");
        } catch (error) {
            showNotification('error', 'Selection Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        const fare = itineraryDetails?.order_amount || selectedFlight?.fare || selectedFlight?.amount || 0;
        if (balance < fare) {
            return showNotification('error', 'Insufficient Balance', 'Please fund your wallet');
        }
        if (!passengerData.firstname || !passengerData.lastname || !passengerData.email || !passengerData.phone) {
            return showNotification('error', 'Missing Info', 'Please fill all passenger details');
        }
        setLoading(true);
        try {
            const res = await flightService.bookFlight({
                ...passengerData,
                id: (itineraryDetails?.order_id || itineraryDetails?.trip_id) || (selectedFlight?.order_id || selectedFlight?.trip_id),
                total_amount: fare,
                currency: "NGN"
            });
            await refreshWallet();
            setStep("confirmation");
        } catch (error) {
            showNotification('error', 'Booking Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

    const openAirportModal = (type) => {
        setModalType(type);
        setSearchQuery("");
        setModalVisible(true);
    };

    const selectAirport = (airport) => {
        const next = [...searchParams.itineraries];
        if (modalType === "Departure") next[0].Departure = airport.AirportCode;
        else next[0].Destination = airport.AirportCode;
        setSearchParams({ ...searchParams, itineraries: next });
        setModalVisible(false);
    };

    const filteredAirports = airports.filter(a =>
        a.AirportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.AirportCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.City.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderHeader = () => (
        <LinearGradient colors={['#7C3AED', '#5C2D91']} style={styles.headerGradient}>
            <SafeAreaView edges={['top']}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => {
                        if (step === 'search') navigation.goBack();
                        else if (step === 'results') setStep('search');
                        else if (step === 'details') setStep('results');
                        else setStep('search');
                    }} style={styles.backBtn}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Flight Booking</Text>
                    <View style={styles.iconBox}>
                        <Plane color="#FFFFFF" size={20} />
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );

    const renderResults = () => {
        if (!searchResults) return null;

        let allFlights = [];
        if (Array.isArray(searchResults)) {
            allFlights = searchResults;
        } else if (typeof searchResults === 'object') {
            // Handle Travu object format where keys are providers
            Object.keys(searchResults).forEach(pk => {
                const providerData = searchResults[pk];
                if (providerData && Array.isArray(providerData.data)) {
                    allFlights = [...allFlights, ...providerData.data.map(f => ({ ...f, providerKey: pk }))];
                }
            });
        }

        if (allFlights.length === 0) {
            return (
                <View style={styles.emptyResults}>
                    <Info size={40} color="#94A3B8" />
                    <Text style={styles.emptyText}>No flights found for this route.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => setStep('search')}>
                        <Text style={styles.retryText}>Try Another Search</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return allFlights.map((f, i) => (
            <TouchableOpacity key={i} style={styles.flightCard} onPress={() => handleSelectFlight(f)}>
                <View style={styles.flightHeader}>
                    <Text style={styles.providerName}>{f.provider?.name || f.providerKey || "Flight"}</Text>
                    <Text style={styles.fareText}>{formatCurrency(f.fare || f.amount || 0)}</Text>
                </View>
                <View style={styles.routeRow}>
                    <Text style={styles.airportCode}>{f.departure_terminal || searchParams.itineraries[0].Departure}</Text>
                    <Plane size={16} color="#CBD5E1" />
                    <Text style={styles.airportCode}>{f.destination_terminal || searchParams.itineraries[0].Destination}</Text>
                </View>
                <View style={styles.footerRow}>
                    <Text style={styles.timeText}>{f.departure_time || f.trip_date || "Time TBD"}</Text>
                    {f.trip_no && <Text style={styles.tripNo}>{f.trip_no}</Text>}
                </View>
            </TouchableOpacity>
        ));
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Content with reduced opacity */}
            <View style={{ flex: 1, opacity: 0.3 }} pointerEvents="none">
                {renderHeader()}
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {step === 'search' && (
                        <View style={styles.card}>
                            <Text style={styles.label}>Departure Airport</Text>
                            <TouchableOpacity style={styles.pickerContainer}>
                                <MapPin size={20} color="#5C2D91" style={{ marginRight: 10 }} />
                                <Text style={[styles.input, { color: '#94A3B8' }]}>Select Departure</Text>
                            </TouchableOpacity>

                            <Text style={[styles.label, { marginTop: 16 }]}>Destination Airport</Text>
                            <TouchableOpacity style={styles.pickerContainer}>
                                <MapPin size={20} color="#5C2D91" style={{ marginRight: 10 }} />
                                <Text style={[styles.input, { color: '#94A3B8' }]}>Select Destination</Text>
                            </TouchableOpacity>

                            <Text style={[styles.label, { marginTop: 16 }]}>Date</Text>
                            <View style={styles.pickerContainer}>
                                <Calendar size={20} color="#5C2D91" style={{ marginRight: 10 }} />
                                <TextInput placeholder="YYYY-MM-DD" style={styles.input} />
                            </View>

                            <TouchableOpacity style={styles.searchBtn}>
                                <Text style={styles.btnText}>Find Flights</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Coming Soon Overlay */}
            <View style={styles.overlayContainer}>
                <View style={styles.comingSoonCard}>
                    <LinearGradient
                        colors={['#F5F3FF', '#FFFFFF']}
                        style={styles.comingSoonIconBg}
                    >
                        <Plane size={48} color="#5C2D91" />
                    </LinearGradient>

                    <Text style={styles.comingSoonTitle}>Coming Soon</Text>
                    <Text style={styles.comingSoonDescription}>
                        We are currently integrating with top airlines to bring you the best flight deals.
                    </Text>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                        <ArrowLeft size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {modalType} Airport</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    headerGradient: { paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
    iconBox: { width: 44, height: 44, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
    pickerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 16, borderRadius: 14, height: 56 },
    input: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '600' },
    searchBtn: { backgroundColor: '#5C2D91', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32, width: '100%' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    flightCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 12, elevation: 2 },
    flightHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    providerName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    fareText: { fontSize: 18, fontWeight: 'bold', color: '#5C2D91' },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    airportCode: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    timeText: { fontSize: 12, color: '#94A3B8' },
    tripNo: { fontSize: 11, color: '#CBD5E1', fontWeight: 'bold' },
    formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    formInput: { backgroundColor: '#F8FAFC', borderRadius: 12, height: 50, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', color: '#1E293B' },
    paymentInfo: { flexDirection: 'row', gap: 10, backgroundColor: '#F5F3FF', padding: 16, borderRadius: 12, marginTop: 10 },
    infoText: { fontSize: 13, color: '#5C2D91', fontWeight: 'bold' },
    confirmBox: { alignItems: 'center', paddingTop: 60 },
    confirmTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginTop: 24 },
    confirmDesc: { textAlign: 'center', color: '#64748B', marginTop: 12, marginBottom: 30 },
    emptyResults: { alignItems: 'center', padding: 40, marginTop: 20 },
    emptyText: { color: '#64748B', marginTop: 16, textAlign: 'center', fontSize: 16 },
    retryBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#F1F5F9' },
    retryText: { color: '#5C2D91', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '80%', padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    modalSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 20 },
    modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B' },
    airportItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    airportName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    airportLocation: { fontSize: 13, color: '#64748B', marginTop: 2 },
    codeBadge: { backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    codeText: { fontSize: 13, fontWeight: 'bold', color: '#5C2D91' },
    modalEmpty: { alignItems: 'center', marginTop: 40 },
    modalEmptyText: { color: '#94A3B8', fontSize: 15 },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 100,
    },
    comingSoonCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        shadowColor: '#5C2D91',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F5F3FF',
    },
    comingSoonIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    comingSoonTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 12,
        textAlign: 'center',
    },
    comingSoonDescription: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    backButton: {
        backgroundColor: '#5C2D91',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FlightScreen;
