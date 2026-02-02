import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear all AsyncStorage data
 * Use this to reset the app if you encounter persistent errors
 */
export const clearAllStorage = async () => {
    try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
        return false;
    }
};

/**
 * Get all AsyncStorage keys for debugging
 */
export const getAllStorageKeys = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        console.log('AsyncStorage keys:', keys);
        return keys;
    } catch (error) {
        console.error('Error getting AsyncStorage keys:', error);
        return [];
    }
};

/**
 * Get all AsyncStorage data for debugging
 */
export const getAllStorageData = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const data = await AsyncStorage.multiGet(keys);
        const storageData = {};
        data.forEach(([key, value]) => {
            storageData[key] = value;
        });
        console.log('AsyncStorage data:', storageData);
        return storageData;
    } catch (error) {
        console.error('Error getting AsyncStorage data:', error);
        return {};
    }
};
