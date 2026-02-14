import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './context';
import { router } from 'expo-router';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { register } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            setIsSubmitting(true);
            await register({ username, email, password });
            // Navigation handled by auto-login in context -> dashboard
            // But we can add a listener or just rely on the context state change
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900 justify-center">
            <View className="px-8 w-full">
                <TouchableOpacity onPress={() => router.back()} className="mb-8">
                    <Text className="text-gray-400">← Back to Login</Text>
                </TouchableOpacity>

                <Text className="text-4xl font-bold text-white text-center mb-8">Join ProjectPB</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-400 mb-2 font-medium">Username</Text>
                        <TextInput
                            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            placeholder="Username"
                            placeholderTextColor="#6b7280"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2 font-medium">Email</Text>
                        <TextInput
                            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            placeholder="Email"
                            placeholderTextColor="#6b7280"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2 font-medium">Password</Text>
                        <TextInput
                            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            placeholder="Password"
                            placeholderTextColor="#6b7280"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2 font-medium">Confirm Password</Text>
                        <TextInput
                            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            placeholder="Confirm Password"
                            placeholderTextColor="#6b7280"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        className={`w-full bg-green-600 p-4 rounded-xl mt-6 ${isSubmitting ? 'opacity-70' : ''}`}
                        onPress={handleRegister}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
