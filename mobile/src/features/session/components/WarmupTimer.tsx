import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

interface Props {
    duration: number; // Seconds
    onComplete: () => void;
}

export const WarmupTimer = ({ duration, onComplete }: Props) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    return (
        <View className="items-center justify-center p-8">
            <Text className="text-6xl font-black text-yellow-400">{timeLeft}</Text>
            <Text className="text-gray-400 text-lg uppercase tracking-widest">Warmup</Text>
        </View>
    );
};
