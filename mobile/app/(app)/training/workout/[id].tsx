import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { TrainingService } from '@/src/features/training/api';
import { Workout, TrainingSession } from '@/src/features/training/types';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/src/features/game/context';

export default function WorkoutDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { themeColor, backgroundColor, headerFooterColor } = useGame();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const loadWorkout = async () => {
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
            loadWorkout();
        }, [id])
    );

    const handleDelete = async () => {
        if (!workout) return;
        Alert.alert("Delete Workout", "Are you sure you want to delete this workout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await TrainingService.deleteWorkout(workout.id);
                    router.back();
                }
            }
        ]);
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Workout not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-400">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor }} edges={['top', 'bottom', 'left', 'right']}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-white/10 flex-row items-center justify-between" style={{ backgroundColor: headerFooterColor }}>
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Workout Details</Text>
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={() => router.push(`/(app)/training/create?id=${workout.id}`)}>
                        <Ionicons name="pencil-outline" size={24} color={themeColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Title & Info */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-white text-3xl font-bold flex-1 mr-2">{workout.title}</Text>
                        <View className={`px-3 py-1 rounded-full ${workout.category === 'Warmup' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                            }`}>
                            <Text className={`text-xs font-bold uppercase ${workout.category === 'Warmup' ? 'text-orange-400' : 'text-blue-400'
                                }`}>{workout.category}</Text>
                        </View>
                    </View>

                    <Text className="text-gray-400 text-base mb-4">{workout.description}</Text>

                    <View className="flex-row gap-4 mb-4">
                        <View className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 items-center">
                            <Text className="text-gray-400 text-xs uppercase mb-1">Duration</Text>
                            <Text className="text-white font-bold text-lg">{workout.duration} min</Text>
                        </View>
                        <View className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 items-center flex-1">
                            <Text className="text-gray-400 text-xs uppercase mb-1">Tags</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {workout.tags.map(tag => (
                                    <Text key={tag} className="font-bold mr-2" style={{ color: themeColor }}>#{tag}</Text>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>

                {/* Exercises List */}
                <Text className="text-white text-xl font-bold mb-4">Exercises ({workout.exercises.length})</Text>

                <View className="gap-3 mb-10">
                    {workout.exercises.map((exercise) => (
                        <TouchableOpacity
                            key={exercise.id}
                            onPress={() => router.push(`/(app)/training/exercise/${exercise.id}` as any)}
                            className="bg-white/5 p-4 rounded-xl border border-white/10 flex-row items-center active:bg-white/10"
                        >
                            <View className="flex-1">
                                <Text className="text-white font-bold text-lg">{exercise.title}</Text>
                                <View className="flex-row gap-2 mt-1">
                                    <View className="bg-white/10 px-2 py-0.5 rounded-md">
                                        <Text className="text-[10px] font-bold" style={{ color: themeColor }}>⏱️ {exercise.duration} min</Text>
                                    </View>
                                    {exercise.repetitions && (
                                        <View className="bg-green-500/10 px-2 py-0.5 rounded-md">
                                            <Text className="text-green-400 text-[10px] font-bold">🔁 {exercise.repetitions} reps</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Activity */}
                <View className="mb-20">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-bold">Recent Activity</Text>
                        <TouchableOpacity onPress={() => router.push(`/(app)/training/history/${workout.id}`)}>
                            <Text className="font-bold text-sm" style={{ color: themeColor }}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {sessions.length > 0 ? (
                        sessions.slice(0, 3).map(session => (
                            <TouchableOpacity
                                key={session.id}
                                onPress={() => router.push(`/(app)/training/history/session/${session.id}` as any)}
                                className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-3 flex-row justify-between items-center"
                            >
                                <View>
                                    <Text className="text-white font-bold">{new Date(session.date).toLocaleDateString()}</Text>
                                    <Text className="text-gray-400 text-xs">{session.status}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={16} color="#9ca3af" className="mr-1" />
                                    <Text className="text-gray-300 font-mono">{session.duration}m</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic">No recent activity.</Text>
                    )}
                </View>
            </ScrollView>

            {/* Start Button */}
            <View className="p-4 border-t border-gray-800 bg-gray-900">
                <TouchableOpacity
                    className="w-full py-4 rounded-2xl items-center shadow-lg active:bg-blue-700"
                    style={{ backgroundColor: themeColor }}
                    onPress={() => router.push(`/(app)/training/session/${workout.id}`)}
                >
                    <Text className="text-white font-bold text-xl uppercase tracking-wider">Start Session</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
