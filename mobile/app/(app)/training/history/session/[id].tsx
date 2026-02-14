import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TrainingService } from '@/src/features/training/api';
import { TrainingSession, Workout, Exercise } from '@/src/features/training/types';
import { format } from 'date-fns';

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [session, setSession] = useState<TrainingSession | null>(null);
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedNotes, setEditedNotes] = useState<Record<string, string>>({});
    const [editedStats, setEditedStats] = useState<Record<string, Record<string, Record<string, string>>>>({});

    useEffect(() => {
        const loadData = async () => {
            if (typeof id !== 'string') return;
            setIsLoading(true);
            try {
                const sessionData = await TrainingService.getSessionById(id);
                if (sessionData) {
                    setSession(sessionData);
                    const workoutData = await TrainingService.getWorkoutById(sessionData.workoutId);
                    setWorkout(workoutData);

                    // Initialize edited notes and stats
                    const notes: Record<string, string> = {};
                    const stats: Record<string, Record<string, Record<string, string>>> = {};

                    sessionData.logs.forEach(log => {
                        notes[log.exerciseId] = log.notes || '';
                        if (log.recordedStats) {
                            stats[log.exerciseId] = JSON.parse(JSON.stringify(log.recordedStats));
                        }
                    });
                    setEditedNotes(notes);
                    setEditedStats(stats);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleStatChange = (exerciseId: string, repIndex: string, statId: string, value: string) => {
        setEditedStats(prev => ({
            ...prev,
            [exerciseId]: {
                ...(prev[exerciseId] || {}),
                [repIndex]: {
                    ...(prev[exerciseId]?.[repIndex] || {}),
                    [statId]: value
                }
            }
        }));
    };

    const handleSave = async () => {
        if (!session) return;

        try {
            const updatedLogs = session.logs.map(log => ({
                ...log,
                notes: editedNotes[log.exerciseId] || log.notes,
                recordedStats: editedStats[log.exerciseId] ? (editedStats[log.exerciseId] as any) : log.recordedStats
            }));

            const updatedSession = { ...session, logs: updatedLogs };
            await TrainingService.updateSession(updatedSession);
            setSession(updatedSession);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    if (!session || !workout) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Session not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-400">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-800">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white font-bold text-lg">Session Details</Text>
                        <Text className="text-gray-400 text-xs">{format(new Date(session.date), 'MMM dd, yyyy • HH:mm')}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
                    <Text className="text-blue-500 font-bold text-lg">{isEditing ? 'Save' : 'Edit'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Summary Card */}
                <View className="bg-gray-800 p-5 rounded-xl border border-gray-700 mb-6 flex-row justify-between">
                    <View>
                        <Text className="text-gray-400 text-xs uppercase mb-1">Workout</Text>
                        <Text className="text-white font-bold text-lg">{workout.title}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-gray-400 text-xs uppercase mb-1">Duration</Text>
                        <Text className="text-blue-400 font-bold text-lg font-mono">{session.duration} min</Text>
                    </View>
                </View>

                {/* Exercises Log */}
                <Text className="text-white text-xl font-bold mb-4">Exercises Log</Text>
                <View className="gap-4 mb-10">
                    {workout.exercises.map((exercise, index) => {
                        const log = session.logs.find(l => l.exerciseId === exercise.id);
                        if (!log) return null;

                        return (
                            <View key={exercise.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-white font-bold text-lg flex-1 mr-2">{exercise.title}</Text>
                                    <Ionicons name="checkmark-circle" size={20} color={log.completed ? "#4ade80" : "#ef4444"} />
                                </View>

                                {/* Stats Display */}
                                {log.recordedStats && Object.keys(log.recordedStats).length > 0 && (
                                    <View className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 mb-3">
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Recorded Stats</Text>
                                        {Object.entries(log.recordedStats).map(([repIndex, stats]) => (
                                            <View key={repIndex} className="mb-2 last:mb-0">
                                                <Text className="text-gray-500 text-[10px] font-bold mb-1">SET {parseInt(repIndex) + 1}</Text>
                                                <View className="flex-row flex-wrap gap-2">
                                                    {Object.entries(stats as Record<string, string>).map(([statId, value]) => {
                                                        const statDef = exercise.stats?.find(s => s.id === statId);
                                                        const currentValue = editedStats[exercise.id]?.[repIndex]?.[statId] ?? value;

                                                        return (
                                                            <View key={statId} className="bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                                                {isEditing ? (
                                                                    <View className="flex-row items-center">
                                                                        <Text className="text-gray-400 text-[10px] mr-1">{statDef?.label}:</Text>
                                                                        <TextInput
                                                                            className="text-white font-mono p-0 min-w-[30px] h-5 border-b border-gray-600 text-[10px]"
                                                                            value={currentValue}
                                                                            onChangeText={(text) => handleStatChange(exercise.id, repIndex, statId, text)}
                                                                            keyboardType="numeric"
                                                                        />
                                                                    </View>
                                                                ) : (
                                                                    <Text className="text-gray-400 text-[10px]">{statDef?.label}: <Text className="text-white font-mono">{currentValue}</Text></Text>
                                                                )}
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Notes Display / Edit */}
                                {isEditing ? (
                                    <View className="mt-2">
                                        <Text className="text-blue-400 text-[10px] font-bold uppercase mb-1">Notes</Text>
                                        <TextInput
                                            className="bg-gray-900/50 text-white p-3 rounded-lg border border-gray-600 min-h-[60px]"
                                            multiline
                                            value={editedNotes[exercise.id] || ''}
                                            onChangeText={(text) => setEditedNotes(prev => ({ ...prev, [exercise.id]: text }))}
                                            placeholder="Add notes..."
                                            placeholderTextColor="#6b7280"
                                        />
                                    </View>
                                ) : (
                                    log.notes ? (
                                        <View className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/50">
                                            <Text className="text-blue-400 text-[10px] font-bold uppercase mb-1">Notes</Text>
                                            <Text className="text-gray-300 italic text-sm">{log.notes}</Text>
                                        </View>
                                    ) : (
                                        <Text className="text-gray-600 text-xs italic">No notes recorded.</Text>
                                    )
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
