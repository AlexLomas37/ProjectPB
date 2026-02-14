import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { TrainingService } from '@/src/features/training/api';
import { Exercise, Workout, TrainingSession, ExerciseLog } from '@/src/features/training/types';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/src/features/game/context';

export default function ExerciseDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { themeColor, backgroundColor, headerFooterColor } = useGame();

    const [data, setData] = useState<{ exercise: Exercise, workout: Workout } | null>(null);
    const [history, setHistory] = useState<{ session: TrainingSession, log: ExerciseLog }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPractice, setSelectedPractice] = useState<{ session: TrainingSession, log: ExerciseLog } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (typeof id !== 'string') return;
            setIsLoading(true);
            try {
                const [exerciseData, historyData] = await Promise.all([
                    TrainingService.getExerciseById(id),
                    TrainingService.getExerciseHistory(id)
                ]);
                setData(exerciseData as any);
                setHistory(historyData);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Calculate Stats
    const stats = useMemo(() => {
        if (!history.length) return null;
        const scores = history.map(h => h.log.score).filter(s => s !== undefined) as number[];
        return {
            average: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-',
            best: scores.length ? Math.max(...scores) : '-',
            totalTime: history.reduce((a, b) => a + b.log.actualDuration, 0),
            trend: scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0
        };
    }, [history]);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor }}>
                <ActivityIndicator size="large" color={themeColor} />
            </View>
        );
    }

    if (!data) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor }}>
                <Text className="text-white">Exercise not found</Text>
            </SafeAreaView>
        );
    }

    const { exercise, workout } = data;

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor }} edges={['top', 'bottom', 'left', 'right']}>
            {/* Header */}
            <View className="px-4 py-3 flex-row items-center border-b border-white/10" style={{ backgroundColor: headerFooterColor }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white font-bold text-lg" numberOfLines={1}>{exercise.title}</Text>
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-tighter">{workout.title}</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Hero Info */}
                    <View className="mb-6">
                        <Text className="text-gray-300 text-base leading-6 mb-4">{exercise.description}</Text>

                        {/* Summary Cards */}
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Best Score</Text>
                                <Text className="text-white text-2xl font-bold" style={{ color: themeColor }}>{stats?.best}</Text>
                            </View>
                            <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Avg Score</Text>
                                <Text className="text-white text-2xl font-bold">{stats?.average}</Text>
                            </View>
                            <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Total Time</Text>
                                <Text className="text-white text-2xl font-bold">{stats?.totalTime}m</Text>
                            </View>
                        </View>
                    </View>

                    {/* Progress Chart Placeholder (Simulated Bars) */}
                    <Text className="text-white text-lg font-bold mb-4">Score Trend</Text>
                    <View className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8 items-end flex-row justify-around h-40">
                        {history.slice(0, 7).reverse().map((h, i) => {
                            const maxScore = stats?.best === '-' ? 100 : Number(stats?.best) * 1.2;
                            const height = h.log.score ? (h.log.score / maxScore) * 100 : 10;
                            return (
                                <View key={i} className="items-center w-8">
                                    <View
                                        style={{ height: `${height}%`, backgroundColor: themeColor, opacity: 0.3 + (i * 0.1) }}
                                        className="w-full rounded-t-lg"
                                    />
                                    <Text className="text-[8px] text-gray-500 mt-2 font-bold rotate-[-45deg]">
                                        {new Date(h.session.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </Text>
                                </View>
                            );
                        })}
                        {history.length === 0 && (
                            <Text className="text-gray-500 text-center w-full pb-10">Waiting for data...</Text>
                        )}
                    </View>

                    <Text className="text-white text-lg font-bold mb-4">Past Records</Text>
                    <View className="gap-3">
                        {history.map(({ session, log }) => (
                            <TouchableOpacity
                                key={session.id}
                                onPress={() => setSelectedPractice({ session, log })}
                                className="bg-white/5 p-4 rounded-2xl border border-white/10 flex-row items-center active:bg-white/10"
                            >
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="text-white font-bold text-base mr-2">
                                            {new Date(session.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </Text>
                                        <View className={`px-2 py-0.5 rounded-full ${log.completed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                            <Text className={`text-[8px] font-bold ${log.completed ? 'text-green-400' : 'text-red-400'}`}>
                                                {log.completed ? 'SUCCESS' : 'PARTIAL'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-gray-400 text-xs mt-1">Duration: {log.actualDuration} min</Text>
                                </View>
                                <View className="items-end mr-3">
                                    <Text className="text-white font-bold text-xl" style={{ color: themeColor }}>
                                        {log.score ?? '-'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Practice Detail Modal */}
            <Modal
                visible={!!selectedPractice}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedPractice(null)}
            >
                <View className="flex-1 justify-center bg-black/80 px-4">
                    <View className="bg-[#1e293b] rounded-3xl p-6 border border-white/10">
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-start mb-6">
                            <View>
                                <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Performance Details</Text>
                                <Text className="text-white text-2xl font-bold">
                                    {selectedPractice && new Date(selectedPractice.session.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedPractice(null)} className="h-8 w-8 bg-white/10 rounded-full items-center justify-center">
                                <Ionicons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Core Stats Breakdown */}
                        <View className="bg-white/5 rounded-2xl border border-white/5 p-4 mb-4">
                            <View className="flex-row justify-between items-center mb-4">
                                <View>
                                    <Text className="text-gray-400 text-xs uppercase mb-1">Total Score</Text>
                                    <Text className="text-white text-3xl font-bold" style={{ color: themeColor }}>{selectedPractice?.log.score ?? '-'}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-gray-400 text-xs uppercase mb-1">Practice Time</Text>
                                    <Text className="text-white text-xl font-bold">{selectedPractice?.log.actualDuration}m</Text>
                                </View>
                            </View>

                            {/* Performance Breakdown Tags */}
                            <View className="flex-row flex-wrap gap-2">
                                {selectedPractice && selectedPractice.log.recordedStats && Object.entries(selectedPractice.log.recordedStats[1] || {}).map(([statId, value]) => {
                                    const statDef = exercise.stats?.find(s => s.id === statId);
                                    return (
                                        <View key={statId} className="bg-white/10 px-3 py-2 rounded-xl flex-row items-center border border-white/5">
                                            <Text className="text-gray-300 text-xs mr-2">{statDef?.label || statId}:</Text>
                                            <Text className="text-white font-bold">{value}{statDef?.unit}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Notes Section */}
                        {selectedPractice?.log.notes && (
                            <View className="mb-6">
                                <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2 px-1">Session Notes</Text>
                                <View className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <Text className="text-gray-200 text-base italic leading-6">"{selectedPractice.log.notes}"</Text>
                                </View>
                            </View>
                        )}

                        {/* Actions */}
                        <TouchableOpacity
                            onPress={() => setSelectedPractice(null)}
                            className="bg-white py-4 rounded-2xl items-center"
                            style={{ backgroundColor: themeColor }}
                        >
                            <Text className="text-white font-bold">Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
