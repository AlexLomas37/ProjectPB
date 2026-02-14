import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/src/features/game/context';
import { Exercise, Workout } from '@/src/features/training/types';
import { TrainingService } from '@/src/features/training/api';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function CreateWorkoutScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { selectedGame } = useGame();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'Warmup' | 'Training'>('Training');
    const [exercises, setExercises] = useState<Partial<Exercise>[]>([]);

    // Add Exercise State
    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
    const [newExerciseTitle, setNewExerciseTitle] = useState('');
    const [newExerciseDescription, setNewExerciseDescription] = useState('');
    const [newExerciseDuration, setNewExerciseDuration] = useState('');
    const [newExerciseReps, setNewExerciseReps] = useState('');
    const [newExerciseStats, setNewExerciseStats] = useState<{ id: string, type: 'RATIO' | 'SCORE' | 'PERCENTAGE', label: string, unit: string }[]>([]);
    const [isAddingExercise, setIsAddingExercise] = useState(false);

    // Stat Selector State
    const [statSelectorVisible, setStatSelectorVisible] = useState(false);
    const [currentStatIdToUpdate, setCurrentStatIdToUpdate] = useState<string | null>(null);

    const PREDEFINED_STATS = [
        { label: 'Score', unit: 'pts', type: 'SCORE' },
        { label: 'Ratio', unit: '', type: 'RATIO' },
        { label: 'Percentage', unit: '%', type: 'PERCENTAGE' },
        { label: 'Reactivity', unit: 'ms', type: 'SCORE' },
        { label: 'Custom', unit: '', type: 'SCORE' },
    ] as const;

    const handleSelectStat = (statDef: typeof PREDEFINED_STATS[number]) => {
        if (!currentStatIdToUpdate) return;

        setNewExerciseStats(prev => prev.map(s => {
            if (s.id === currentStatIdToUpdate) {
                return {
                    ...s,
                    label: statDef.label,
                    unit: statDef.unit,
                    type: statDef.type
                };
            }
            return s;
        }));
        setStatSelectorVisible(false);
        setCurrentStatIdToUpdate(null);
    };

    // Initial Load for Edit Mode
    useEffect(() => {
        const workoutId = Array.isArray(id) ? id[0] : id;
        if (workoutId) {
            setIsLoading(true);
            const loadData = async () => {
                try {
                    const workout = await TrainingService.getWorkoutById(workoutId);
                    if (workout) {
                        setTitle(workout.title);
                        setDescription(workout.description);
                        setCategory(workout.category);
                        setExercises(workout.exercises);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }
    }, [id]);

    const handleAddStat = () => {
        setNewExerciseStats([...newExerciseStats, {
            id: Date.now().toString(),
            type: 'SCORE',
            label: 'Score',
            unit: 'pts'
        }]);
    };

    const handleUpdateStat = (id: string, field: 'type' | 'label' | 'unit', value: string) => {
        setNewExerciseStats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleRemoveStat = (id: string) => {
        setNewExerciseStats(prev => prev.filter(s => s.id !== id));
    };

    const handleAddExercise = () => {
        if (!newExerciseTitle || !newExerciseDuration) {
            Alert.alert('Error', 'Please enter at least a title and duration.');
            return;
        }

        const exerciseData: Partial<Exercise> = {
            id: editingExerciseId || Date.now().toString(),
            title: newExerciseTitle,
            description: newExerciseDescription,
            duration: parseInt(newExerciseDuration) || 5,
            repetitions: newExerciseReps ? parseInt(newExerciseReps) : undefined,
            stats: newExerciseStats
        };

        if (editingExerciseId) {
            setExercises(prev => prev.map(ex => ex.id === editingExerciseId ? { ...ex, ...exerciseData } : ex));
        } else {
            setExercises([...exercises, exerciseData]);
        }

        closeExerciseModal();
    };

    const handleEditExercise = (exercise: Partial<Exercise>) => {
        if (!exercise.id) return;
        setEditingExerciseId(exercise.id);
        setNewExerciseTitle(exercise.title || '');
        setNewExerciseDescription(exercise.description || '');
        setNewExerciseDuration(exercise.duration?.toString() || '');
        setNewExerciseReps(exercise.repetitions?.toString() || '');
        setNewExerciseStats(exercise.stats || []);
        setIsAddingExercise(true);
    };

    const closeExerciseModal = () => {
        setEditingExerciseId(null);
        setNewExerciseTitle('');
        setNewExerciseDescription('');
        setNewExerciseDuration('');
        setNewExerciseReps('');
        setNewExerciseStats([]);
        setIsAddingExercise(false);
    };

    const handleRemoveExercise = (id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    const handleSaveWorkout = async () => {
        if (!title || exercises.length === 0) {
            Alert.alert('Error', 'Please add a title and at least one exercise.');
            return;
        }

        setIsLoading(true);
        try {
            const workout: Workout = {
                id: Array.isArray(id) ? id[0] : (id || Date.now().toString()),
                game: selectedGame,
                title,
                description,
                category,
                duration: exercises.reduce((acc, ex) => acc + (ex.duration || 0), 0),
                exercises: exercises as Exercise[],
                tags: []
            };

            await TrainingService.saveWorkout(workout);
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save workout');
        } finally {
            setIsLoading(false);
        }
    };

    const renderExerciseItem = ({ item, drag, isActive }: RenderItemParams<Partial<Exercise>>) => (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                onPress={() => item.id && handleEditExercise(item)}
                disabled={isActive}
                className={`bg-gray-800 p-4 mb-3 rounded-xl border ${isActive ? 'border-blue-500' : 'border-gray-700'}`}
            >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <Text className="text-white font-bold text-lg">{item.title}</Text>
                        <Text className="text-gray-400 text-sm mb-1">{item.duration} min {item.repetitions ? `• ${item.repetitions} reps` : ''}</Text>
                        {item.description ? <Text className="text-gray-500 text-xs italic mb-2" numberOfLines={2}>{item.description}</Text> : null}

                        {item.stats && item.stats.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mt-1">
                                {item.stats.map((s, i) => (
                                    <View key={i} className="bg-gray-900 px-2 py-1 rounded border border-gray-700">
                                        <Text className="text-gray-300 text-xs">{s.label} ({s.unit})</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => item.id && handleRemoveExercise(item.id)} className="p-2">
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </ScaleDecorator>
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
            <GestureHandlerRootView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    {/* Header */}
                    <View className="px-4 py-4 flex-row items-center border-b border-gray-800">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-xl flex-1">{id ? 'Edit Workout' : 'Create Workout'}</Text>
                        <TouchableOpacity onPress={handleSaveWorkout} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#3b82f6" />
                            ) : (
                                <Text className="text-blue-500 font-bold text-lg">Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <DraggableFlatList
                        data={exercises}
                        onDragEnd={({ data }) => setExercises(data)}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        renderItem={renderExerciseItem}
                        extraData={[isAddingExercise, newExerciseStats, newExerciseTitle, newExerciseDuration, newExerciseReps]}
                        ListHeaderComponent={
                            <View className="p-4 gap-4">
                                <View>
                                    <Text className="text-gray-400 mb-2 font-bold">Title</Text>
                                    <TextInput
                                        className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700 text-lg"
                                        placeholder="e.g. Aim Routine"
                                        placeholderTextColor="#6b7280"
                                        value={title}
                                        onChangeText={setTitle}
                                    />
                                </View>

                                <View>
                                    <Text className="text-gray-400 mb-2 font-bold">Category</Text>
                                    <View className="flex-row gap-3">
                                        {['Training', 'Warmup'].map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setCategory(cat as any)}
                                                className={`flex-1 p-3 rounded-xl border ${category === cat ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700'}`}
                                            >
                                                <Text className={`text-center font-bold ${category === cat ? 'text-white' : 'text-gray-400'}`}>
                                                    {cat}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-gray-400 mb-2 font-bold">Description</Text>
                                    <TextInput
                                        className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700 min-h-[100px]"
                                        placeholder="Describe the workout..."
                                        placeholderTextColor="#6b7280"
                                        multiline
                                        textAlignVertical="top"
                                        value={description}
                                        onChangeText={setDescription}
                                    />
                                </View>

                                <Text className="text-gray-400 font-bold mt-2">Exercises</Text>
                            </View>
                        }
                        ListFooterComponent={
                            <View className="px-4 pb-20">
                                <TouchableOpacity
                                    onPress={() => setIsAddingExercise(true)}
                                    className="bg-gray-800 p-4 rounded-xl border border-gray-700 border-dashed items-center justify-center mt-2 mb-8"
                                >
                                    <Ionicons name="add-circle-outline" size={32} color="#60a5fa" />
                                    <Text className="text-blue-400 font-bold mt-2">Add Exercise</Text>
                                </TouchableOpacity>

                                {/* Add Exercise Modal */}
                                <Modal
                                    visible={isAddingExercise}
                                    transparent={true}
                                    animationType="slide"
                                    onRequestClose={closeExerciseModal}
                                >
                                    <KeyboardAvoidingView
                                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                        className="flex-1 justify-end"
                                    >
                                        <View className="bg-gray-900 rounded-t-3xl border-t border-gray-700 h-[80%] shadow-2xl">
                                            <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
                                                <Text className="text-white font-bold text-lg">{editingExerciseId ? 'Edit Exercise' : 'New Exercise'}</Text>
                                                <TouchableOpacity onPress={closeExerciseModal}>
                                                    <Ionicons name="close" size={24} color="#9ca3af" />
                                                </TouchableOpacity>
                                            </View>

                                            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                                                <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">Basic Info</Text>
                                                <TextInput
                                                    placeholder="Exercise Name"
                                                    placeholderTextColor="#6b7280"
                                                    value={newExerciseTitle}
                                                    onChangeText={setNewExerciseTitle}
                                                    className="bg-gray-800 text-white p-4 rounded-xl mb-3 border border-gray-700"
                                                    autoFocus
                                                />
                                                <TextInput
                                                    placeholder="Description (Instructions)"
                                                    placeholderTextColor="#6b7280"
                                                    value={newExerciseDescription}
                                                    onChangeText={setNewExerciseDescription}
                                                    multiline
                                                    className="bg-gray-800 text-white p-4 rounded-xl mb-4 border border-gray-700 min-h-[80px]"
                                                    textAlignVertical="top"
                                                />
                                                <View className="flex-row gap-4 mb-6">
                                                    <View className="flex-1">
                                                        <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">Duration (min)</Text>
                                                        <TextInput
                                                            placeholder="5"
                                                            placeholderTextColor="#6b7280"
                                                            value={newExerciseDuration}
                                                            onChangeText={setNewExerciseDuration}
                                                            keyboardType="numeric"
                                                            className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                                        />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">Reps (Optional)</Text>
                                                        <TextInput
                                                            placeholder="1"
                                                            placeholderTextColor="#6b7280"
                                                            value={newExerciseReps}
                                                            onChangeText={setNewExerciseReps}
                                                            keyboardType="numeric"
                                                            className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                                        />
                                                    </View>
                                                </View>

                                                {/* Stats Section */}
                                                <View className="mb-8">
                                                    <View className="flex-row justify-between items-center mb-4">
                                                        <Text className="text-gray-400 text-xs uppercase font-bold">Metrics to Track</Text>
                                                        <TouchableOpacity onPress={handleAddStat} className="bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-500/30">
                                                            <Text className="text-blue-400 text-xs font-bold">+ Add Metric</Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {newExerciseStats.map((stat, idx) => (
                                                        <View key={stat.id} className="bg-gray-800/50 p-2 rounded-xl mb-3 flex-row items-center gap-2 border border-gray-700">
                                                            {/* Stat Selector Dropdown Button */}
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setCurrentStatIdToUpdate(stat.id);
                                                                    setStatSelectorVisible(true);
                                                                }}
                                                                className="flex-1 bg-gray-800 px-4 py-3 rounded-lg border border-gray-600 flex-row justify-between items-center"
                                                            >
                                                                <Text className="text-white font-bold">{stat.label}</Text>
                                                                <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                                                            </TouchableOpacity>

                                                            {/* Unit Input */}
                                                            <View className="w-24">
                                                                <TextInput
                                                                    placeholder="Unit"
                                                                    placeholderTextColor="#6b7280"
                                                                    value={stat.unit}
                                                                    onChangeText={(t) => handleUpdateStat(stat.id, 'unit', t)}
                                                                    className="bg-gray-800 text-white px-3 py-3 rounded-lg text-center font-bold border border-gray-600"
                                                                />
                                                            </View>

                                                            <TouchableOpacity onPress={() => handleRemoveStat(stat.id)} className="p-2">
                                                                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}

                                                    {newExerciseStats.length === 0 && (
                                                        <View className="items-center py-4 opacity-50">
                                                            <Text className="text-gray-500 italic">No metrics added yet.</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                {/* Stat Selector Modal */}
                                                <Modal
                                                    visible={statSelectorVisible}
                                                    transparent={true}
                                                    animationType="fade"
                                                    onRequestClose={() => setStatSelectorVisible(false)}
                                                >
                                                    <View className="flex-1 bg-black/80 justify-center items-center px-4">
                                                        <View className="bg-gray-800 w-full max-w-sm rounded-2xl overflow-hidden border border-gray-700">
                                                            <View className="p-4 border-b border-gray-700 flex-row justify-between items-center bg-gray-800">
                                                                <Text className="text-white font-bold text-lg">Select Metric Type</Text>
                                                                <TouchableOpacity onPress={() => setStatSelectorVisible(false)}>
                                                                    <Ionicons name="close" size={24} color="gray" />
                                                                </TouchableOpacity>
                                                            </View>
                                                            <ScrollView className="max-h-[400px]">
                                                                {PREDEFINED_STATS.map((item, index) => (
                                                                    <TouchableOpacity
                                                                        key={index}
                                                                        onPress={() => handleSelectStat(item)}
                                                                        className="p-4 border-b border-gray-700/50 flex-row justify-between items-center active:bg-gray-700"
                                                                    >
                                                                        <Text className="text-white font-bold text-base">{item.label}</Text>
                                                                        {item.unit ? <View className="bg-gray-700 px-2 py-1 rounded"><Text className="text-gray-300 text-xs font-mono">{item.unit}</Text></View> : null}
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </ScrollView>
                                                        </View>
                                                    </View>
                                                </Modal>

                                                <TouchableOpacity onPress={handleAddExercise} className="bg-blue-600 p-4 rounded-xl items-center mt-4 mb-8 shadow-lg shadow-blue-900/20">
                                                    <Text className="text-white font-bold text-lg">{editingExerciseId ? 'Save Changes' : 'Add Exercise'}</Text>
                                                </TouchableOpacity>
                                            </ScrollView>
                                        </View>
                                    </KeyboardAvoidingView>
                                </Modal>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                </KeyboardAvoidingView>
            </GestureHandlerRootView>
        </SafeAreaView>
    );
}
