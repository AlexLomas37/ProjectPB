import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TrainingService } from '@/src/features/training/api';
import { Workout, Exercise, TrainingSession, ExerciseLog } from '@/src/features/training/types';

export default function ActiveSessionScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [sessionDuration, setSessionDuration] = useState(0); // Total time spent

    // Stats State: { [exerciseIndex]: { [repIndex]: { [statId]: string } } }
    const [stats, setStats] = useState<Record<number, Record<number, Record<string, string>>>>({});
    const [exerciseNotes, setExerciseNotes] = useState<Record<number, string>>({});

    useEffect(() => {
        let isMounted = true;
        const loadSession = async () => {
            if (!id) return;
            const workoutId = Array.isArray(id) ? id[0] : id;
            try {
                const data = await TrainingService.getWorkoutById(workoutId);
                if (isMounted && data) {
                    setWorkout(data);
                    // Initialize timer with first exercise duration
                    if (data.exercises.length > 0) {
                        setSecondsRemaining((data.exercises[0].duration || 5) * 60);
                    }
                }
            } catch (e) {
                console.error("Failed to load workout session", e);
                Alert.alert("Error", "Failed to load session details");
                router.back();
            }
        };
        loadSession();
        return () => { isMounted = false; };
    }, [id]);

    // Timer Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && secondsRemaining > 0) {
            interval = setInterval(() => {
                setSecondsRemaining(prev => {
                    if (prev <= 1) {
                        setIsActive(false);
                        return 0;
                    }
                    return prev - 1;
                });
                setSessionDuration(prev => prev + 1);
            }, 1000);
        } else if (isActive && secondsRemaining === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, secondsRemaining]);

    // ...

    const updateStat = (repIndex: number, statId: string, value: string) => {
        setStats(prev => ({
            ...prev,
            [currentExerciseIndex]: {
                ...prev[currentExerciseIndex],
                [repIndex]: {
                    ...(prev[currentExerciseIndex]?.[repIndex] || {}),
                    [statId]: value
                }
            }
        }));
    };

    const handleNext = () => {
        if (!workout) return;

        const currentEx = workout.exercises[currentExerciseIndex];
        const numberOfReps = currentEx.repetitions || 1;
        const currentExAllStats = stats[currentExerciseIndex] || {};

        // Validation: Check if all stats for all reps are filled
        if (currentEx.stats) {
            for (let i = 0; i < numberOfReps; i++) {
                const repStats = currentExAllStats[i] || {};
                const missingStats = currentEx.stats.filter(stat => !repStats[stat.id] || repStats[stat.id].trim() === '');

                if (missingStats.length > 0) {
                    Alert.alert(
                        'Stats Required',
                        `Missing values for Rep ${i + 1}: ${missingStats.map(s => s.label).join(', ')}. \n\nDo you want to proceed anyway?`,
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Proceed", style: "destructive", onPress: () => goToNext() }
                        ]
                    );
                    return;
                }
            }
        }

        goToNext();
    };

    const goToNext = () => {
        if (!workout) return;
        if (currentExerciseIndex < workout.exercises.length - 1) {
            const nextIndex = currentExerciseIndex + 1;
            setCurrentExerciseIndex(nextIndex);
            setSecondsRemaining((workout.exercises[nextIndex].duration || 0) * 60);
            setIsActive(false);
        } else {
            handleFinish();
        }
    }

    const handlePrevious = () => {
        if (currentExerciseIndex > 0 && workout) {
            const prevIndex = currentExerciseIndex - 1;
            setCurrentExerciseIndex(prevIndex);
            setSecondsRemaining((workout.exercises[prevIndex].duration || 0) * 60);
            setIsActive(false);
        }
    };

    const handleFinish = async () => {
        if (!workout) return;
        setIsActive(false);

        const logs: ExerciseLog[] = workout.exercises.map((ex, index) => ({
            exerciseId: ex.id,
            completed: true,
            actualDuration: ex.duration,
            notes: exerciseNotes[index] || '',
            recordedStats: stats[index] || {}
        }));

        const session: TrainingSession = {
            id: Date.now().toString(),
            workoutId: workout.id,
            date: new Date().toISOString(),
            duration: Math.ceil(sessionDuration / 60),
            status: 'COMPLETED',
            logs: logs
        };

        await TrainingService.saveSession(session);

        Alert.alert(
            "Session Complete!",
            "Great job! Your session has been logged.",
            [
                { text: "OK", onPress: () => router.replace(`/(app)/training/workout/${workout.id}`) }
            ]
        );
    };

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Loading...</Text>
            </SafeAreaView>
        );
    }

    const currentExercise = workout.exercises[currentExerciseIndex];
    const numberOfReps = currentExercise.repetitions || 1;
    const currentExAllStats = stats[currentExerciseIndex] || {};
    const repsArray = Array.from({ length: numberOfReps }, (_, i) => i);

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-4 py-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close-circle-outline" size={32} color="#9ca3af" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">{workout.title}</Text>
                <View className="w-8" />
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Timer Display */}
                <View className="items-center justify-center py-10">
                    <Text className="text-7xl font-bold text-white tracking-widest font-mono">
                        {formatTime(secondsRemaining)}
                    </Text>
                    <Text className="text-gray-400 mt-2 text-lg">
                        {isActive ? 'In Progress' : 'Paused'}
                    </Text>
                </View>

                {/* Exercise Info */}
                <View className="bg-gray-800 rounded-3xl p-6 border border-gray-700 shadow-lg">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-blue-400 font-bold uppercase tracking-wider text-xs">
                            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                        </Text>
                        {currentExercise.repetitions && (
                            <View className="bg-blue-900/50 px-3 py-1 rounded-full">
                                <Text className="text-blue-300 text-xs font-bold">{currentExercise.repetitions} Reps</Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-white font-bold text-3xl mb-3 leading-tight">
                        {currentExercise.title}
                    </Text>

                    {currentExercise.description ? (
                        <Text className="text-gray-300 text-lg leading-relaxed mb-4">
                            {currentExercise.description}
                        </Text>
                    ) : (
                        <Text className="text-gray-500 italic mb-4">No description provided.</Text>
                    )}

                    {/* Input Stats */}
                    <View className="border-t border-gray-700 pt-4 gap-6">
                        {repsArray.map((repIndex) => (
                            <View key={repIndex} className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                                <Text className="text-gray-400 text-xs font-bold mb-2 tracking-widest">
                                    {numberOfReps > 1 ? `SET / REP ${repIndex + 1}` : 'STATS'}
                                </Text>

                                <View className="gap-3">
                                    {currentExercise.stats && currentExercise.stats.length > 0 ? (
                                        currentExercise.stats.map(stat => (
                                            <View key={stat.id}>
                                                <Text className="text-gray-500 text-[10px] uppercase font-bold mb-1">{stat.label}</Text>
                                                <View className="flex-row items-center gap-2">
                                                    <TextInput
                                                        className="bg-gray-800 text-white p-2 px-3 rounded-lg border border-gray-700 flex-1 text-sm font-bold"
                                                        placeholder="0"
                                                        placeholderTextColor="#6b7280"
                                                        keyboardType="numeric"
                                                        value={currentExAllStats[repIndex]?.[stat.id] || ''}
                                                        onChangeText={(val) => updateStat(repIndex, stat.id, val)}
                                                    />
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <Text className="text-gray-600 italic text-xs">No stats configured</Text>
                                    )}

                                    {/* Notes per Rep */}
                                    {/* Only show per-rep notes if explicitly requested?
                                         User said "notes et des stats pour chaque repetition".
                                         So Yes.
                                     */}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Notes Input */}
                    <View className="mt-6 border-t border-gray-700 pt-4">
                        <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">NOTES</Text>
                        <TextInput
                            className="bg-gray-900/50 text-white p-3 rounded-xl border border-gray-800 min-h-[80px]"
                            placeholder="Any observations or feelings about this exercise..."
                            placeholderTextColor="#6b7280"
                            multiline
                            textAlignVertical="top"
                            value={exerciseNotes[currentExerciseIndex] || ''}
                            onChangeText={(text) => setExerciseNotes(prev => ({ ...prev, [currentExerciseIndex]: text }))}
                        />
                    </View>
                </View>
                {/* Progress Indicators */}
                <View className="flex-row justify-between mt-8 px-2">
                    {workout.exercises.map((_, idx) => (
                        <View
                            key={idx}
                            className={`h-1 flex-1 mx-1 rounded-full ${idx === currentExerciseIndex
                                ? 'bg-blue-500'
                                : idx < currentExerciseIndex
                                    ? 'bg-green-500'
                                    : 'bg-gray-700'
                                }`}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Controls */}
            <View className="bg-gray-900 px-6 py-6 pb-10 border-t border-gray-800">
                <View className="flex-row justify-between items-center gap-6">
                    <TouchableOpacity
                        onPress={handlePrevious}
                        disabled={currentExerciseIndex === 0}
                        className={`p-4 rounded-full bg-gray-800 ${currentExerciseIndex === 0 ? 'opacity-30' : ''}`}
                    >
                        <Ionicons name="play-skip-back" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setIsActive(!isActive)}
                        className={`flex-1 h-20 rounded-full flex-row items-center justify-center ${isActive ? 'bg-orange-600' : 'bg-green-600'}`}
                    >
                        <Ionicons name={isActive ? "pause" : "play"} size={40} color="white" />
                        <Text className="text-white font-bold text-xl ml-2 uppercase">
                            {isActive ? "Pause" : "Start"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleNext}
                        className="p-4 rounded-full bg-gray-800"
                    >
                        <Ionicons
                            name={currentExerciseIndex === workout.exercises.length - 1 ? "checkmark" : "play-skip-forward"}
                            size={24}
                            color={currentExerciseIndex === workout.exercises.length - 1 ? "#4ade80" : "white"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
