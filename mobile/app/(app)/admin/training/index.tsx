import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppContainer, AppHeader, AppCard } from '@/src/shared/ui';
import { TrainingService } from '@/src/features/training/api';
import { Workout } from '@/src/features/training/types';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/src/features/game/context';

export default function TrainingListScreen() {
    const router = useRouter();
    const { themeColor } = useGame();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadWorkouts = async () => {
        setIsLoading(true);
        const data = await TrainingService.getWorkouts();
        setWorkouts(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadWorkouts();
    }, []);

    const handleDelete = (id: string) => {
        Alert.alert(
            "Supprimer l'entraînement ?",
            "Cette action est irréversible.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        await TrainingService.deleteWorkout(id);
                        loadWorkouts();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Workout }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/(app)/admin/training/[id]', params: { id: item.id } })}
            className="mb-3"
        >
            <AppCard className="flex-row items-center justify-between">
                <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                        <View className={`px-2 py-0.5 rounded text-[10px] font-bold border border-gray-600 ${item.category === 'Warmup' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            <Text className={item.category === 'Warmup' ? 'text-orange-400 font-bold text-[10px]' : 'text-blue-400 font-bold text-[10px]'}>{item.category}</Text>
                        </View>
                        <Text className="text-gray-500 text-xs font-bold uppercase">{item.game}</Text>
                    </View>
                    <Text className="text-white font-bold text-lg">{item.title}</Text>
                    <Text className="text-gray-400 text-xs">{item.exercises.length} exercices • {item.duration} min</Text>
                </View>
                <View className="items-center justify-center pl-4">
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </View>
                {/* Delete Action (Optional, usually inside edit but handy here) */}
                <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="absolute top-2 right-2 p-2 bg-gray-800/50 rounded-full"
                >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
            </AppCard>
        </TouchableOpacity>
    );

    return (
        <AppContainer safeArea={false}>
            <AppHeader
                title="Gestion Entraînements"
                showBack
                rightAction={
                    <TouchableOpacity onPress={() => router.push('/(app)/admin/training/new')} className="p-2 bg-blue-600 rounded-lg">
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                }
            />

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={themeColor} />
                </View>
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <Text className="text-gray-500 text-center mt-10">Aucun entraînement configuré.</Text>
                    }
                />
            )}
        </AppContainer>
    );
}
