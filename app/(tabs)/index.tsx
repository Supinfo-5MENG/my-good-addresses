import { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AddressMap } from '../../components/map/AddressMap';
import { Address } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../constants';
import {
    getUserAddresses,
    getPublicAddresses,
    subscribeToUserAddresses,
    subscribeToPublicAddresses,
} from '../../services/firebase/addressService';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showPublic, setShowPublic] = useState(true);
    const [showPrivate, setShowPrivate] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        let unsubscribeUser: (() => void) | undefined;
        let unsubscribePublic: (() => void) | undefined;

        const loadAddresses = async () => {
            try {
                unsubscribeUser = subscribeToUserAddresses(user.id, (userAddresses) => {
                    updateAddresses(userAddresses, 'user');
                })
                unsubscribePublic = subscribeToPublicAddresses((publicAddresses) => {
                    updateAddresses(publicAddresses, 'public');
                });

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des adresses:', error);
                Alert.alert('Erreur', 'Impossible de charger les adresses');
                setLoading(false);
            }
        };

        let allUserAddresses: Address[] = [];
        let allPublicAddresses: Address[] = [];

        const updateAddresses = (newAddresses: Address[], type: 'user' | 'public') => {
            if (type === 'user') {
                allUserAddresses = newAddresses;
            } else {
                allPublicAddresses = newAddresses.filter(addr => addr.userId !== user.id);
            }

            let combined: Address[] = [];
            
            if (showPrivate) {
                combined = [...allUserAddresses.filter(addr => !addr.isPublic)];
            }
            
            if (showPublic) {
                combined = [
                    ...combined,
                    ...allUserAddresses.filter(addr => addr.isPublic),
                    ...allPublicAddresses,
                ];
            }

            setAddresses(combined);
        };

        loadAddresses();

        return () => {
            unsubscribeUser?.();
            unsubscribePublic?.();
        };
    }, [user, showPublic, showPrivate]);

    const handleMarkerPress = (address: Address) => {
        router.push({
            pathname: '/address/[id]',
            params: { id: address.id },
        });
    };

    const handleAddAddress = () => {
        router.push('/address/create');
    };

    const togglePublic = () => {
        setShowPublic(!showPublic);
    };

    const togglePrivate = () => {
        setShowPrivate(!showPrivate);
    };

    return (
        <View style={styles.container}>
            <AddressMap
                addresses={addresses}
                onMarkerPress={handleMarkerPress}
                showUserLocation={true}
            />

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        showPublic && styles.filterButtonActive,
                    ]}
                    onPress={togglePublic}
                >
                    <Text
                        style={[
                            styles.filterText,
                            showPublic && styles.filterTextActive,
                        ]}
                    >
                        Publiques
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        showPrivate && styles.filterButtonActive,
                    ]}
                    onPress={togglePrivate}
                >
                    <Text
                        style={[
                            styles.filterText,
                            showPrivate && styles.filterTextActive,
                        ]}
                    >
                        Privées
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAddress}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        gap: 10,
    },
    filterButton: {
        backgroundColor: COLORS.background,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: SIZES.fontSm,
        color: COLORS.text,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#fff',
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
});
