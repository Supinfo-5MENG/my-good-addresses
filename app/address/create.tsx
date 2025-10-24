import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, MAP_CONFIG, MESSAGES } from '../../constants';
import { Button } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { createAddress, updateAddress } from '../../services/firebase/addressService';
import { CreateAddressInput, Address } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { selectImageSource } from '../../utils/permissions';
import { AddressMap } from '../../components/map/AddressMap';

export default function CreateAddressScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);

    const [selectedLocation, setSelectedLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [region, setRegion] = useState({
        latitude: MAP_CONFIG.DEFAULT_LATITUDE,
        longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
        latitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
        longitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
    });

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission refusée',
                    'La permission de localisation est nécessaire pour ajouter une adresse.'
                );
                setMapLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setRegion(newRegion);
            setSelectedLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        } catch (error) {
            console.error('Erreur de localisation:', error);
        } finally {
            setMapLoading(false);
        }
    };

    const handleMapPress = (coord: { latitude: number; longitude: number }) => {
        setSelectedLocation(coord);
    };

    const handleSelectImage = async () => {
        const uri = await selectImageSource();
        if (uri) setPhotoUri(uri);
    };

    const handleRemoveImage = () => setPhotoUri(null);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', MESSAGES.ADDRESS.NAME_REQUIRED);
            return;
        }
        if (!selectedLocation) {
            Alert.alert('Erreur', MESSAGES.ADDRESS.LOCATION_REQUIRED);
            return;
        }
        if (!user) {
            Alert.alert('Erreur', 'Vous devez être connecté');
            return;
        }

        try {
            setLoading(true);

            const addressInput: CreateAddressInput = {
                name: name.trim(),
                description: description.trim(),
                location: selectedLocation,
                isPublic,
            };

            const addressId = await createAddress(user.id, addressInput);

            if (photoUri) {
                // const photoURL = await uploadAddressPhoto(addressId, photoUri);
                // await updateAddress(addressId, { photoURL });
            }

            Alert.alert('Succès', MESSAGES.ADDRESS.CREATE_SUCCESS);
            router.back();
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            Alert.alert('Erreur', "Impossible de créer l'adresse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Nouvelle Adresse</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Carte avec AddressMap */}
                <View style={styles.mapContainer}>
                    <Text style={styles.label}>📍 Position sur la carte</Text>
                    <Text style={styles.hint}>Appuyez sur la carte pour sélectionner la position</Text>

                    {mapLoading ? (
                        <View style={styles.mapLoading}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <View style={styles.map}>
                            <AddressMap
                                addresses={
                                    selectedLocation
                                        ? [{
                                            id: 'temp',
                                            name: 'Nouvelle adresse',
                                            description: 'Emplacement choisi',
                                            location: selectedLocation,
                                            isPublic: false,
                                            userId: user?.id ?? 'unknown',
                                        } as Address]
                                        : []
                                }
                                onMapPress={handleMapPress}
                                showUserLocation={true}
                                height={200}
                            />
                        </View>
                    )}
                </View>

                {/* Nom de l'adresse */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nom de l'adresse *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Mon restaurant préféré"
                        placeholderTextColor={COLORS.textSecondary}
                        value={name}
                        onChangeText={setName}
                        maxLength={50}
                    />
                    <Text style={styles.charCount}>{name.length}/50</Text>
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Décrivez cette adresse..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={200}
                    />
                    <Text style={styles.charCount}>{description.length}/200</Text>
                </View>

                {/* Photo */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Photo</Text>
                    {photoUri ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: photoUri }} style={styles.image} />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={handleRemoveImage}
                            >
                                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addPhotoButton}
                            onPress={handleSelectImage}
                        >
                            <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.addPhotoText}>Ajouter une photo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Switch publique */}
                <View style={styles.switchContainer}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.label}>Adresse publique</Text>
                        <Text style={styles.switchDescription}>
                            Les adresses publiques sont visibles par tous les utilisateurs
                        </Text>
                    </View>
                    <Switch
                        value={isPublic}
                        onValueChange={setIsPublic}
                        trackColor={{ false: COLORS.border, true: COLORS.primary }}
                        thumbColor="#fff"
                    />
                </View>

                {/* Boutons */}
                <View style={styles.buttons}>
                    <Button
                        title="Annuler"
                        onPress={() => router.back()}
                        variant="outline"
                        style={styles.button}
                    />
                    <Button
                        title="Créer"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading || !name.trim() || !selectedLocation}
                        style={styles.button}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : SIZES.lg,
    },
    title: {
        fontSize: SIZES.fontLg,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    mapContainer: {
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    map: {
        height: 200,
        borderRadius: SIZES.radiusMd,
        marginTop: SIZES.sm,
    },
    mapLoading: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: SIZES.radiusMd,
        marginTop: SIZES.sm,
    },
    inputContainer: {
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    label: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.sm,
    },
    hint: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginBottom: SIZES.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.md,
        fontSize: SIZES.fontMd,
        backgroundColor: COLORS.background,
        color: COLORS.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        textAlign: 'right',
        marginTop: SIZES.xs,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: SIZES.radiusMd,
    },
    removeImageButton: {
        position: 'absolute',
        top: SIZES.sm,
        right: SIZES.sm,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusFull,
        padding: 4,
    },
    addPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: SIZES.radiusMd,
        padding: SIZES.lg,
        backgroundColor: COLORS.backgroundSecondary,
    },
    addPhotoText: {
        marginLeft: SIZES.sm,
        fontSize: SIZES.fontMd,
        color: COLORS.primary,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.xl,
        paddingVertical: SIZES.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    switchInfo: {
        flex: 1,
        marginRight: SIZES.md,
    },
    switchDescription: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: SIZES.xs,
    },
    buttons: {
        flexDirection: 'row',
        marginHorizontal: SIZES.lg,
        gap: SIZES.md,
    },
    button: {
        flex: 1,
    },
});