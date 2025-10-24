import { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Address } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES, MESSAGES } from '../../constants';
import {
    getUserAddresses,
    deleteAddress,
    subscribeToUserAddresses,
} from '../../services/firebase/addressService';
import { Ionicons } from '@expo/vector-icons';

export default function MyAddressesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

    useEffect(() => {
        if (!user) {
            router.replace('/login');
            return;
        }
        console.log("Fetching addresses for user:", user.id);
        const unsubscribe = subscribeToUserAddresses(user.id, (updatedAddresses) => {
            setAddresses(updatedAddresses);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    const onRefresh = async () => {
        if (!user) return;
        
        setRefreshing(true);
        try {
            const data = await getUserAddresses(user.id);
            setAddresses(data);
        } catch (error) {
            console.error('Erreur lors du rafraîchissement:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleDeleteAddress = (addressId: string) => {
        Alert.alert(
            'Confirmation',
            MESSAGES.ADDRESS.DELETE_CONFIRM,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAddress(addressId);
                            Alert.alert('Succès', MESSAGES.ADDRESS.DELETE_SUCCESS);
                        } catch (error) {
                            console.error('Erreur lors de la suppression:', error);
                            Alert.alert('Erreur', 'Impossible de supprimer l\'adresse');
                        }
                    },
                },
            ]
        );
    };

    const handleAddressPress = (addressId: string) => {
        router.push({
            pathname: '/address/[id]',
            params: { id: addressId },
        });
    };

    const handleCreateAddress = () => {
        router.push('/address/create');
    };

    const filteredAddresses = addresses.filter(addr => {
        if (filter === 'all') return true;
        if (filter === 'public') return addr.isPublic;
        if (filter === 'private') return !addr.isPublic;
        return true;
    });

    const renderAddress = ({ item }: { item: Address }) => (
        <TouchableOpacity
            style={styles.addressCard}
            onPress={() => handleAddressPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.addressContent}>
                {item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={styles.addressImage} />
                ) : (
                    <View style={[styles.addressImage, styles.imagePlaceholder]}>
                        <Ionicons name="location" size={30} color={COLORS.textSecondary} />
                    </View>
                )}
                
                <View style={styles.addressInfo}>
                    <View style={styles.addressHeader}>
                        <Text style={styles.addressName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Ionicons
                            name={item.isPublic ? 'earth' : 'lock-closed'}
                            size={16}
                            color={item.isPublic ? COLORS.success : COLORS.textSecondary}
                        />
                    </View>
                    
                    {item.description && (
                        <Text style={styles.addressDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    
                    <Text style={styles.addressDate}>
                        Ajoutée le {item.createdAt.toLocaleDateString('fr-FR')}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAddress(item.id)}
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>Aucune adresse</Text>
            <Text style={styles.emptyText}>
                {filter === 'all'
                    ? "Vous n'avez pas encore ajouté d'adresse"
                    : filter === 'public'
                    ? "Vous n'avez pas d'adresse publique"
                    : "Vous n'avez pas d'adresse privée"}
            </Text>
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateAddress}
            >
                <Text style={styles.emptyButtonText}>Ajouter une adresse</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Adresses</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateAddress}
                >
                    <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.filters}>
                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        filter === 'all' && styles.filterChipActive,
                    ]}
                    onPress={() => setFilter('all')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filter === 'all' && styles.filterTextActive,
                        ]}
                    >
                        Toutes ({addresses.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        filter === 'public' && styles.filterChipActive,
                    ]}
                    onPress={() => setFilter('public')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filter === 'public' && styles.filterTextActive,
                        ]}
                    >
                        Publiques ({addresses.filter(a => a.isPublic).length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        filter === 'private' && styles.filterChipActive,
                    ]}
                    onPress={() => setFilter('private')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filter === 'private' && styles.filterTextActive,
                        ]}
                    >
                        Privées ({addresses.filter(a => !a.isPublic).length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredAddresses}
                renderItem={renderAddress}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.md,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addButton: {
        padding: SIZES.xs,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.md,
        gap: SIZES.sm,
    },
    filterChip: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: {
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
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.xl,
    },
    addressCard: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusMd,
        marginBottom: SIZES.md,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    addressContent: {
        flexDirection: 'row',
        padding: SIZES.md,
        alignItems: 'center',
    },
    addressImage: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radiusMd,
        marginRight: SIZES.md,
    },
    imagePlaceholder: {
        backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressInfo: {
        flex: 1,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.xs,
    },
    addressName: {
        fontSize: SIZES.fontMd,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        marginRight: SIZES.sm,
    },
    addressDescription: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginBottom: SIZES.xs,
        lineHeight: 18,
    },
    addressDate: {
        fontSize: SIZES.fontXs,
        color: COLORS.textTertiary,
    },
    deleteButton: {
        padding: SIZES.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.xxl * 2,
    },
    emptyTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SIZES.lg,
        marginBottom: SIZES.sm,
    },
    emptyText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SIZES.lg,
    },
    emptyButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusFull,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: SIZES.fontMd,
    },
});
