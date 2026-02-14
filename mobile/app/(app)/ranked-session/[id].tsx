import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { RankedSession } from '@/src/features/ranked/types';
import { RankedService } from '@/src/features/ranked/api';
import { SessionDetail } from '@/src/features/ranked/components/SessionDetail';
import { Ionicons } from '@expo/vector-icons';

export default function RankedSessionDetailScreen() {
    const { id } = useLocalSearchParams();
    const [session, setSession] = useState<RankedSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            if (typeof id !== 'string') return;
            const data = await RankedService.getSessionById(id);
            setSession(data);
            setIsLoading(false);
        };
        loadSession();
    }, [id]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    if (!session) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Session not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-400">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleUpdate = (updated: RankedSession) => {
        setSession(updated);
    };

    const handleEndSession = () => {
        Alert.alert(
            "End Session",
            "Are you sure you want to end this ranked session?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "End Session",
                    style: "destructive",
                    onPress: async () => {
                        await RankedService.endSession();
                        if (typeof id === 'string') {
                            const updated = await RankedService.getSessionById(id);
                            setSession(updated);
                        }
                        // Optional: Navigate back to the main ranked screen
                        router.back();
                    }
                }
            ]
        );
    };

    const handleDeleteSession = () => {
        Alert.alert(
            "Delete Session",
            "Are you sure you want to delete this session? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (session?.id) {
                            await RankedService.deleteSession(session.id);
                            router.back();
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="px-4 py-2 border-b border-gray-800 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Session Details</Text>
            </View>

            <SessionDetail
                session={session}
                isHistory={session.status === 'COMPLETED'}
                onUpdate={handleUpdate}
                onEndSession={session.status === 'ACTIVE' ? handleEndSession : undefined}
                onDeleteSession={session.status === 'COMPLETED' ? handleDeleteSession : undefined}
            />
        </SafeAreaView>
    );
}
