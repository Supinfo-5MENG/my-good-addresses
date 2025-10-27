import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { COLORS, MAP_CONFIG } from '../../constants';
import { Address } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

let MapComponent: any;

if (Platform.OS === 'web') {
    MapComponent = require('./WebMap').default;
} else {
    MapComponent = require('./MobileMap').default;
}

interface AddressMapProps {
    addresses: Address[];
    onMarkerPress?: (address: Address) => void;
    onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
    showUserLocation?: boolean;
    selectedAddress?: Address | null;
}

export const AddressMap: React.FC<AddressMapProps> = ({
                                                          addresses,
                                                          onMarkerPress,
                                                          onMapPress,
                                                          showUserLocation = true,
                                                          selectedAddress,
                                                      }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState({
        latitude: MAP_CONFIG.DEFAULT_LATITUDE,
        longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
        latitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
        longitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
    });
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    useEffect(() => {
        getCurrentLocation();
    }, [user]);

    useEffect(() => {
        if (addresses.length > 0 && addresses[0].location) {
            setRegion({
                latitude: addresses[0].location.latitude,
                longitude: addresses[0].location.longitude,
                latitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
                longitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
            });
            setLoading(false);
        } else if (userLocation) {
            setRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
                longitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
            });
            setLoading(false);
        }
    }, [addresses, userLocation]);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission refusée',
                    'La permission de localisation est nécessaire pour centrer la carte sur votre position.'
                );
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
                longitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
            };

            setRegion(newRegion);
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        } catch (error) {
            console.error('Erreur de localisation:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMarkerColor = (address: Address) => {
        if (address.userId === user?.id) {
            return COLORS.markerMine;
        }
        return address.isPublic ? COLORS.markerPublic : COLORS.markerPrivate;
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const mapData = {
        region,
        userLocation,
        addresses: addresses.map(addr => ({
            ...addr,
            color: getMarkerColor(addr),
        })),
        selectedAddress,
    };

    return (
        <View style={[styles.container]}>
            <MapComponent
                data={mapData}
                onMarkerPress={onMarkerPress}
                onMapPress={onMapPress}
                showUserLocation={showUserLocation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 8,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
});