import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { GameHeader } from '@/src/features/game/header';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useGame } from '@/src/features/game/context';

export default function TabLayout() {
    const { themeColor, headerFooterColor } = useGame();

    return (
        <View style={{ flex: 1 }}>
            <GameHeader />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: headerFooterColor,
                        borderTopColor: 'rgba(255,255,255,0.1)',
                    },
                    tabBarActiveTintColor: themeColor,
                    tabBarInactiveTintColor: '#9ca3af', // gray-400
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                        marginBottom: 4,
                    },
                    tabBarItemStyle: {
                        paddingVertical: 4,
                    },
                }}
            >
                <Tabs.Screen
                    name="training"
                    options={{
                        title: 'Training',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "barbell" : "barbell-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="ranked"
                    options={{
                        title: 'Ranked',
                        tabBarIcon: ({ color, focused }) => (
                            <MaterialCommunityIcons
                                name="sword-cross"
                                size={24}
                                color={color}
                                style={{ opacity: focused ? 1 : 0.7 }}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="vod"
                    options={{
                        title: 'VOD',
                        tabBarIcon: ({ color, focused }) => (
                            <MaterialCommunityIcons
                                name={focused ? "video" : "video-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}
