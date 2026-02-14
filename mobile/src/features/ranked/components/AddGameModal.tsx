import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { GameResult } from '../types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSubmit: (game: {
        champion: string;
        result: GameResult;
        kills: number;
        deaths: number;
        assists: number;
        lpChange: number;
        notes?: string;
    }) => void;
}

export const AddGameModal = ({ visible, onClose, onSubmit }: Props) => {
    const [champion, setChampion] = useState('');
    const [result, setResult] = useState<GameResult>('WIN');
    const [kills, setKills] = useState('');
    const [deaths, setDeaths] = useState('');
    const [assists, setAssists] = useState('');
    const [lpChange, setLpChange] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (!champion || !lpChange) return;

        onSubmit({
            champion,
            result,
            kills: parseInt(kills) || 0,
            deaths: parseInt(deaths) || 0,
            assists: parseInt(assists) || 0,
            lpChange: parseInt(lpChange) || 0,
            notes
        });

        // Reset form
        setChampion('');
        setResult('WIN');
        setKills('');
        setDeaths('');
        setAssists('');
        setLpChange('');
        setNotes('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/80 justify-center px-4">
                <View className="bg-gray-800 p-6 rounded-2xl max-h-4/5">
                    <Text className="text-white text-xl font-bold mb-4">Add Game Result</Text>

                    <ScrollView>
                        {/* Result Selector */}
                        <View className="flex-row gap-2 mb-4">
                            {(['WIN', 'LOSS', 'REMAKE'] as GameResult[]).map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    onPress={() => {
                                        setResult(r);
                                        // Auto-set negative LP for loss
                                        if (r === 'LOSS' && (!lpChange || parseInt(lpChange) > 0)) {
                                            setLpChange('-15');
                                        } else if (r === 'WIN' && (!lpChange || parseInt(lpChange) < 0)) {
                                            setLpChange('20');
                                        }
                                    }}
                                    className={`flex-1 py-3 rounded-lg items-center ${result === r
                                            ? r === 'WIN' ? 'bg-green-600' : r === 'LOSS' ? 'bg-red-600' : 'bg-gray-600'
                                            : 'bg-gray-700'
                                        }`}
                                >
                                    <Text className="text-white font-bold">{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Champion */}
                        <Text className="text-gray-400 mb-2">Champion</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg mb-4"
                            value={champion}
                            onChangeText={setChampion}
                            placeholder="e.g. Lee Sin"
                            placeholderTextColor="#6b7280"
                        />

                        {/* KDA Row */}
                        <View className="flex-row gap-2 mb-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 mb-2">K</Text>
                                <TextInput
                                    className="bg-gray-700 text-white p-3 rounded-lg text-center"
                                    value={kills}
                                    onChangeText={setKills}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 mb-2">D</Text>
                                <TextInput
                                    className="bg-gray-700 text-white p-3 rounded-lg text-center"
                                    value={deaths}
                                    onChangeText={setDeaths}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 mb-2">A</Text>
                                <TextInput
                                    className="bg-gray-700 text-white p-3 rounded-lg text-center"
                                    value={assists}
                                    onChangeText={setAssists}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* LP Change */}
                        <Text className="text-gray-400 mb-2">LP Change</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg mb-4"
                            value={lpChange}
                            onChangeText={setLpChange}
                            placeholder="+20 or -15"
                            placeholderTextColor="#6b7280"
                            keyboardType="numbers-and-punctuation"
                        />

                        {/* Notes */}
                        <Text className="text-gray-400 mb-2">Notes</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg mb-6"
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Optional notes..."
                            placeholderTextColor="#6b7280"
                            multiline
                        />

                        {/* Actions */}
                        <View className="flex-row justify-end gap-3 pb-4">
                            <TouchableOpacity onPress={onClose} className="px-4 py-3">
                                <Text className="text-gray-400 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                className="bg-blue-600 px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-bold">Add Game</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
