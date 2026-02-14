import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppContainer, AppHeader, AppButton, AppTextInput, AppCard, SelectModal } from '@/src/shared/ui';
import { TrainingService } from '@/src/features/training/api';
import { Workout, Exercise, ExerciseStat, StatType } from '@/src/features/training/types';
import { Ionicons } from '@expo/vector-icons';
import { SupportedGame } from '@/src/shared/types';
import { useGame } from '@/src/features/game/context';

export default function EditWorkoutScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { themeColor, configs } = useGame();

    const [workout, setWorkout] = useState<Workout>({
        id: Date.now().toString(),
        game: 'LEAGUE_OF_LEGENDS',
        title: '',
        description: '',
        category: 'Training',
        duration: 0,
        exercises: [],
        tags: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Editing Exercise State
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
    const [isGamePickerVisible, setIsGamePickerVisible] = useState(false);
    const [isMetricSelectorVisible, setIsMetricSelectorVisible] = useState(false);

    // Stat options
    const STAT_TYPES: { label: string, value: StatType }[] = [
        { label: 'Score simple (ex: CS)', value: 'SCORE' },
        { label: 'Pourcentage (%)', value: 'PERCENTAGE' },
        { label: 'Ratio (ex: K/D)', value: 'RATIO' }
    ];

    useEffect(() => {
        const load = async () => {
            if (id && id !== 'new') {
                setIsLoading(true);
                const data = await TrainingService.getWorkoutById(id as string);
                if (data) setWorkout(data);
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSave = async () => {
        if (!workout.title) {
            Alert.alert('Erreur', 'Le titre est requis');
            return;
        }
        setIsSaving(true);
        await TrainingService.saveWorkout(workout);
        setIsSaving(false);
        router.back();
    };

    const handleSaveExercise = () => {
        if (!editingExercise) return;
        if (!editingExercise.title) {
            Alert.alert('Erreur', 'Le titre de l\'exercice est requis');
            return;
        }

        const updatedExercises = [...workout.exercises];
        const index = updatedExercises.findIndex(e => e.id === editingExercise.id);
        if (index >= 0) {
            updatedExercises[index] = editingExercise;
        } else {
            updatedExercises.push(editingExercise);
        }

        // Recalculate duration
        const totalDuration = updatedExercises.reduce((acc, ex) => acc + (ex.duration || 0), 0);

        setWorkout(prev => ({
            ...prev,
            exercises: updatedExercises,
            duration: totalDuration
        }));
        setIsExerciseModalVisible(false);
        setEditingExercise(null);
    };

    const addCustomStat = () => {
        if (!editingExercise) return;
        const newStat: ExerciseStat = {
            id: Date.now().toString(),
            type: 'SCORE',
            label: 'Nouveau Score',
            unit: ''
        };
        setEditingExercise(prev => ({
            ...prev!,
            stats: [...(prev?.stats || []), newStat]
        }));
    };

    const updateStat = (statId: string, field: keyof ExerciseStat, value: string) => {
        setEditingExercise(prev => ({
            ...prev!,
            stats: prev?.stats?.map(s => s.id === statId ? { ...s, [field]: value } : s)
        }));
    };

    const removeStat = (statId: string) => {
        setEditingExercise(prev => ({
            ...prev!,
            stats: prev?.stats?.filter(s => s.id !== statId)
        }));
    };

    if (isLoading) return <AppContainer><ActivityIndicator /></AppContainer>;

    if (isExerciseModalVisible && editingExercise) {
        return (
            <AppContainer safeArea={false}>
                <AppHeader
                    title={editingExercise.id ? "Modifier Exercice" : "Nouvel Exercice"}
                    showBack
                    onBack={() => setIsExerciseModalVisible(false)}
                />
                <ScrollView className="p-4">
                    <AppTextInput
                        label="Titre"
                        value={editingExercise.title}
                        onChangeText={t => setEditingExercise(prev => ({ ...prev!, title: t }))}
                    />
                    <AppTextInput
                        label="Description"
                        value={editingExercise.description}
                        onChangeText={t => setEditingExercise(prev => ({ ...prev!, description: t }))}
                        multiline
                    />
                    <AppTextInput
                        label="Durée estimée (min)"
                        value={editingExercise.duration?.toString()}
                        onChangeText={t => setEditingExercise(prev => ({ ...prev!, duration: parseInt(t) || 0 }))}
                        keyboardType="numeric"
                    />
                    <AppTextInput
                        label="Répétitions (Séries)"
                        value={editingExercise.repetitions?.toString()}
                        onChangeText={t => setEditingExercise(prev => ({ ...prev!, repetitions: parseInt(t) || 1 }))}
                        keyboardType="numeric"
                    />

                    <Text className="text-white font-bold text-lg mt-4 mb-2">Métriques (Stats)</Text>
                    <Text className="text-gray-400 text-xs mb-4">Définissez ce que le joueur doit enregistrer.</Text>

                    <View className="gap-3 mb-6">
                        {editingExercise.stats?.map((stat, index) => (
                            <View key={stat.id} className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-500 text-xs font-bold uppercase">Métrique {index + 1}</Text>
                                    <TouchableOpacity onPress={() => removeStat(stat.id)}>
                                        <Ionicons name="trash" size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>

                                <View className="gap-2">
                                    <AppTextInput
                                        label="Label (ex: CS, Kills)"
                                        value={stat.label}
                                        onChangeText={t => updateStat(stat.id, 'label', t)}
                                        containerClassName="mb-0"
                                    />
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-3 justify-center"
                                            // Ideally open a picker, simplified here cycling or simple check
                                            onPress={() => {
                                                const types: StatType[] = ['SCORE', 'PERCENTAGE', 'RATIO'];
                                                const currentIdx = types.indexOf(stat.type);
                                                const next = types[(currentIdx + 1) % types.length];
                                                updateStat(stat.id, 'type', next);
                                            }}
                                        >
                                            <Text className="text-gray-400 text-xs uppercase mb-1">Type</Text>
                                            <Text className="text-white font-bold">{stat.type}</Text>
                                        </TouchableOpacity>
                                        <View className="flex-1">
                                            <AppTextInput
                                                label="Unité (ex: %, min)"
                                                value={stat.unit}
                                                onChangeText={t => updateStat(stat.id, 'unit', t)}
                                                containerClassName="mb-0"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <View className="flex-row gap-2">
                            <AppButton
                                title="Bibliothèque"
                                onPress={() => setIsMetricSelectorVisible(true)}
                                variant="secondary"
                                className="flex-1"
                                icon={<Ionicons name="library" size={18} color="white" />}
                            />
                            <AppButton
                                title="Custom"
                                onPress={addCustomStat}
                                variant="ghost"
                                className="flex-1 bg-gray-800 border border-gray-700"
                                icon={<Ionicons name="create-outline" size={18} color="white" />}
                            />
                        </View>
                    </View>

                    <AppButton title="Valider l'exercice" onPress={handleSaveExercise} className="mb-10" />
                </ScrollView>

                <SelectModal
                    visible={isMetricSelectorVisible}
                    title={`Métriques ${configs[workout.game]?.displayName}`}
                    options={configs[workout.game]?.metrics?.map(m => ({
                        label: `${m.label} (${m.unit || m.type})`,
                        value: m.id
                    })) || []}
                    onSelect={(val) => {
                        const metric = configs[workout.game]?.metrics?.find(m => m.id === val);
                        if (metric) {
                            const newStat: ExerciseStat = {
                                id: Date.now().toString(),
                                type: metric.type,
                                label: metric.label,
                                unit: metric.unit
                            };
                            setEditingExercise(prev => ({
                                ...prev!,
                                stats: [...(prev?.stats || []), newStat]
                            }));
                        }
                        setIsMetricSelectorVisible(false);
                    }}
                    onClose={() => setIsMetricSelectorVisible(false)}
                />
            </AppContainer>
        );
    }

    return (
        <AppContainer safeArea={false} withKeyboard>
            <AppHeader title={id === 'new' ? "Créer Entraînement" : "Modifier Entraînement"} showBack />

            <ScrollView className="p-4">
                <AppCard className="mb-4">
                    <TouchableOpacity
                        className="flex-row items-center justify-between mb-4 border-b border-gray-700 pb-2"
                        onPress={() => setIsGamePickerVisible(true)}
                    >
                        <Text className="text-gray-400">Jeu</Text>
                        <View className="flex-row items-center gap-2">
                            {configs[workout.game]?.assets.logoUrl && (
                                <Image source={{ uri: configs[workout.game].assets.logoUrl }} className="w-6 h-6 rounded" />
                            )}
                            <Text className="text-white font-bold">{configs[workout.game]?.displayName || workout.game}</Text>
                            <Ionicons name="chevron-down" size={16} color="gray" />
                        </View>
                    </TouchableOpacity>

                    <AppTextInput
                        label="Titre"
                        value={workout.title}
                        onChangeText={t => setWorkout(prev => ({ ...prev, title: t }))}
                    />
                    <AppTextInput
                        label="Description"
                        value={workout.description}
                        onChangeText={t => setWorkout(prev => ({ ...prev, description: t }))}
                        multiline
                    />
                </AppCard>

                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white font-bold text-lg">Exercices</Text>
                    <TouchableOpacity
                        className="bg-blue-600 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
                        onPress={() => {
                            setEditingExercise({
                                id: Date.now().toString(),
                                title: '',
                                description: '',
                                duration: 5,
                                stats: [{ id: '1', type: 'SCORE', label: 'Score', unit: '' }]
                            });
                            setIsExerciseModalVisible(true);
                        }}
                    >
                        <Ionicons name="add" size={16} color="white" />
                        <Text className="text-white font-bold text-xs">Ajouter</Text>
                    </TouchableOpacity>
                </View>

                {workout.exercises.map((ex, idx) => (
                    <TouchableOpacity
                        key={ex.id}
                        onPress={() => {
                            setEditingExercise(JSON.parse(JSON.stringify(ex))); // Deep copy
                            setIsExerciseModalVisible(true);
                        }}
                    >
                        <AppCard className="mb-3 flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-white font-bold">{idx + 1}. {ex.title}</Text>
                                <Text className="text-gray-400 text-xs">{ex.duration} min • {ex.stats?.length || 0} métriques</Text>
                            </View>
                            <Ionicons name="pencil" size={16} color="#3b82f6" />
                        </AppCard>
                    </TouchableOpacity>
                ))}

                <AppButton
                    title="Enregistrer l'entraînement"
                    onPress={handleSave}
                    className="mt-6 mb-10"
                    disabled={isSaving}
                />
            </ScrollView>

            <SelectModal
                visible={isGamePickerVisible}
                title="Choisir un jeu"
                options={Object.values(configs).map(g => ({ label: g.displayName, value: g.id, iconUrl: g.assets.logoUrl }))}
                onSelect={(val) => setWorkout(prev => ({ ...prev, game: val as SupportedGame }))}
                onClose={() => setIsGamePickerVisible(false)}
                selectedValue={workout.game}
            />
        </AppContainer>
    );
}
