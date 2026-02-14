import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { RankedSession } from '@/src/features/ranked/types';
import { RankedService } from '@/src/features/ranked/api';
import { useGame } from '@/src/features/game/context';

export default function RankedScreen() {
    const { selectedGame, themeColor, backgroundColor } = useGame();
    const [activeSession, setActiveSession] = useState<RankedSession | null>(null);
    const [history, setHistory] = useState<RankedSession[]>([]);
    const [startLp, setStartLp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadData = async () => {
        // Load Active Session
        const active = await RankedService.getActiveSession();
        if (active && active.game === selectedGame) {
            setActiveSession(active);
        } else {
            setActiveSession(null);
        }

        // Load History
        const allHistory = await RankedService.getHistory();
        setHistory(allHistory.filter(s => s.game === selectedGame));
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedGame])
    );

    const handleStartSession = async () => {
        if (!startLp) {
            Alert.alert('Required', 'Please enter your starting LP');
            return;
        }
        setIsLoading(true);
        const newSession = await RankedService.startSession(parseInt(startLp), selectedGame);
        setActiveSession(newSession);
        setIsLoading(false);
        // Navigate to detail immediately? Or stay to show "Active" card?
        // Let's stay and update state.
        loadData();
    };

    const openSession = (id: string) => {
        router.push({ pathname: '/(app)/ranked-session/[id]', params: { id } });
    };

    const renderHistoryItem = ({ item }: { item: RankedSession }) => {
        const wins = item.games.filter(g => g.result === 'WIN').length;
        const losses = item.games.filter(g => g.result === 'LOSS').length;
        const lpDiff = item.currentLp - item.startLp;

        return (
            <TouchableOpacity
                onPress={() => openSession(item.id)}
                className="bg-gray-800 p-4 rounded-xl mb-3 flex-row justify-between items-center"
            >
                <View>
                    <Text className="text-gray-400 text-xs mb-1">
                        {new Date(item.startTime).toLocaleDateString()}
                    </Text>
                    <Text className="text-white font-bold text-lg">
                        {item.startLp} <Text className="text-gray-500">→</Text> {item.currentLp} LP
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text className={`font-bold ${lpDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {lpDiff > 0 ? '+' : ''}{lpDiff} LP
                    </Text>
                    <Text className="text-gray-400 text-xs">{wins}W - {losses}L</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 px-4 pt-2" style={{ backgroundColor }} edges={['bottom', 'left', 'right']}>
            <Text className="text-white text-3xl font-bold mb-6">Ranked</Text>

            {/* Active Session Card */}
            {activeSession ? (
                <View className="mb-8">
                    <Text className="text-gray-400 mb-2 font-bold uppercase">Current Session</Text>
                    <TouchableOpacity
                        onPress={() => openSession(activeSession.id)}
                        className="p-6 rounded-2xl border"
                        style={{ backgroundColor: themeColor + '20', borderColor: themeColor + '40' }}
                    >
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center gap-2">
                                <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <Text className="font-bold tracking-widest" style={{ color: themeColor }}>LIVE</Text>
                            </View>
                            <Text className="text-white/50 text-xs">Tap to manage →</Text>
                        </View>

                        <Text className="text-white text-4xl font-bold mb-1">{activeSession.currentLp} LP</Text>
                        <Text className="text-gray-300">
                            Started {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • From {activeSession.startLp} LP
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="mb-8">
                    <Text className="text-gray-400 mb-2 font-bold uppercase">Start New Session</Text>
                    <View className="bg-gray-800 p-4 rounded-2xl flex-row gap-4">
                        <TextInput
                            className="bg-gray-700 text-white font-bold p-4 rounded-xl flex-1 text-center text-lg"
                            value={startLp}
                            onChangeText={setStartLp}
                            placeholder="Current LP?"
                            placeholderTextColor="#6b7280"
                            keyboardType="numeric"
                        />
                        <TouchableOpacity
                            className="px-6 rounded-xl justify-center items-center"
                            style={{ backgroundColor: themeColor }}
                            onPress={handleStartSession}
                        >
                            <Text className="text-white font-bold">Start</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* History List */}
            <Text className="text-gray-400 mb-4 font-bold uppercase">History</Text>
            <FlatList
                data={history}
                keyExtractor={item => item.id}
                renderItem={renderHistoryItem}
                ListEmptyComponent={
                    <Text className="text-gray-500 italic">No past sessions found for {selectedGame}.</Text>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </SafeAreaView>
    );
}
