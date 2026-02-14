import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/features/auth/context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SupportedGame } from '@/src/shared/types';
import { useGame } from '@/src/features/game/context';

const ALL_GAMES: { id: SupportedGame; label: string; logo: string }[] = [
    { id: 'LEAGUE_OF_LEGENDS', label: 'League of Legends', logo: '⚔️' },
    { id: 'VALORANT', label: 'Valorant', logo: '🔫' },
    { id: 'ROCKET_LEAGUE', label: 'Rocket League', logo: '🚗' },
    { id: 'CALL_OF_DUTY', label: 'Call of Duty', logo: '🎖️' },
    { id: 'COUNTER_STRIKE', label: 'Counter-Strike 2', logo: '💣' },
    { id: 'RAINBOW_SIX_SIEGE', label: 'Rainbow Six Siege', logo: '🧱' },
    { id: 'OVERWATCH', label: 'Overwatch', logo: '🛡️' },
];

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { visibleGames, setVisibleGames } = useGame();

    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState(''); // Keep empty initially for security

    // Initialize enabled games based on context
    const [enabledGames, setEnabledGames] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const initialEnabled: Record<string, boolean> = {};
        ALL_GAMES.forEach(game => {
            initialEnabled[game.id] = visibleGames.includes(game.id);
        });
        setEnabledGames(initialEnabled);
    }, [visibleGames]);

    const toggleGame = (gameId: string) => {
        setEnabledGames(prev => ({ ...prev, [gameId]: !prev[gameId] }));
    };

    const handleSave = async () => {
        // Here we would make an API call to update the user profile
        console.log("Saving profile:", { username, password, enabledGames });

        // Update global game visibility
        const newVisibleGames = ALL_GAMES
            .filter(g => enabledGames[g.id])
            .map(g => g.id);

        setVisibleGames(newVisibleGames);

        Alert.alert("Success", "Profile and preferences updated successfully!");
    };

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="px-4 py-4 border-b border-gray-800 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Profile Settings</Text>
                <View className="w-16" />
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-gray-700 rounded-full items-center justify-center mb-4 border-2 border-blue-500">
                        <Text className="text-4xl">👤</Text>
                    </View>
                    <Text className="text-gray-400">{user?.email}</Text>
                </View>

                {/* Account Details */}
                <View className="mb-8">
                    <Text className="text-blue-400 font-bold uppercase text-xs mb-4 tracking-wider">Account Details</Text>

                    <View className="mb-4">
                        <Text className="text-gray-400 text-xs font-bold mb-2">USERNAME</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            placeholder="Enter username"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-400 text-xs font-bold mb-2">NEW PASSWORD</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            placeholder="Leave empty to keep current"
                            placeholderTextColor="#6b7280"
                            secureTextEntry
                        />
                    </View>
                </View>

                {/* Game Preferences */}
                <View className="mb-8">
                    <Text className="text-blue-400 font-bold uppercase text-xs mb-4 tracking-wider">Visible Games</Text>
                    <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        {ALL_GAMES.map((game, index) => (
                            <View key={game.id} className={`flex-row items-center justify-between p-4 ${index !== ALL_GAMES.length - 1 ? 'border-b border-gray-700' : ''}`}>
                                <View className="flex-row items-center">
                                    <Text className="text-2xl mr-3">{game.logo}</Text>
                                    <Text className="text-white font-medium text-lg">{game.label}</Text>
                                </View>
                                <Switch
                                    value={enabledGames[game.id]}
                                    onValueChange={() => toggleGame(game.id)}
                                    trackColor={{ false: "#374151", true: "#3b82f6" }}
                                    thumbColor={enabledGames[game.id] ? "#ffffff" : "#f3f4f6"}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Actions */}
                <View className="gap-4 mb-10">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-600 p-4 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl items-center"
                    >
                        <Text className="text-red-500 font-bold">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
