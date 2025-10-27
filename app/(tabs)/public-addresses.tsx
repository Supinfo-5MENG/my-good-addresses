import {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Address} from '../../types';
import {useAuth} from '../../contexts/AuthContext';
import {COLORS, SIZES} from '../../constants';
import {getPublicAddresses, subscribeToPublicAddresses,} from '../../services/firebase/addressService';
import {Ionicons} from '@expo/vector-icons';
import {AddressMap} from "../../components/map/AddressMap";

export default function PublicAddressesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (!user) {
            router.replace('/login');
            return;
        }

        const unsubscribe = subscribeToPublicAddresses((publicAddresses) => {
            const otherUsersAddresses = publicAddresses
            setAddresses(otherUsersAddresses);
            setFilteredAddresses(otherUsersAddresses);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const filtered = addresses.filter(
                addr =>
                    addr.name.toLowerCase().includes(query) ||
                    addr.description?.toLowerCase().includes(query)
            );
            setFilteredAddresses(filtered);
        } else {
            setFilteredAddresses(addresses);
        }
    }, [searchQuery, addresses]);

    const onRefresh = async () => {
        if (!user) return;
        
        setRefreshing(true);
        try {
            const data = await getPublicAddresses();
            const otherUsersAddresses = data.filter(addr => addr.userId !== user.id);
            setAddresses(otherUsersAddresses);
            setFilteredAddresses(otherUsersAddresses);
        } catch (error) {
            console.error('Erreur lors du rafraîchissement:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleAddressPress = (addressId: string) => {
        router.push({
            pathname: '/address/[id]',
            params: { id: addressId },
        });
    };

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (showSearch) {
            setSearchQuery('');
        }
    };

    const renderAddress = ({ item }: { item: Address }) => (
        <TouchableOpacity
            style={styles.addressCard}
            onPress={() => handleAddressPress(item.id)}
            activeOpacity={0.8}
        >
            {/* Carte au lieu de l'image */}
            <View style={styles.mapPreview}>
                <AddressMap
                    addresses={[item]}
                    showUserLocation={false}
                    onMarkerPress={() => handleAddressPress(item.id)}
                    selectedAddress={item}
                />
            </View>

            <View style={styles.addressContent}>
                <Text style={styles.addressName} numberOfLines={1}>
                    {item.name}
                </Text>

                {item.description && (
                    <Text style={styles.addressDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.addressFooter}>
                    <View style={styles.badge}>
                        <Ionicons name="earth" size={14} color={COLORS.success} />
                        <Text style={styles.badgeText}>Publique</Text>
                    </View>
                    <Text style={styles.addressDate}>
                        {item.createdAt.toLocaleDateString('fr-FR')}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="compass-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>
                {searchQuery ? 'Aucun résultat' : 'Aucune adresse publique'}
            </Text>
            <Text style={styles.emptyText}>
                {searchQuery
                    ? `Aucune adresse ne correspond à "${searchQuery}"`
                    : "Il n'y a pas encore d'adresse publique partagée par la communauté"}
            </Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{addresses.length}</Text>
                    <Text style={styles.statLabel}>Adresses</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {new Set(addresses.map(a => a.userId)).size}
                    </Text>
                    <Text style={styles.statLabel}>Contributeurs</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Adresses de la communauté</Text>
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
                <Text style={styles.title}>Découvrir</Text>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={toggleSearch}
                >
                    <Ionicons
                        name={showSearch ? 'close' : 'search'}
                        size={24}
                        color={COLORS.text}
                    />
                </TouchableOpacity>
            </View>

            {showSearch && (
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une adresse..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <FlatList
                data={filteredAddresses}
                renderItem={renderAddress}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={!searchQuery ? renderHeader : null}
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
    mapPreview: {
        width: '100%',
        height: 180,
        overflow: 'hidden',
        borderTopLeftRadius: SIZES.radiusMd,
        borderTopRightRadius: SIZES.radiusMd,
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
    searchButton: {
        padding: SIZES.xs,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.md,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
    },
    searchInput: {
        flex: 1,
        marginLeft: SIZES.sm,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
    },
    headerSection: {
        marginBottom: SIZES.lg,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: SIZES.md,
        marginBottom: SIZES.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
        padding: SIZES.md,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.fontXl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: SIZES.xs,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.sm,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.xl,
    },
    addressCard: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusMd,
        marginBottom: SIZES.md,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    addressImage: {
        width: '100%',
        height: 200,
    },
    imagePlaceholder: {
        backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressContent: {
        padding: SIZES.md,
    },
    addressName: {
        fontSize: SIZES.fontLg,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.xs,
    },
    addressDescription: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginBottom: SIZES.sm,
        lineHeight: 20,
    },
    addressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    badgeText: {
        marginLeft: SIZES.xs,
        fontSize: SIZES.fontXs,
        color: COLORS.text,
        fontWeight: '600',
    },
    addressDate: {
        fontSize: SIZES.fontXs,
        color: COLORS.textTertiary,
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
        paddingHorizontal: SIZES.xl,
    },
});
