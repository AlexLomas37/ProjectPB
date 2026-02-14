import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { useGame } from '@/src/features/game/context';
import { TrainingService } from '@/src/features/training/api';
import { Workout } from '@/src/features/training/types';
import { Ionicons } from '@expo/vector-icons';

export default function TrainingScreen() {
    const { selectedGame, themeColor, backgroundColor } = useGame();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Warmup' | 'Training'>('ALL');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    // Derived state for available tags based on current workouts
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        workouts.forEach(w => w.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [workouts]);

    // Filtered workouts
    const filteredWorkouts = useMemo(() => {
        return workouts.filter(w => {
            const matchesCategory = selectedCategory === 'ALL' || w.category === selectedCategory;
            const matchesTag = selectedTag === null || w.tags.includes(selectedTag);
            return matchesCategory && matchesTag;
        });
    }, [workouts, selectedCategory, selectedTag]);

    const router = useRouter();

    const loadWorkouts = async () => {
        setIsLoading(true);
        const data = await TrainingService.getWorkouts(selectedGame);
        setWorkouts(data);
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadWorkouts();
            // Reset filters on game change
            setSelectedCategory('ALL');
            setSelectedTag(null);
        }, [selectedGame])
    );

    const renderWorkoutItem = ({ item }: { item: Workout }) => (
        <TouchableOpacity
            className="bg-gray-800 p-5 rounded-2xl mb-4 border border-gray-700"
            onPress={() => router.push(`/(app)/training/workout/${item.id}`)}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-white font-bold text-xl flex-1 mr-2">{item.title}</Text>
                <View className={`px-3 py-1 rounded-full ${item.category === 'Warmup' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                    }`}>
                    <Text className={`text-xs font-bold uppercase ${item.category === 'Warmup' ? 'text-orange-400' : 'text-blue-400'
                        }`}>{item.category}</Text>
                </View>
            </View>

            <Text className="text-gray-400 mb-4 text-sm">{item.description}</Text>

            <View className="flex-row gap-2 flex-wrap">
                <View className="bg-gray-700 px-2 py-1 rounded">
                    <Text className="text-gray-300 text-xs">⏱️ {item.duration} min</Text>
                </View>
                {item.tags.map(tag => (
                    <View key={tag} className="bg-gray-700/50 px-2 py-1 rounded border border-gray-600">
                        <Text className="text-gray-400 text-xs">#{tag}</Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );

    const FilterPill = ({ label, isActive, onPress }: { label: string, isActive: boolean, onPress: () => void }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full mr-2 mb-2 ${isActive ? '' : 'bg-gray-700 border border-gray-600'}`}
            style={isActive ? { backgroundColor: themeColor } : {}}
        >
            <Text className={`${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor }} edges={['bottom', 'left', 'right']}>
            <View className="px-4 pt-2 pb-2 flex-row justify-between items-center mb-4">
                <Text className="text-white text-3xl font-bold">Training</Text>
                <TouchableOpacity
                    onPress={() => setIsFilterModalVisible(true)}
                    className="bg-gray-800 p-3 rounded-xl border border-gray-700"
                >
                    <Ionicons name="filter" size={20} color={selectedCategory !== 'ALL' || selectedTag ? themeColor : '#9ca3af'} />
                </TouchableOpacity>
            </View>

            {/* Active Filters Summary (Optional, to show user something is filtered) */}
            {(selectedCategory !== 'ALL' || selectedTag) && (
                <View className="px-4 mb-2 flex-row gap-2">
                    {selectedCategory !== 'ALL' && (
                        <TouchableOpacity onPress={() => setSelectedCategory('ALL')} className="px-2 py-1 rounded-lg border flex-row items-center" style={{ backgroundColor: themeColor + '20', borderColor: themeColor + '50' }}>
                            <Text className="text-xs mr-1" style={{ color: themeColor }}>{selectedCategory}</Text>
                            <Text className="text-xs" style={{ color: themeColor }}>✕</Text>
                        </TouchableOpacity>
                    )}
                    {selectedTag && (
                        <TouchableOpacity onPress={() => setSelectedTag(null)} className="px-2 py-1 rounded-lg border flex-row items-center" style={{ backgroundColor: themeColor + '20', borderColor: themeColor + '50' }}>
                            <Text className="text-xs mr-1" style={{ color: themeColor }}>#{selectedTag}</Text>
                            <Text className="text-xs" style={{ color: themeColor }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <FlatList
                    data={filteredWorkouts}
                    keyExtractor={item => item.id}
                    renderItem={renderWorkoutItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center mt-20 opacity-50">
                            <Text className="text-gray-500">Aucun entraînement trouvé.</Text>
                        </View>
                    }
                />
            )}

            {/* Filter Modal */}
            <Modal
                visible={isFilterModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsFilterModalVisible(false)}
            >
                <View className="flex-1 bg-black/80 justify-center items-center px-4">
                    <View className="bg-gray-800 w-full rounded-2xl p-6 border border-gray-700">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">Filters</Text>
                            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-400 text-sm font-bold uppercase mb-3">Category</Text>
                        <View className="flex-row flex-wrap mb-6">
                            <FilterPill
                                label="Tout"
                                isActive={selectedCategory === 'ALL'}
                                onPress={() => setSelectedCategory('ALL')}
                            />
                            <FilterPill
                                label="Warmup"
                                isActive={selectedCategory === 'Warmup'}
                                onPress={() => setSelectedCategory('Warmup')}
                            />
                            <FilterPill
                                label="Training"
                                isActive={selectedCategory === 'Training'}
                                onPress={() => setSelectedCategory('Training')}
                            />
                        </View>

                        <Text className="text-gray-400 text-sm font-bold uppercase mb-3">Tags</Text>
                        <View className="flex-row flex-wrap mb-6">
                            {availableTags.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${selectedTag === tag
                                        ? 'bg-blue-600 border-blue-500'
                                        : 'bg-gray-700 border-gray-600'
                                        }`}
                                >
                                    <Text className={`text-xs ${selectedTag === tag ? 'text-white font-bold' : 'text-gray-400'}`}>
                                        #{tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsFilterModalVisible(false)}
                            className="py-3 rounded-xl items-center"
                            style={{ backgroundColor: themeColor }}
                        >
                            <Text className="text-white font-bold">Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Floating Add Button */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity
                    className="w-16 h-16 rounded-full items-center justify-center shadow-lg"
                    style={{ backgroundColor: themeColor }}
                    onPress={() => router.push('/(app)/training/create')}
                >
                    <Text className="text-white text-3xl font-bold pb-1">+</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
