import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity } from 'react-native';
import { VodType } from '../types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSubmit: (title: string, type: VodType, url?: string) => void;
    initialData?: { title: string; type: VodType; url?: string };
}

export const AddVodModal = ({ visible, onClose, onSubmit, initialData }: Props) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState<VodType>('YOUTUBE');

    React.useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setType(initialData.type);
            setUrl(initialData.url || '');
        } else {
            setTitle('');
            setType('YOUTUBE');
            setUrl('');
        }
    }, [initialData, visible]);

    const handleSubmit = () => {
        if (!title) return;
        onSubmit(title, type, url);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/80 justify-center px-4">
                <View className="bg-gray-800 p-6 rounded-2xl">
                    <Text className="text-white text-xl font-bold mb-4">Add New VOD</Text>

                    {/* Title Input */}
                    <Text className="text-gray-400 mb-2">Title</Text>
                    <TextInput
                        className="bg-gray-700 text-white p-3 rounded-lg mb-4"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g., Ranked vs T1"
                        placeholderTextColor="#6b7280"
                    />

                    {/* Type Selector */}
                    <Text className="text-gray-400 mb-2">Type</Text>
                    <View className="flex-row gap-2 mb-4">
                        {(['YOUTUBE', 'TWITCH', 'REPLAY'] as VodType[]).map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                className={`px-4 py-2 rounded-full ${type === t ? 'bg-blue-600' : 'bg-gray-700'}`}
                            >
                                <Text className="text-white text-xs font-bold">{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* URL Input (Hidden for Replay) */}
                    {type !== 'REPLAY' && (
                        <>
                            <Text className="text-gray-400 mb-2">URL</Text>
                            <TextInput
                                className="bg-gray-700 text-white p-3 rounded-lg mb-6"
                                value={url}
                                onChangeText={setUrl}
                                placeholder="https://..."
                                placeholderTextColor="#6b7280"
                            />
                        </>
                    )}

                    {/* Actions */}
                    <View className="flex-row justify-end gap-3">
                        <TouchableOpacity onPress={onClose} className="px-4 py-3">
                            <Text className="text-gray-400 font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            className="bg-blue-600 px-6 py-3 rounded-lg"
                        >
                            <Text className="text-white font-bold">Add VOD</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
