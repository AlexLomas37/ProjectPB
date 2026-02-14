import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './context';
import { router } from 'expo-router';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter both username and password.');
            return;
        }

        try {
            setIsSubmitting(true);
            await login({ username, password });
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900 justify-center">
            <View className="px-8 w-full">
                <Text className="text-4xl font-bold text-white text-center mb-12">ProjectPB</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-400 mb-2 font-medium">Username</Text>
                        <TextInput
                            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            placeholder="Enter your username"
                            placeholderTextColor="#6b7280"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2 font-medium">Password</Text>
                        <TextInput
                            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            placeholder="Enter your password"
                            placeholderTextColor="#6b7280"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        className={`w-full bg-blue-600 p-4 rounded-xl mt-6 ${isSubmitting ? 'opacity-70' : ''}`}
                        onPress={handleLogin}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="mt-8" onPress={() => router.push('/(auth)/register')}>
                    <Text className="text-gray-500 text-center">Don't have an account? Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
