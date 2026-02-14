import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator, localhost is 10.0.2.2
// For iOS Simulator, localhost is 127.0.0.1
// For Physical Device, use your computer's LAN IP (e.g., 192.168.x.x)
const DEV_API_URL = Platform.select({
    android: 'http://192.168.1.128:8080/api/v1',
    ios: 'http://192.168.1.128:8080/api/v1',
    default: 'http://192.168.1.128:8080/api/v1',
});

// Create axios instance
export const api = axios.create({
    baseURL: DEV_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10s timeout
});

// Add interceptor to log requests in dev
api.interceptors.request.use((config) => {
    if (__DEV__) {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
});

// Add interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (__DEV__) {
            console.error('[API Error]', error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);
