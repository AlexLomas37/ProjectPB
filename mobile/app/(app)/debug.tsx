import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { DataService } from '@/src/shared/api/data';
import { AppContainer, AppHeader, AppButton, AppCard } from '@/src/shared/ui';

export default function DebugScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleExport = async () => {
        try {
            setLoading(true);
            setStatus('Génération des données...');

            const json = await DataService.exportData();
            const fileName = `bmad_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

            if (Platform.OS === 'android') {
                try {
                    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                    if (permissions.granted) {
                        const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/json');
                        await FileSystem.writeAsStringAsync(uri, json, { encoding: 'utf8' });
                        Alert.alert('Succès', 'Fichier sauvegardé avec succès');
                    } else {
                        throw new Error('Permission refusée');
                    }
                } catch (e) {
                    // Fallback to simpler method if SAF fails or provided
                    const filePath = `${FileSystem.cacheDirectory}${fileName}`;
                    await FileSystem.writeAsStringAsync(filePath, json, { encoding: 'utf8' });
                    await Sharing.shareAsync(filePath);
                }
            } else {
                const filePath = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}${fileName}`;
                await FileSystem.writeAsStringAsync(filePath, json, { encoding: 'utf8' });
                await Sharing.shareAsync(filePath);
            }

            setStatus('Export terminé');
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', "L'export a échoué");
            setStatus('Erreur export');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', '*/*'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            setLoading(true);
            setStatus('Import en cours...');

            const fileUri = result.assets[0].uri;
            const jsonContent = await FileSystem.readAsStringAsync(fileUri);

            await DataService.importData(jsonContent);

            Alert.alert(
                'Import Réussi',
                'Les données ont été importées. Veuillez redémarrer l\'application pour voir les changements.',
                [{ text: 'OK' }]
            );
            setStatus('Import terminé');
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', "L'import a échoué. Vérifiez le format du fichier.");
            setStatus('Erreur import');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        Alert.alert(
            'Attention',
            'Voulez-vous vraiment supprimer TOUTES les données (entraînements, ranked, vods) ? Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Tout Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await DataService.clearAllData();
                            Alert.alert('Succès', 'Toutes les données ont été supprimées. Redémarrez l\'application.');
                        } catch (e) {
                            Alert.alert('Erreur', 'Impossible de supprimer les données');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <AppContainer safeArea={false}>
            <AppHeader title="Debug / Admin" showBack />

            <ScrollView className="p-6">
                <Text className="text-gray-400 mb-6 text-center italic">
                    Zone réservée à l'administration des données. C'est ici que tu peux casser l'appli si tu veux.
                </Text>

                <View className="gap-4">
                    <AppCard className="mb-4">
                        <Text className="text-white font-bold mb-2 text-lg">Gestion de l'Application</Text>
                        <Text className="text-gray-400 text-sm mb-4">Accéder aux outils d'administration (Entraînements, Métriques, etc).</Text>
                        <AppButton
                            title="Gérer les Entraînements"
                            onPress={() => router.push('/(app)/admin/training')}
                            variant="primary"
                            icon={<Text>🛠️</Text>}
                        />
                    </AppCard>

                    <AppCard className="mb-4">
                        <Text className="text-white font-bold mb-2 text-lg">Export de Données</Text>
                        <Text className="text-gray-400 text-sm mb-4">Sauvegarder toutes les données locales dans un fichier JSON.</Text>
                        <AppButton
                            title="Exporter les données"
                            onPress={handleExport}
                            disabled={loading}
                            icon={<Text>📤</Text>}
                        />
                    </AppCard>

                    <AppCard className="mb-4">
                        <Text className="text-white font-bold mb-2 text-lg">Import de Données</Text>
                        <Text className="text-gray-400 text-sm mb-4">Restaurer des données depuis un fichier JSON. Écrase les données actuelles !</Text>
                        <AppButton
                            title="Importer les données"
                            onPress={handleImport}
                            variant="secondary"
                            disabled={loading}
                            icon={<Text>📥</Text>}
                        />
                    </AppCard>

                    <AppCard className="border border-red-900/50 bg-red-900/10">
                        <Text className="text-red-400 font-bold mb-2 text-lg">Danger Zone</Text>
                        <Text className="text-red-300/70 text-sm mb-4">Supprimer définitivement toutes les données de l'application.</Text>
                        <AppButton
                            title="Supprimer TOUT"
                            onPress={handleClear}
                            variant="danger"
                            disabled={loading}
                            icon={<Text>🗑️</Text>}
                        />
                    </AppCard>

                    {loading && (
                        <View className="mt-4">
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text className="text-white text-center mt-2">{status}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </AppContainer>
    );
}
