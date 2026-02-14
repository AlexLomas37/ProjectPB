import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Switch, Image, LayoutAnimation, Platform, UIManager, KeyboardAvoidingView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const AccordionSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };
    return (
        <View className="mb-4">
            <TouchableOpacity onPress={toggle} className="flex-row justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                <Text className="text-white font-bold uppercase">{title}</Text>
                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="white" />
            </TouchableOpacity>
            {isOpen && (
                <View className="mt-2 bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
                    {children}
                </View>
            )}
        </View>
    );
};



const ImportJsonModal = ({ visible, onClose, onImport }: { visible: boolean; onClose: () => void; onImport: (json: string) => void }) => {
    const [text, setText] = useState('');

    const handleImport = () => {
        onImport(text);
        setText('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/80 justify-center p-4">
                <View className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <Text className="text-white text-xl font-bold mb-4">Importer JSON</Text>
                    <Text className="text-gray-400 text-xs mb-2">Collez un tableau JSON : {`[{"name": "...", "iconUrl": "..."}]`}</Text>
                    <TextInput
                        className="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 h-40 text-top mb-4"
                        multiline
                        placeholder='[{"name": "Map 1", "iconUrl": "..."}]'
                        placeholderTextColor="#6b7280"
                        value={text}
                        onChangeText={setText}
                        textAlignVertical="top"
                    />
                    <View className="flex-row justify-end gap-3">
                        <AppButton title="Annuler" variant="ghost" onPress={onClose} />
                        <AppButton title="Importer" onPress={handleImport} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const FullConfigModal = ({ visible, mode, configJson, onClose, onImport }: { visible: boolean; mode: 'import' | 'export'; configJson?: string; onClose: () => void; onImport: (json: string) => void }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (mode === 'export' && configJson) {
            setText(configJson);
        } else {
            setText('');
        }
    }, [mode, configJson, visible]);

    const handleAction = () => {
        if (mode === 'import') {
            onImport(text);
            onClose();
        } else {
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/90 justify-center items-center p-4">
                <View className="bg-gray-800 rounded-2xl w-full h-[90%] border border-gray-700 flex-col overflow-hidden">
                    {/* Header */}
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-700 bg-gray-900/50">
                        <View className="flex-1 mr-4">
                            <Text className="text-white text-xl font-bold">{mode === 'export' ? 'Exporter Configuration' : 'Importer Configuration'}</Text>
                            <Text className="text-gray-400 text-xs">
                                {mode === 'export' ? 'Copiez ce JSON pour sauvegarder.' : 'Collez le JSON complet ici.'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-gray-700/50 rounded-full">
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View className="flex-1 p-4 bg-gray-900">
                        {mode === 'export' ? (
                            <ScrollView className="flex-1 rounded-xl border border-gray-700 bg-gray-950 p-4">
                                <Text className="text-white text-xs font-mono" selectable>{text}</Text>
                            </ScrollView>
                        ) : (
                            <TextInput
                                className="flex-1 text-white text-xs font-mono p-4 rounded-xl border border-gray-700 bg-gray-950"
                                multiline
                                style={{ color: '#ffffff', textAlignVertical: 'top' }}
                                value={text}
                                onChangeText={setText}
                                placeholder="Collez le JSON ici..."
                                placeholderTextColor="#6b7280"
                            />
                        )}
                    </View>

                    {/* Footer */}
                    <View className="p-4 border-t border-gray-700 bg-gray-900/50 flex-row justify-end gap-3">
                        {mode === 'export' && (
                            <AppButton
                                title="Copier le JSON"
                                onPress={async () => {
                                    await Clipboard.setStringAsync(text);
                                    Alert.alert('Succès', 'Copié dans le presse-papier !');
                                }}
                            />
                        )}
                        {mode === 'import' && <AppButton title="Importer la Configuration" onPress={handleAction} />}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const EditableItemList = ({ items, onUpdate, placeholder }: { items: { name: string, iconUrl?: string, isActive?: boolean }[], onUpdate: (items: any[]) => void, placeholder: string }) => {
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('');
    const [importModalVisible, setImportModalVisible] = useState(false);

    const addItem = () => {
        if (!newName.trim()) {
            Alert.alert('Erreur', 'Le nom est requis.');
            return;
        }
        onUpdate([...items, { name: newName.trim(), iconUrl: newIcon.trim() || undefined }]);
        setNewName('');
        setNewIcon('');
    };

    const removeItem = (index: number) => {
        const next = [...items];
        next.splice(index, 1);
        onUpdate(next);
    };

    const updateItem = (index: number, field: 'name' | 'iconUrl', value: string) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        onUpdate(next);
    };

    const toggleActive = (index: number) => {
        const next = [...items];
        const current = next[index].isActive !== false;
        next[index] = { ...next[index], isActive: !current };
        onUpdate(next);
    };

    const handleJsonImport = (json: string) => {
        try {
            const parsed = JSON.parse(json);
            if (!Array.isArray(parsed)) throw new Error('Format invalide : doit être un tableau');

            const newItems = parsed.map(p => ({
                name: p.name || p.Name || p.label || 'Inconnu',
                iconUrl: p.iconUrl || p.IconUrl || p.image || undefined,
                isActive: p.isActive !== undefined ? p.isActive : true
            }));

            onUpdate([...items, ...newItems]);
            Alert.alert('Succès', `${newItems.length} éléments importés.`);
        } catch (e) {
            Alert.alert('Erreur', 'JSON invalide. Vérifiez le format.');
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const next = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

        onUpdate(next);
    };

    return (
        <View>
            <View className="flex-row gap-2 mb-4">
                <View className="flex-1 gap-2">
                    <TextInput
                        className="bg-gray-700 text-white p-3 rounded-xl border border-gray-600"
                        placeholder={placeholder}
                        placeholderTextColor="#9ca3af"
                        value={newName}
                        onChangeText={setNewName}
                    />
                    <TextInput
                        className="bg-gray-700 text-white p-3 rounded-xl border border-gray-600"
                        placeholder="URL de l'icône (Optionnel)"
                        placeholderTextColor="#9ca3af"
                        value={newIcon}
                        onChangeText={setNewIcon}
                    />
                </View>
                <View className="justify-between gap-2">
                    <TouchableOpacity
                        onPress={addItem}
                        className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center border border-blue-500"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setImportModalVisible(true)}
                        className="w-12 h-10 bg-gray-700 rounded-xl items-center justify-center border border-gray-600"
                    >
                        <Ionicons name="code-download" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
            </View>

            <ImportJsonModal
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onImport={handleJsonImport}
            />

            <View>
                {items.length === 0 && <Text className="text-gray-500 text-center italic">Aucun élément</Text>}
                {items.map((item, idx) => (
                    <View key={`${item.name}-${idx}`} className="flex-row items-center mb-3 bg-gray-800 p-3 rounded-xl border border-gray-700">
                        {/* Content Container */}
                        <View className="flex-1 flex-col gap-2">
                            <View className="flex-row items-center justify-between gap-2">
                                {/* Icon Preview */}
                                <TouchableOpacity onPress={() => { /* Preview */ }}>
                                    {item.iconUrl ? (
                                        <Image source={{ uri: item.iconUrl }} className="w-10 h-10 rounded bg-gray-900" style={{ resizeMode: 'contain' }} />
                                    ) : (
                                        <View className="w-10 h-10 rounded bg-gray-700 items-center justify-center">
                                            <Text className="text-gray-400 text-xs">{item.name.charAt(0)}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Editable Inputs */}
                                <View className="flex-1 gap-2">
                                    <TextInput
                                        className="bg-gray-900/50 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm font-bold"
                                        value={item.name}
                                        onChangeText={(t) => updateItem(idx, 'name', t)}
                                        placeholder="Nom"
                                        placeholderTextColor="#6b7280"
                                    />
                                    <TextInput
                                        className="bg-gray-900/50 text-gray-300 px-3 py-1 rounded-lg border border-gray-700 text-xs"
                                        value={item.iconUrl || ''}
                                        onChangeText={(t) => updateItem(idx, 'iconUrl', t)}
                                        placeholder="URL Icône"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>

                                {/* Actions: Active Toggle, Up/Down, Delete */}
                                <View className="items-center justify-between gap-1">
                                    <TouchableOpacity onPress={() => toggleActive(idx)} className={`p-1 rounded-lg ${item.isActive !== false ? 'bg-blue-500/10' : 'bg-gray-700/50'}`}>
                                        <Ionicons name={item.isActive !== false ? "eye" : "eye-off"} size={16} color={item.isActive !== false ? "#3b82f6" : "#6b7280"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => removeItem(idx)} className="p-1 bg-red-500/10 rounded-lg">
                                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>

                                {/* Arrows Column */}
                                <View className="items-center justify-center ml-1 bg-gray-700/30 rounded-lg p-1">
                                    <TouchableOpacity onPress={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-1">
                                        <Ionicons name="caret-up" size={16} color={idx === 0 ? "#4b5563" : "#e5e7eb"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="p-1">
                                        <Ionicons name="caret-down" size={16} color={idx === items.length - 1 ? "#4b5563" : "#e5e7eb"} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGame, MetricItem, MetricType } from '@/src/features/game/context';
import { AppContainer, AppHeader, AppTextInput, AppButton, ColorPickerModal } from '@/src/shared/ui';
import { SupportedGame } from '@/src/shared/types';

const EditableMetricsList = ({ items, onUpdate }: { items: MetricItem[], onUpdate: (items: MetricItem[]) => void }) => {
    const [newLabel, setNewLabel] = useState('');
    const [newUnit, setNewUnit] = useState('');
    const [newType, setNewType] = useState<MetricType>('SCORE');

    const addItem = () => {
        if (!newLabel.trim()) {
            Alert.alert('Erreur', 'Le label est requis.');
            return;
        }
        const id = newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
        onUpdate([...items, { id, label: newLabel.trim(), unit: newUnit.trim(), type: newType }]);
        setNewLabel('');
        setNewUnit('');
        setNewType('SCORE');
    };

    const removeItem = (index: number) => {
        const next = [...items];
        next.splice(index, 1);
        onUpdate(next);
    };

    const updateItem = (index: number, field: keyof MetricItem, value: any) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        onUpdate(next);
    };

    return (
        <View>
            <View className="mb-4 bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Ajouter une métrique</Text>
                <View className="flex-row gap-2 mb-2">
                    <TextInput
                        className="flex-1 bg-gray-700 text-white p-2 rounded-lg border border-gray-600 text-xs"
                        placeholder="Label (ex: CS, Headshot)"
                        placeholderTextColor="#9ca3af"
                        value={newLabel}
                        onChangeText={setNewLabel}
                    />
                    <TextInput
                        className="w-20 bg-gray-700 text-white p-2 rounded-lg border border-gray-600 text-xs"
                        placeholder="Unité"
                        placeholderTextColor="#9ca3af"
                        value={newUnit}
                        onChangeText={setNewUnit}
                    />
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        className="flex-1 bg-gray-700 p-2 rounded-lg border border-gray-600 justify-center items-center"
                        onPress={() => {
                            const types: MetricType[] = ['SCORE', 'PERCENTAGE', 'RATIO'];
                            const idx = types.indexOf(newType);
                            setNewType(types[(idx + 1) % types.length]);
                        }}
                    >
                        <Text className="text-white text-xs font-bold">{newType}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={addItem}
                        className="bg-blue-600 px-4 rounded-lg items-center justify-center"
                    >
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View>
                {items.length === 0 && <Text className="text-gray-500 text-center italic">Aucune métrique définie</Text>}
                {items.map((item, idx) => (
                    <View key={item.id} className="flex-row items-center mb-2 bg-gray-800 p-3 rounded-xl border border-gray-700 justify-between">
                        <View className="flex-1 gap-2">
                            <View className="flex-row gap-2">
                                <TextInput
                                    className="flex-1 bg-gray-900/50 text-white px-2 py-1 rounded border border-gray-700 text-xs font-bold"
                                    value={item.label}
                                    onChangeText={(t) => updateItem(idx, 'label', t)}
                                />
                                <TextInput
                                    className="w-16 bg-gray-900/50 text-white px-2 py-1 rounded border border-gray-700 text-xs"
                                    value={item.unit}
                                    onChangeText={(t) => updateItem(idx, 'unit', t)}
                                    placeholder="Unité"
                                    placeholderTextColor="#6b7280"
                                />
                            </View>
                            <TouchableOpacity
                                className="self-start bg-gray-900/50 px-2 py-1 rounded border border-gray-700"
                                onPress={() => {
                                    const types: MetricType[] = ['SCORE', 'PERCENTAGE', 'RATIO'];
                                    const currentIdx = types.indexOf(item.type);
                                    updateItem(idx, 'type', types[(currentIdx + 1) % types.length]);
                                }}
                            >
                                <Text className="text-gray-400 text-[10px] uppercase font-bold">{item.type}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => removeItem(idx)} className="p-2 ml-2 bg-red-500/10 rounded-lg">
                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default function GameEditScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { configs, updateGameConfig } = useGame();
    const gameId = id as SupportedGame;
    const config = configs[gameId];

    const [displayName, setDisplayName] = useState(config?.displayName || '');
    const [logoUrl, setLogoUrl] = useState(config?.assets.logoUrl || '');
    const [primaryColor, setPrimaryColor] = useState(config?.colors.primary || '');
    const [bgColor, setBgColor] = useState(config?.colors.background || '');
    const [hfColor, setHfColor] = useState(config?.colors.headerFooter || '');
    const [pointsLabel, setPointsLabel] = useState(config?.terminology.points || '');
    const [rankLabel, setRankLabel] = useState(config?.terminology.rank || '');

    // Rank editing state
    const [ranks, setRanks] = useState(config?.ranks || []);
    const [maps, setMaps] = useState(config?.maps || []);
    const [agents, setAgents] = useState(config?.agents || []);
    const [metrics, setMetrics] = useState<MetricItem[]>(config?.metrics || []);

    const [hidden, setHidden] = useState(config?.hidden || false);
    const [apiName, setApiName] = useState(config?.api?.name || '');
    const [apiBaseUrl, setApiBaseUrl] = useState(config?.api?.baseUrl || '');

    const [features, setFeatures] = useState(config?.features || {
        hasAgent: true, hasMap: false, hasKDA: true, hasScore: false, hasMental: true, hasPerformance: true
    });

    const [pickerConfig, setPickerConfig] = useState<{ visible: boolean; color: string; onChange: (c: string) => void }>({
        visible: false,
        color: '#ffffff',
        onChange: () => { }
    });

    // Config Export/Import State
    const [configModal, setConfigModal] = useState<{ visible: boolean; mode: 'import' | 'export'; json?: string }>({
        visible: false, mode: 'export'
    });

    const handleExportConfig = () => {
        const exportData = {
            displayName,
            colors: { primary: primaryColor, background: bgColor, headerFooter: hfColor },
            terminology: { points: pointsLabel, rank: rankLabel },
            assets: { ...config.assets, logoUrl },
            ranks, maps, agents, metrics,
            hidden,
            api: { name: apiName, baseUrl: apiBaseUrl },
            features
        };
        const json = JSON.stringify(exportData, null, 2);

        // Copy directly
        Clipboard.setStringAsync(json).then(() => {
            Alert.alert('Succès', 'Configuration copiée dans le presse-papier.', [
                { text: 'OK' },
                { text: 'Voir le JSON', onPress: () => setConfigModal({ visible: true, mode: 'export', json }) }
            ]);
        }).catch(() => {
            // Fallback to modal if clipboard fails (rare)
            setConfigModal({ visible: true, mode: 'export', json });
        });
    };

    const handleImportConfig = (json: string) => {
        try {
            const data = JSON.parse(json);

            // Validate basic structure?
            if (!data.displayName || !data.colors) throw new Error('Format invalide');

            // Apply updates
            if (data.displayName) setDisplayName(data.displayName);
            if (data.assets?.logoUrl) setLogoUrl(data.assets.logoUrl);

            if (data.colors) {
                if (data.colors.primary) setPrimaryColor(data.colors.primary);
                if (data.colors.background) setBgColor(data.colors.background);
                if (data.colors.headerFooter) setHfColor(data.colors.headerFooter);
            }

            if (data.terminology) {
                if (data.terminology.points) setPointsLabel(data.terminology.points);
                if (data.terminology.rank) setRankLabel(data.terminology.rank);
            }

            if (Array.isArray(data.ranks)) setRanks(data.ranks);
            if (Array.isArray(data.maps)) setMaps(data.maps);
            if (Array.isArray(data.agents)) setAgents(data.agents);
            if (Array.isArray(data.metrics)) setMetrics(data.metrics);

            if (typeof data.hidden === 'boolean') setHidden(data.hidden);

            if (data.api) {
                if (data.api.name) setApiName(data.api.name);
                if (data.api.baseUrl) setApiBaseUrl(data.api.baseUrl);
            }

            if (data.features) setFeatures(data.features);

            Alert.alert('Succès', 'Configuration importée. Cliquez sur Sauvegarder pour appliquer.');
        } catch (e) {
            Alert.alert('Erreur', 'JSON invalide ou incompatible.');
        }
    };

    const FeatureToggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
        <View className="flex-row items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
            <Text className="text-white font-bold">{label}</Text>
            <Switch value={value} onValueChange={onChange} trackColor={{ false: "#374151", true: "#3b82f6" }} thumbColor={"#ffffff"} />
        </View>
    );

    const ColorSelector = ({ label, value, onChange }: { label: string, value: string, onChange: (c: string) => void }) => (
        <TouchableOpacity
            onPress={() => setPickerConfig({ visible: true, color: value, onChange })}
            className="mb-4"
        >
            <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">{label}</Text>
            <View className="flex-row items-center gap-3 bg-gray-800 p-3 rounded-xl border border-gray-700">
                <View className="w-10 h-10 rounded-lg border border-gray-600" style={{ backgroundColor: value }} />
                <Text className="text-white font-mono text-lg">{value}</Text>
            </View>
        </TouchableOpacity>
    );

    if (!config) {
        return (
            <AppContainer safeArea={false}>
                <AppHeader title="Erreur" showBack />
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white">Configuration introuvable.</Text>
                </View>
            </AppContainer>
        );
    }

    const handleSave = async () => {
        await updateGameConfig(gameId, {
            displayName,
            colors: {
                primary: primaryColor,
                background: bgColor,
                headerFooter: hfColor
            },
            terminology: {
                points: pointsLabel,
                rank: rankLabel
            },
            assets: {
                ...config.assets,
                logoUrl
            },
            ranks,
            maps,
            agents,
            metrics,
            hidden,
            api: {
                name: apiName,
                baseUrl: apiBaseUrl
            },
            features
        });
        Alert.alert('Succès', 'Configuration sauvegardée.');
        router.back();
    };

    return (
        <AppContainer safeArea={false}>
            <AppHeader title={`Éditer ${config.displayName}`} showBack />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="px-4 py-4" contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="flex-row gap-4 mb-6">
                        <TouchableOpacity
                            onPress={handleExportConfig}
                            className="flex-1 bg-gray-800 p-3 rounded-xl border border-gray-700 items-center flex-row justify-center gap-2"
                        >
                            <Ionicons name="share-outline" size={20} color="#3b82f6" />
                            <Text className="text-blue-400 font-bold">Exporter Config</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setConfigModal({ visible: true, mode: 'import' })}
                            className="flex-1 bg-gray-800 p-3 rounded-xl border border-gray-700 items-center flex-row justify-center gap-2"
                        >
                            <Ionicons name="download-outline" size={20} color="#3b82f6" />
                            <Text className="text-blue-400 font-bold">Importer Config</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-400 font-bold uppercase mb-4">Général</Text>
                    <AppTextInput label="Nom du Jeu" value={displayName} onChangeText={setDisplayName} />
                    <AppTextInput label="Logo URL" value={logoUrl} onChangeText={setLogoUrl} />

                    <Text className="text-gray-400 font-bold uppercase mb-4 mt-4">Visibilité</Text>
                    <View className="flex-row items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
                        <View>
                            <Text className="text-white font-bold text-base">Cacher le jeu des utilisateurs</Text>
                            <Text className="text-gray-400 text-xs">Si activé, le jeu ne sera visible que pour les admins.</Text>
                        </View>
                        <Switch value={hidden} onValueChange={setHidden} trackColor={{ false: "#374151", true: "#3b82f6" }} thumbColor={"#ffffff"} />
                    </View>

                    <Text className="text-gray-400 font-bold uppercase mb-4">API Configuration</Text>
                    <AppTextInput label="Nom de l'API" value={apiName} onChangeText={setApiName} />
                    <AppTextInput label="Base URL (Optionnel)" value={apiBaseUrl} onChangeText={setApiBaseUrl} />

                    <Text className="text-gray-400 font-bold uppercase mb-4 mt-4">Couleurs</Text>
                    <ColorSelector label="Couleur Primaire (Boutons, Accents)" value={primaryColor} onChange={setPrimaryColor} />
                    <ColorSelector label="Couleur de Fond (Background)" value={bgColor} onChange={setBgColor} />
                    <ColorSelector label="Entête / Pied de page (Barres)" value={hfColor} onChange={setHfColor} />

                    <Text className="text-gray-400 font-bold uppercase mb-4 mt-4">Fonctionnalités Ranked</Text>
                    <View className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
                        <FeatureToggle label="Agent / Champion / Héros" value={features.hasAgent} onChange={v => setFeatures({ ...features, hasAgent: v })} />
                        <FeatureToggle label="Carte / Map" value={features.hasMap} onChange={v => setFeatures({ ...features, hasMap: v })} />
                        <FeatureToggle label="K/D/A (Kills/Deaths/Assists)" value={features.hasKDA} onChange={v => setFeatures({ ...features, hasKDA: v })} />
                        <FeatureToggle label="Score (Buts, Points, etc)" value={features.hasScore} onChange={v => setFeatures({ ...features, hasScore: v })} />
                        <FeatureToggle label="État Mental (Focus, Tilt...)" value={features.hasMental} onChange={v => setFeatures({ ...features, hasMental: v })} />
                        <FeatureToggle label="Niveau de Performance (Smurf, Carry...)" value={features.hasPerformance} onChange={v => setFeatures({ ...features, hasPerformance: v })} />
                    </View>

                    <Text className="text-gray-400 font-bold uppercase mb-4">Terminologie</Text>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <AppTextInput label="Points (ex: LP)" value={pointsLabel} onChangeText={setPointsLabel} />
                        </View>
                        <View className="flex-1">
                            <AppTextInput label="Rang (ex: Rank)" value={rankLabel} onChangeText={setRankLabel} />
                        </View>
                    </View>

                    {/* Content Management Accordions */}
                    <AccordionSection title="Rangs" defaultOpen>
                        <EditableItemList
                            items={ranks}
                            onUpdate={setRanks}
                            placeholder="Nom du rang (ex: Gold, Platinum)"
                        />
                    </AccordionSection>

                    <AccordionSection title="Cartes (Maps)">
                        <EditableItemList
                            items={maps}
                            onUpdate={setMaps}
                            placeholder="Nom de la carte (ex: Summoner's Rift)"
                        />
                    </AccordionSection>

                    <AccordionSection title="Métriques d'Entraînement">
                        <EditableMetricsList
                            items={metrics}
                            onUpdate={setMetrics}
                        />
                    </AccordionSection>

                    <AccordionSection title="Agents / Héros">
                        <EditableItemList
                            items={agents}
                            onUpdate={setAgents}
                            placeholder="Nom de l'agent (ex: Jett, Yasuo)"
                        />
                    </AccordionSection>

                    <View className="h-20" />
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="p-4 border-t border-gray-800 bg-gray-900 absolute bottom-0 left-0 right-0">
                <AppButton title="Sauvegarder" onPress={handleSave} />
            </View>

            <ColorPickerModal
                visible={pickerConfig.visible}
                initialColor={pickerConfig.color}
                onClose={() => setPickerConfig(prev => ({ ...prev, visible: false }))}
                onSelect={(c) => pickerConfig.onChange(c)}
            />

            <FullConfigModal
                visible={configModal.visible}
                mode={configModal.mode}
                configJson={configModal.json}
                onClose={() => setConfigModal(p => ({ ...p, visible: false }))}
                onImport={handleImportConfig}
            />
        </AppContainer>
    );
}
