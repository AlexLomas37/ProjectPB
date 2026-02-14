import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useGameSocket } from '@/src/features/session/hooks/useGameSocket';
import { WarmupTimer } from '@/src/features/session/components/WarmupTimer';
import { RemoteControl } from '@/src/features/session/components/RemoteControl';

export default function SessionScreen() {
    const { id } = useLocalSearchParams();
    const gameId = Array.isArray(id) ? id[0] : id;
    const { isConnected, sendTag } = useGameSocket(gameId);
    const [sessionState, setSessionState] = useState<'WARMUP' | 'ACTIVE'>('WARMUP');

    const handleWarmupComplete = () => {
        setSessionState('ACTIVE');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="p-4 border-b border-gray-800 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-gray-400">Exit</Text>
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Match #{gameId}</Text>
                <View className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </View>

            {/* Content */}
            <View className="flex-1 justify-center">
                {sessionState === 'WARMUP' ? (
                    <WarmupTimer duration={5} onComplete={handleWarmupComplete} />
                ) : (
                    <RemoteControl onTag={sendTag} />
                )}
            </View>

            {/* Footer Info */}
            <View className="p-4 items-center">
                <Text className="text-gray-600 text-xs">
                    Status: {isConnected ? 'Connected' : 'Connecting...'} | Mode: {sessionState}
                </Text>
            </View>
        </SafeAreaView>
    );
}
