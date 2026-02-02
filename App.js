import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Home, Wallet, User, List } from 'lucide-react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WalletProvider } from './src/context/WalletContext';
// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import WalletScreen from './src/screens/WalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AirtimeScreen from './src/screens/AirtimeScreen';
import DataScreen from './src/screens/DataScreen';
import BillsScreen from './src/screens/BillsScreen';
import ElectricityScreen from './src/screens/ElectricityScreen';
import CableScreen from './src/screens/CableScreen';
import FlightScreen from './src/screens/FlightScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import TransactionDetailsScreen from './src/screens/TransactionDetailsScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerifyCodeScreen from './src/screens/VerifyCodeScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import { NotificationProvider } from './src/context/NotificationContext';
import EmailVerificationChecker from './src/components/EmailVerificationChecker';
import { PaystackWrapper } from './src/components/PaystackWrapper';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5C2D91',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5C2D91" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="Airtime" component={AirtimeScreen} />
          <Stack.Screen name="Data" component={DataScreen} />
          <Stack.Screen name="Bills" component={BillsScreen} />
          <Stack.Screen name="Electricity" component={ElectricityScreen} />
          <Stack.Screen name="Cable" component={CableScreen} />
          <Stack.Screen name="Flight" component={FlightScreen} />
          <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {

  return (
    <AuthProvider>
      <PaystackWrapper>
        <NotificationProvider>
          <WalletProvider>
            <NavigationContainer>
              <AppNavigator />
              <EmailVerificationChecker />
            </NavigationContainer>
          </WalletProvider>
        </NotificationProvider>
      </PaystackWrapper>
    </AuthProvider>
  );
}
