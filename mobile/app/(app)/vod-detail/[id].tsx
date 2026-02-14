import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Vod, Comment } from '@/src/features/vod/types';
import { VodService } from '@/src/features/vod/api';
import { WebView } from 'react-native-webview';
import { getEmbedUrl } from '@/src/features/vod/utils';
import { Ionicons } from '@expo/vector-icons';

export default function VodDetailScreen() {
    const { id } = useLocalSearchParams();
    const vodId = Array.isArray(id) ? id[0] : id;
    const [vod, setVod] = useState<Vod | null>(null);
    const [newComment, setNewComment] = useState('');
    const [timestamp, setTimestamp] = useState('00:00');
    const [activeMenu, setActiveMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    useEffect(() => {
        loadVod();
    }, [vodId]);

    const loadVod = async () => {
        const allVods = await VodService.getVods();
        const found = allVods.find((v) => v.id === vodId);
        setVod(found || null);
    };

    const handleAddComment = async () => {
        if (!newComment || !vod) return;

        // Parse timestamp (mm:ss) to seconds
        const [min, sec] = timestamp.split(':').map(Number);
        const totalSeconds = (min || 0) * 60 + (sec || 0);

        await VodService.addComment(vod.id, totalSeconds, newComment);
        setNewComment('');
        loadVod(); // Refresh
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const openMenu = (id: string, event: any) => {
        // Get absolute position of the touch
        const { pageX, pageY } = event.nativeEvent;
        setActiveMenu({ id, x: pageX - 100, y: pageY }); // Offset slightly left
    };

    const handleAction = async (action: 'EDIT' | 'DELETE', item: Comment) => {
        setActiveMenu(null);
        if (action === 'EDIT') {
            setEditingCommentId(item.id);
            setEditingCommentText(item.text);
        } else {
            await VodService.deleteComment(vod!.id, item.id);
            loadVod();
        }
    };

    const handleSaveEdit = async () => {
        if (!editingCommentId || !vod) return;
        await VodService.updateComment(vod.id, editingCommentId, editingCommentText);
        setEditingCommentId(null);
        setEditingCommentText('');
        loadVod();
    };

    if (!vod) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Loading...</Text>
            </SafeAreaView>
        );
    }

    const embedUrl = getEmbedUrl(vod.url, vod.type);

    return (
        <SafeAreaView className="flex-1 bg-gray-900 relative">
            {/* Video Player */}
            {embedUrl ? (
                <View className="w-full aspect-video bg-black">
                    <WebView
                        source={{ uri: embedUrl }}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                </View>
            ) : null}

            {/* Header */}
            <View className="p-4 border-b border-gray-800 flex-row items-center gap-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white font-bold text-lg numberOfLines={1}">{vod.title}</Text>
                    <Text className="text-gray-400 text-xs">{vod.type}</Text>
                </View>
                {vod.url && !embedUrl && (
                    <TouchableOpacity onPress={() => Linking.openURL(vod.url!)} className="bg-red-600 px-3 py-1 rounded">
                        <Text className="text-white font-bold text-xs">OPEN VOD</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Inputs */}
            <View className="p-4 bg-gray-800">
                <Text className="text-white font-bold mb-2">Add Note</Text>
                <View className="flex-row gap-2">
                    <TextInput
                        className="w-16 bg-gray-700 text-white p-2 rounded text-center"
                        value={timestamp}
                        onChangeText={setTimestamp}
                        placeholder="00:00"
                        keyboardType="numbers-and-punctuation"
                    />
                    <TextInput
                        className="flex-1 bg-gray-700 text-white p-2 rounded"
                        value={newComment}
                        onChangeText={setNewComment}
                        placeholder="Note..."
                        placeholderTextColor="#6b7280"
                    />
                    <TouchableOpacity onPress={handleAddComment} className="bg-blue-600 justify-center px-4 rounded">
                        <Text className="text-white font-bold">+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Comments List */}
            <FlatList
                data={vod.comments.sort((a, b) => a.timestampSeconds - b.timestampSeconds)}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View className="bg-gray-800 p-4 rounded-xl mb-3">
                        {editingCommentId === item.id ? (
                            <View>
                                <TextInput
                                    className="bg-gray-700 text-white p-3 rounded-lg mb-2"
                                    value={editingCommentText}
                                    onChangeText={setEditingCommentText}
                                    multiline
                                    autoFocus
                                />
                                <View className="flex-row justify-end gap-2">
                                    <TouchableOpacity onPress={() => setEditingCommentId(null)} className="px-3 py-2">
                                        <Text className="text-gray-400">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSaveEdit} className="bg-blue-600 px-3 py-2 rounded-lg">
                                        <Text className="text-white font-bold">Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View>
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-blue-400 font-bold font-mono text-xs mb-1">
                                            {formatTime(item.timestampSeconds)}
                                        </Text>
                                        <Text className="text-white text-base">{item.text}</Text>
                                    </View>
                                    <TouchableOpacity
                                        className="p-2 -mt-2 -mr-2"
                                        onPress={(e) => openMenu(item.id, e)}
                                    >
                                        <Text className="text-gray-400 font-bold text-lg px-2">⋮</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-gray-500 text-xs mt-2 text-right">
                                    {new Date(item.createdAt).toLocaleTimeString()}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
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
                            onPress={() => handleAction('EDIT', vod.comments.find(c => c.id === activeMenu.id)!)}
                            className="p-3 border-b border-gray-600"
                        >
                            <Text className="text-white text-sm">✏️ Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleAction('DELETE', vod.comments.find(c => c.id === activeMenu.id)!)}
                            className="p-3"
                        >
                            <Text className="text-red-400 text-sm">🗑️ Delete</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}
