import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContainer, AppHeader } from '@/src/shared/ui';
import { useGame } from '@/src/features/game/context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/features/auth/context';

export default function AdminScreen() {
    const router = useRouter();
    const { configs } = useGame();
    const { user } = useAuth();

    // Mock Check: In real app, check user.role === 'admin'
    // For now, assuming anyone accessing this route is authorized (or checking offline mode if implemented)

    return (
        <AppContainer safeArea={false}>
            <AppHeader title="Administration" showBack />
            <ScrollView className="p-4">
                <Text className="text-gray-400 font-bold uppercase mb-4">Gestion des Jeux</Text>
                <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
                    {Object.values(configs).map((game, index) => (
                        <TouchableOpacity
                            key={game.id}
                            onPress={() => router.push({ pathname: '/(app)/admin/game-edit', params: { id: game.id } })}
                            className={`flex-row items-center justify-between p-4 active:bg-gray-700 ${index !== Object.values(configs).length - 1 ? 'border-b border-gray-700' : ''}`}
                        >
                            <View className="flex-row items-center">
                                {game.assets.logoUrl ? (
                                    <Image source={{ uri: game.assets.logoUrl }} className="w-10 h-10 mr-3 rounded-full bg-gray-900" />
                                ) : (
                                    <View className="w-10 h-10 mr-3 bg-gray-700 rounded-full items-center justify-center border border-gray-600">
                                        <Text className="text-gray-400 text-xs font-bold">{game.displayName.charAt(0)}</Text>
                                    </View>
                                )}
                                <View>
                                    <Text className="text-white font-bold text-lg">{game.displayName}</Text>
                                    <Text className="text-gray-500 text-xs">{game.id}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Other Admin Tools Placeholder */}
                <Text className="text-gray-400 font-bold uppercase mb-4">Outils Système</Text>
                <View className="gap-3">
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/debug')}
                        className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="bug-outline" size={24} color="#f59e0b" />
                            <Text className="text-white font-bold">Menu Debug</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </AppContainer>
    );
}
