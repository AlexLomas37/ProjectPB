import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useGame } from './context';
import { SupportedGame } from '@/src/shared/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const GameHeader = () => {
    const { selectedGame, setSelectedGame, visibleGames, themeColor, headerFooterColor } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const getGameLabel = (game: SupportedGame) => {
        switch (game) {
            case 'LEAGUE_OF_LEGENDS': return '⚔️ LoL';
            case 'VALORANT': return '🔫 Valorant';
            case 'ROCKET_LEAGUE': return '🚗 Rocket League';
            case 'CALL_OF_DUTY': return '🎖️ Call of Duty';
            case 'COUNTER_STRIKE': return '💣 CS2';
            case 'RAINBOW_SIX_SIEGE': return '🧱 R6 Siege';
            case 'OVERWATCH': return '🛡️ Overwatch';
        }
    };

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: headerFooterColor }} className="border-b border-white/10 z-50">
            <View className="px-4 py-3 flex-row justify-between items-center relative z-50">

                {/* GAME SELECTOR (LEFT) */}
                <View>
                    <TouchableOpacity
                        onPress={() => setIsOpen(!isOpen)}
                        className="flex-row items-center bg-gray-800 py-2 px-3 rounded-xl border border-gray-700"
                    >
                        <Text className="text-white font-bold mr-2 text-base">{getGameLabel(selectedGame)}</Text>
                        <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                    </TouchableOpacity>

                    {isOpen && (
                        <View className="absolute top-12 left-0 z-50">
                            <View className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden w-48">
                                {visibleGames.map((game) => (
                                    <TouchableOpacity
                                        key={game}
                                        className={`p-3 border-b border-gray-700 ${selectedGame === game ? 'bg-gray-700' : ''}`}
                                        onPress={() => {
                                            setSelectedGame(game);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <Text className="text-white font-medium">
                                            {getGameLabel(game)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* PROFILE ICON (RIGHT) */}
                <TouchableOpacity
                    onPress={() => router.push('/(app)/profile')}
                    className="w-10 h-10 bg-gray-800 rounded-full border border-gray-700 items-center justify-center"
                >
                    <Ionicons name="person" size={20} color={themeColor} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
