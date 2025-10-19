import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {Alert} from 'react-native';

/**
 * Demande la permission de localisation
 * @returns true si accordée, false sinon
 */
export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission refusée',
                'La permission de localisation est nécessaire pour afficher la carte et vos adresses.',
                [{ text: 'OK' }]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la demande de permission de localisation:', error);
        return false;
    }
};

/**
 * Obtient la localisation actuelle de l'utilisateur
 * @returns Les coordonnées ou null
 */
export const getCurrentLocation = async (): Promise<Location.LocationObjectCoords | null> => {
    try {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            return null;
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        return location.coords;
    } catch (error) {
        console.error('Erreur lors de la récupération de la localisation:', error);
        Alert.alert(
            'Erreur',
            'Impossible de récupérer votre localisation. Veuillez vérifier vos paramètres.',
            [{ text: 'OK' }]
        );
        return null;
    }
};

/**
 * Demande la permission de la caméra
 * @returns true si accordée, false sinon
 */
export const requestCameraPermission = async (): Promise<boolean> => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission refusée',
                'La permission de la caméra est nécessaire pour prendre des photos.',
                [{ text: 'OK' }]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la demande de permission de caméra:', error);
        return false;
    }
};

/**
 * Demande la permission d'accès à la galerie photos
 * @returns true si accordée, false sinon
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission refusée',
                'La permission d\'accès aux photos est nécessaire pour sélectionner des images.',
                [{ text: 'OK' }]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la demande de permission de galerie:', error);
        return false;
    }
};

/**
 * Ouvre la caméra pour prendre une photo
 * @returns L'URI de la photo ou null
 */
export const takePicture = async (): Promise<string | null> => {
    try {
        const hasPermission = await requestCameraPermission();

        if (!hasPermission) {
            return null;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            return result.assets[0].uri;
        }

        return null;
    } catch (error) {
        console.error('Erreur lors de la prise de photo:', error);
        Alert.alert('Erreur', 'Impossible de prendre la photo.', [{ text: 'OK' }]);
        return null;
    }
};

/**
 * Ouvre la galerie pour sélectionner une photo
 * @returns L'URI de la photo ou null
 */
export const pickImage = async (): Promise<string | null> => {
    try {
        const hasPermission = await requestMediaLibraryPermission();

        if (!hasPermission) {
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            return result.assets[0].uri;
        }

        return null;
    } catch (error) {
        console.error('Erreur lors de la sélection de photo:', error);
        Alert.alert('Erreur', 'Impossible de sélectionner la photo.', [{ text: 'OK' }]);
        return null;
    }
};

/**
 * Affiche un menu pour choisir entre caméra et galerie
 * @returns L'URI de la photo ou null
 */
export const selectImageSource = async (): Promise<string | null> => {
    return new Promise((resolve) => {
        Alert.alert(
            'Choisir une photo',
            'Sélectionnez la source de votre image',
            [
                {
                    text: 'Caméra',
                    onPress: async () => {
                        const uri = await takePicture();
                        resolve(uri);
                    },
                },
                {
                    text: 'Galerie',
                    onPress: async () => {
                        const uri = await pickImage();
                        resolve(uri);
                    },
                },
                {
                    text: 'Annuler',
                    style: 'cancel',
                    onPress: () => resolve(null),
                },
            ],
            { cancelable: true }
        );
    });
};