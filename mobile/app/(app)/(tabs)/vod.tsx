import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Vod, VodType } from '@/src/features/vod/types';
import { VodService } from '@/src/features/vod/api';
import { AddVodModal } from '@/src/features/vod/components/AddVodModal';
import { useGame } from '@/src/features/game/context';

export default function VodScreen() {
    const { selectedGame, themeColor, backgroundColor } = useGame();
    const [vods, setVods] = useState<Vod[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingVod, setEditingVod] = useState<Vod | null>(null);
    const [activeMenu, setActiveMenu] = useState<{ id: string; x: number; y: number } | null>(null);

    const loadVods = async () => {
        setRefreshing(true);
        const data = await VodService.getVods();
        setVods(data.filter(v => v.game === selectedGame));
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadVods();
        }, [selectedGame])
    );

    const handleAddOrEditVod = async (title: string, type: VodType, url?: string) => {
        if (editingVod) {
            await VodService.updateVod(editingVod.id, title);
            // Note: updateVod in mock only updates title for now, ideally update all fields
        } else {
            await VodService.addVod(title, type, selectedGame, url);
        }
        setEditingVod(null);
        loadVods();
    };

    const openMenu = (id: string, event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        // Adjustment: pageY is screen-absolute, subtracting ~100 for Header height
        setActiveMenu({ id, x: pageX - 120, y: pageY - 100 });
    };

    const handleAction = async (action: 'EDIT' | 'DELETE', item: Vod) => {
        setActiveMenu(null);
        if (action === 'EDIT') {
            setEditingVod(item);
            setModalVisible(true);
        } else {
            await VodService.deleteVod(item.id);
            loadVods();
        }
    };

    const openVod = (vod: Vod) => {
        router.push(`/(app)/vod-detail/${vod.id}`);
    };

    const renderItem = ({ item }: { item: Vod }) => (
        <View className="bg-gray-800 p-4 rounded-xl mb-3 flex-row items-center justify-between z-10">
            <TouchableOpacity onPress={() => openVod(item)} className="flex-1">
                <View>
                    <Text className="text-white font-bold text-lg">{item.title}</Text>
                    <Text className="text-gray-400 text-sm">
                        {item.type} • {new Date(item.date).toLocaleDateString()}
                    </Text>
                    {item.comments.length > 0 && (
                        <Text className="text-xs mt-1" style={{ color: themeColor }}>{item.comments.length} comments</Text>
                    )}
                </View>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
                <Text className="text-2xl mr-2">
                    {item.type === 'YOUTUBE' ? '🔴' : item.type === 'TWITCH' ? '🟣' : '🎮'}
                </Text>
                <TouchableOpacity onPress={(e) => openMenu(item.id, e)} className="p-2">
                    <Text className="text-gray-400 font-bold text-lg">⋮</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 relative" style={{ backgroundColor }} edges={['bottom', 'left', 'right']}>
            <View className="px-4 pt-2 pb-4 flex-row justify-between items-center">
                <Text className="text-white text-3xl font-bold">VOD Review</Text>
                <TouchableOpacity
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: themeColor }}
                    onPress={() => {
                        setEditingVod(null);
                        setModalVisible(true);
                    }}
                >
                    <Text className="text-white font-bold">+ Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={vods}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadVods} tintColor="#fff" />
                }
                ListEmptyComponent={
                    <Text className="text-gray-500 text-center mt-10">No VODs found. Add one to start reviewing!</Text>
                }
            />

            {/* Global Overlay Menu */}
            {activeMenu && (
                <>
                    <TouchableOpacity
                        className="absolute inset-0 bg-transparent z-40"
                        onPress={() => setActiveMenu(null)}
                    />
                    <View
                        className="absolute bg-gray-700 rounded-lg shadow-lg z-50 w-32 border border-gray-600"
                        style={{ top: activeMenu.y, left: activeMenu.x }}
                    >
                        <TouchableOpacity
                            onPress={() => handleAction('EDIT', vods.find(v => v.id === activeMenu.id)!)}
                            className="p-3 border-b border-gray-600"
                        >
                            <Text className="text-white text-sm">✏️ Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleAction('DELETE', vods.find(v => v.id === activeMenu.id)!)}
                            className="p-3"
                        >
                            <Text className="text-red-400 text-sm">🗑️ Delete</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <AddVodModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleAddOrEditVod}
                initialData={editingVod ? { title: editingVod.title, type: editingVod.type, url: editingVod.url } : undefined}
            />
        </SafeAreaView>
    );
}
