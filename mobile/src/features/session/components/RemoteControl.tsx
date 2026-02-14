import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
    onTag: (type: string) => void;
}

export const RemoteControl = ({ onTag }: Props) => {
    return (
        <View className="w-full flex-row flex-wrap justify-between gap-4 p-4">
            <TouchableOpacity
                className="w-[45%] bg-blue-600 h-32 rounded-2xl items-center justify-center shadow-lg"
                onPress={() => onTag('KILL')}
            >
                <Text className="text-white font-black text-2xl">KILL</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="w-[45%] bg-red-600 h-32 rounded-2xl items-center justify-center shadow-lg"
                onPress={() => onTag('DEATH')}
            >
                <Text className="text-white font-black text-2xl">DEATH</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="w-full bg-green-600 h-24 rounded-2xl items-center justify-center shadow-lg mt-4"
                onPress={() => onTag('HIGHLIGHT')}
            >
                <Text className="text-white font-bold text-xl">✨ MARK HIGHLIGHT</Text>
            </TouchableOpacity>
        </View>
    );
};
