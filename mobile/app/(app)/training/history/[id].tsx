import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TrainingService } from '@/src/features/training/api';
import { TrainingSession, Workout } from '@/src/features/training/types';
import { format } from 'date-fns';

export default function WorkoutHistoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (typeof id !== 'string') return;
            setIsLoading(true);
            try {
                const [workoutData, historyData] = await Promise.all([
                    TrainingService.getWorkoutById(id),
                    TrainingService.getWorkoutHistory(id)
                ]);
                setWorkout(workoutData);
                setSessions(historyData);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const renderSessionItem = ({ item }: { item: TrainingSession }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(app)/training/history/session/${item.id}` as any)}
            className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700 flex-row justify-between items-center"
        >
            <View>
                <Text className="text-white font-bold text-lg">{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
                <Text className="text-gray-400 text-sm">{format(new Date(item.date), 'HH:mm')}</Text>
            </View>
            <View className="items-end">
                <View className={`px-2 py-1 rounded mb-1 ${item.status === 'COMPLETED' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <Text className={`text-xs font-bold ${item.status === 'COMPLETED' ? 'text-green-400' : 'text-red-400'}`}>
                        {item.status}
                    </Text>
                </View>
                <Text className="text-gray-300 font-mono">{item.duration} min</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="px-4 py-4 flex-row items-center border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-white font-bold text-xl">History</Text>
                    <Text className="text-gray-400 text-xs">{workout?.title}</Text>
                </View>
            </View>

            <FlatList
                data={sessions}
                keyExtractor={item => item.id}
                renderItem={renderSessionItem}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className="items-center mt-20 opacity-50">
                        <Text className="text-gray-500">No sessions recorded yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
