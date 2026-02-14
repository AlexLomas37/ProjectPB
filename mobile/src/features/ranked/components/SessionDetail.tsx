import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { RankedSession, Game } from '../types';
import { RankedService } from '../api';
import { AddGameModal } from './AddGameModal';

interface SessionDetailProps {
    session: RankedSession;
    isHistory?: boolean;
    onUpdate: (updatedSession: RankedSession) => void;
    onEndSession?: () => void;
    onDeleteSession?: () => void;
}

export function SessionDetail({ session, isHistory = false, onUpdate, onEndSession, onDeleteSession }: SessionDetailProps) {
    const router = useRouter();
    const [isModalVisible, setModalVisible] = useState(false);

    const handleAddGame = async (gameData: any) => {
        // IMPORTANT: In history mode, we would need an API to add game to SPECIFIC session ID.
        // For now, the mock API only supports adding to ACTIVE session.
        // We will assume for this step that "Editing" history is limited or needs API update.
        // Let's implement it for Active Session primarily, and mark specific API needs.
        if (isHistory) {
            Alert.alert('Not Implemented', 'Editing past sessions is coming soon!');
            return;
        }

        const updatedSession = await RankedService.addGame(gameData);
        onUpdate(updatedSession);
        setModalVisible(false);
    };

    const handleDeleteGame = async (gameId: string) => {
        if (isHistory) {
            Alert.alert('Not Implemented', 'Editing past sessions is coming soon!');
            return;
        }
        const updatedSession = await RankedService.deleteGame(gameId);
        onUpdate(updatedSession);
    };

    const openGameDetail = (gameId: string) => {
        router.push({ pathname: '/(app)/ranked-game/[id]', params: { id: gameId } });
    };

    const renderGameItem = ({ item }: { item: Game }) => (
        <TouchableOpacity
            onPress={() => openGameDetail(item.id)}
            className="bg-gray-800 p-4 rounded-xl mb-3 flex-row items-center justify-between"
        >
            <View>
                <View className="flex-row items-center gap-2">
                    <Text className={`font-bold text-lg ${item.result === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                        {item.result}
                    </Text>
                    <Text className="text-white font-bold">{item.champion}</Text>
                </View>
                <Text className="text-gray-400 text-xs">
                    {item.kills}/{item.deaths}/{item.assists} • {item.lpChange > 0 ? '+' : ''}{item.lpChange} LP
                </Text>
            </View>
            {!isHistory && (
                <TouchableOpacity onPress={() => handleDeleteGame(item.id)} className="p-2">
                    <Text className="text-gray-500">🗑️</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    const wins = session.games.filter(g => g.result === 'WIN').length;
    const losses = session.games.filter(g => g.result === 'LOSS').length;
    const lpDiff = session.currentLp - session.startLp;

    return (
        <View className="flex-1">
            {/* Header */}
            <View className="p-6 bg-gray-800 rounded-b-3xl mb-4">
                <View className="flex-row justify-between items-start mb-6">
                    <View>
                        <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-2xl">
                                {session.game === 'LEAGUE_OF_LEGENDS' ? '⚔️' :
                                    session.game === 'VALORANT' ? '🔫' : '🚗'}
                            </Text>
                            <Text className="text-gray-400 text-sm font-bold tracking-widest">
                                Session du {new Date(session.startTime).toLocaleDateString()}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-gray-500 text-xs">
                                Début: {new Date(session.startTime).toLocaleTimeString()}
                                {session.endTime && ` • Fin: ${new Date(session.endTime).toLocaleTimeString()}`}
                            </Text>
                        </View>
                    </View>

                    {onEndSession && (
                        <TouchableOpacity
                            onPress={onEndSession}
                            className="bg-red-500/10 border border-red-500/50 px-3 py-2 rounded-lg flex-row items-center"
                        >
                            <View className="w-2 h-2 bg-red-500 rounded-sm mr-2" />
                            <Text className="text-red-500 font-bold text-xs uppercase">Stop</Text>
                        </TouchableOpacity>
                    )}

                    {onDeleteSession && (
                        <TouchableOpacity
                            onPress={onDeleteSession}
                            className="bg-red-500/10 border border-red-500/50 px-3 py-2 rounded-lg flex-row items-center"
                        >
                            <Text className="text-red-500 font-bold text-xs uppercase">Delete</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Stats Row (Now Inside Card) */}
                <View className="flex-row gap-4">
                    <View className="flex-1 bg-gray-700/50 p-3 rounded-xl items-center">
                        <Text className="text-gray-400 text-xs">Games</Text>
                        <Text className="text-white font-bold text-lg">{session.games.length}</Text>
                    </View>
                    <View className="flex-1 bg-gray-700/50 p-3 rounded-xl items-center">
                        <Text className="text-gray-400 text-xs">Win Rate</Text>
                        <Text className="text-white font-bold text-lg">
                            {session.games.length > 0 ? Math.round((wins / session.games.length) * 100) : 0}%
                        </Text>
                    </View>
                    <View className="flex-1 bg-gray-700/50 p-3 rounded-xl items-center">
                        <View>
                            <Text className="text-gray-400 text-xs mb-1">Target</Text>
                            <Text className="text-white text-xl font-bold">{session.currentLp}</Text>
                        </View>
                    </View>
                    <View className="flex-1 bg-gray-700/50 p-3 rounded-xl items-center justify-center">
                        <Text className={`text-xl font-bold ${lpDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {lpDiff >= 0 ? '+' : ''}{lpDiff}
                        </Text>
                        <Text className="text-gray-400 text-[10px]">LP Gained</Text>
                    </View>
                </View>
            </View>



            {/* Game List */}
            <View className="flex-1 px-4">
                <FlatList
                    data={[...session.games].reverse()}
                    keyExtractor={item => item.id}
                    renderItem={renderGameItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListHeaderComponent={
                        <Text className="text-gray-400 mb-4 font-bold">Recent Games</Text>
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-10 opacity-50">
                            <Text className="text-gray-500">No games played yet.</Text>
                            <Text className="text-gray-600 text-sm">Good luck!</Text>
                        </View>
                    }
                />
            </View>

            {/* Add Game Button - Only for Active Session */}
            {!isHistory && (
                <View className="absolute bottom-6 right-6 items-center gap-4">
                    <TouchableOpacity
                        className="bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg"
                        onPress={() => setModalVisible(true)}
                    >
                        <Text className="text-white text-3xl font-bold pb-1">+</Text>
                    </TouchableOpacity>
                </View>
            )}

            <AddGameModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleAddGame}
            />
        </View >
    );
}
