import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Game, GameComment } from '@/src/features/ranked/types';
import { RankedService } from '@/src/features/ranked/api';
import { Ionicons } from '@expo/vector-icons';

export default function GameDetailScreen() {
    const { id } = useLocalSearchParams();
    const [game, setGame] = useState<Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');

    // Game Editing State
    const [isEditingGame, setIsEditingGame] = useState(false);
    const [editedStats, setEditedStats] = useState<{ kills: string; deaths: string; assists: string; lpChange: string; result?: any }>({ kills: '', deaths: '', assists: '', lpChange: '' });

    // Comment Editing State
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    // Popup Menu State
    const [activeMenu, setActiveMenu] = useState<{ id: string; x: number; y: number } | null>(null);

    const openMenu = (id: string, event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        // Adjust position to not go off screen right
        setActiveMenu({ id, x: pageX - 100, y: pageY + 10 });
    };

    const handleMenuAction = (action: 'EDIT' | 'DELETE') => {
        if (!activeMenu || !game) return;
        const commentId = activeMenu.id;
        setActiveMenu(null);

        const comment = game.comments?.find(c => c.id === commentId);
        if (!comment) return;

        if (action === 'EDIT') {
            startEditComment(comment);
        } else {
            handleDeleteComment(commentId);
        }
    };

    const loadGame = async () => {
        if (typeof id !== 'string') return;
        const data = await RankedService.getGameById(id);
        setGame(data);
        if (data) {
            setEditedStats({
                kills: data.kills.toString(),
                deaths: data.deaths.toString(),
                assists: data.assists.toString(),
                lpChange: data.lpChange.toString(),
                result: data.result
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadGame();
    }, [id]);

    const handleSaveGame = async () => {
        if (!game) return;
        try {
            await RankedService.updateGame(game.id, {
                kills: parseInt(editedStats.kills) || 0,
                deaths: parseInt(editedStats.deaths) || 0,
                assists: parseInt(editedStats.assists) || 0,
                lpChange: parseInt(editedStats.lpChange) || 0,
                result: editedStats.result
            });
            setIsEditingGame(false);
            loadGame();
        } catch (e) {
            Alert.alert('Error', 'Failed to save changes');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !game) return;
        const updatedGame = await RankedService.addComment(game.id, newComment);
        setGame(updatedGame);
        setNewComment('');
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!game) return;
        Alert.alert("Delete", "Delete this comment?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const updated = await RankedService.deleteComment(game.id, commentId);
                    setGame(updated);
                }
            }
        ]);
    };

    const startEditComment = (comment: GameComment) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.text);
    };

    const saveEditComment = async () => {
        if (!game || !editingCommentId) return;
        const updated = await RankedService.editComment(game.id, editingCommentId, editingCommentText);
        setGame(updated);
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    if (!game) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Game not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-400">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="px-4 py-2 border-b border-gray-800 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Game Details</Text>
                <TouchableOpacity onPress={() => isEditingGame ? handleSaveGame() : setIsEditingGame(true)}>
                    <Text className="text-blue-400 font-bold">{isEditingGame ? 'Save' : 'Edit'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Header Card / Edit Form */}
                <View className={`p-6 rounded-2xl mb-6 ${(isEditingGame ? editedStats.result : game.result) === 'WIN' ? 'bg-green-900/40 border-green-500/30' :
                        (isEditingGame ? editedStats.result : game.result) === 'LOSS' ? 'bg-red-900/40 border-red-500/30' :
                            'bg-gray-800 border-gray-700'
                    } border`}>

                    {isEditingGame ? (
                        <View className="mb-4">
                            <View className="flex-row justify-between mb-2 gap-2">
                                {['WIN', 'LOSS', 'DRAW'].map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        onPress={() => setEditedStats(p => ({ ...p, result: r as any }))}
                                        className={`flex-1 px-3 py-2 rounded-lg border items-center ${editedStats.result === r ? (r === 'WIN' ? 'bg-green-600 border-green-500' : r === 'LOSS' ? 'bg-red-600 border-red-500' : 'bg-gray-600 border-gray-500') : 'bg-transparent border-gray-600'}`}
                                    >
                                        <Text className={`font-bold text-xs ${editedStats.result === r ? 'text-white' : 'text-gray-400'}`}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className={`text-4xl font-black italic ${game.result === 'WIN' ? 'text-green-400' : game.result === 'LOSS' ? 'text-red-400' : 'text-gray-400'}`}>
                                {game.result}
                            </Text>
                            <View className="bg-gray-800/80 px-4 py-2 rounded-lg">
                                <Text className="text-white font-bold">{game.champion}</Text>
                            </View>
                        </View>
                    )}

                    {isEditingGame ? (
                        <View className="flex-row justify-between items-end gap-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-xs uppercase font-bold mb-1">K / D / A</Text>
                                <View className="flex-row gap-2">
                                    <TextInput
                                        className="bg-black/30 text-white p-2 rounded w-12 text-center"
                                        placeholder="K" placeholderTextColor="#555"
                                        value={editedStats.kills} onChangeText={t => setEditedStats(p => ({ ...p, kills: t }))} keyboardType="numeric"
                                    />
                                    <TextInput
                                        className="bg-black/30 text-white p-2 rounded w-12 text-center"
                                        placeholder="D" placeholderTextColor="#555"
                                        value={editedStats.deaths} onChangeText={t => setEditedStats(p => ({ ...p, deaths: t }))} keyboardType="numeric"
                                    />
                                    <TextInput
                                        className="bg-black/30 text-white p-2 rounded w-12 text-center"
                                        placeholder="A" placeholderTextColor="#555"
                                        value={editedStats.assists} onChangeText={t => setEditedStats(p => ({ ...p, assists: t }))} keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-gray-400 text-xs uppercase font-bold mb-1">LP Change</Text>
                                <TextInput
                                    className="bg-black/30 text-white p-2 rounded w-20 text-center font-bold"
                                    value={editedStats.lpChange} onChangeText={t => setEditedStats(p => ({ ...p, lpChange: t }))} keyboardType="numeric"
                                />
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row justify-between items-end">
                            <View>
                                <Text className="text-gray-400 text-xs uppercase font-bold mb-1">KDA</Text>
                                <Text className="text-white text-2xl font-bold">{game.kills} / {game.deaths} / {game.assists}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-gray-400 text-xs uppercase font-bold mb-1">LP Change</Text>
                                <Text className={`text-2xl font-bold ${game.lpChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {game.lpChange > 0 ? '+' : ''}{game.lpChange}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Comments Section */}
                <Text className="text-gray-400 font-bold mb-4 uppercase text-sm tracking-widest">Comments & Notes</Text>

                {/* Comments List */}
                {game.comments && game.comments.map(comment => (
                    <View key={comment.id} className="bg-gray-800 p-4 rounded-xl mb-3">
                        {editingCommentId === comment.id ? (
                            <View>
                                <TextInput
                                    className="bg-gray-700 text-white p-3 rounded-lg mb-2"
                                    value={editingCommentText}
                                    onChangeText={setEditingCommentText}
                                    multiline
                                />
                                <View className="flex-row justify-end gap-2">
                                    <TouchableOpacity onPress={() => setEditingCommentId(null)} className="px-3 py-2">
                                        <Text className="text-gray-400">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={saveEditComment} className="bg-blue-600 px-3 py-2 rounded-lg">
                                        <Text className="text-white font-bold">Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View className="flex-row justify-between items-start">
                                <Text className="text-white flex-1 mr-2">{comment.text}</Text>
                                <TouchableOpacity
                                    className="p-2 -mt-2 -mr-2"
                                    onPress={(e) => openMenu(comment.id, e)}
                                >
                                    <Text className="text-gray-400 font-bold text-lg px-2">⋮</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {!editingCommentId && (
                            <Text className="text-gray-500 text-xs mt-2 text-right">
                                {new Date(comment.createdAt).toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                ))}

                {/* Add Comment Input */}
                <View className="bg-gray-800 p-2 rounded-xl flex-row items-center mt-2 mb-8">
                    <TextInput
                        className="flex-1 text-white p-2 min-h-[40px]"
                        placeholder="Add a comment..."
                        placeholderTextColor="#6b7280"
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        className="bg-blue-600 p-3 rounded-lg ml-2"
                        onPress={handleAddComment}
                    >
                        <Text className="text-white font-bold">Post</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
                            onPress={() => handleMenuAction('EDIT')}
                            className="p-3 border-b border-gray-600 flex-row items-center gap-2"
                        >
                            <Text>✏️</Text>
                            <Text className="text-white text-sm">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleMenuAction('DELETE')}
                            className="p-3 flex-row items-center gap-2"
                        >
                            <Text>🗑️</Text>
                            <Text className="text-red-400 text-sm">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}
