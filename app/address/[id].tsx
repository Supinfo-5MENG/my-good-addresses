import {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {COLORS, MESSAGES, SIZES} from '../../constants';
import {Address, Comment} from '../../types';
import {useAuth} from '../../contexts/AuthContext';
import {deleteAddress, getAddress,} from '../../services/firebase/addressService';
import {createComment, deleteComment, subscribeToAddressComments,} from '../../services/firebase/commentService';
import {Ionicons} from '@expo/vector-icons';
import {Button} from '../../components/common';
import {pickImage} from '../../utils/permissions';
import {AddressMap} from '../../components/map/AddressMap';
import {convertMultipleImagesToBase64} from '../../services/imageService';

export default function AddressDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const [address, setAddress] = useState<Address | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    const [commentText, setCommentText] = useState('');
    const [commentPhotoUris, setCommentPhotoUris] = useState<string[]>([]);
    const [commentPhotosBase64, setCommentPhotosBase64] = useState<string[]>([]);
    const [showCommentForm, setShowCommentForm] = useState(false);

    useEffect(() => {
        if (!id || typeof id !== 'string') {
            Alert.alert('Erreur', 'Adresse non trouvée');
            router.back();
            return;
        }

        loadAddressData();

        const unsubscribe = subscribeToAddressComments(id, (updatedComments) => {
            setComments(updatedComments);
        });

        return () => {
            unsubscribe();
        };
    }, [id]);

    const loadAddressData = async () => {
        try {
            setLoading(true);

            if (typeof id !== 'string') return;

            const addressData = await getAddress(id);
            if (!addressData) {
                Alert.alert('Erreur', 'Adresse non trouvée');
                router.back();
                return;
            }
            setAddress(addressData);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            Alert.alert('Erreur', 'Impossible de charger l\'adresse');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = () => {
        if (!address || !user || address.userId !== user.id) return;

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
                            await deleteAddress(address.id);
                            Alert.alert('Succès', MESSAGES.ADDRESS.DELETE_SUCCESS);
                            router.back();
                        } catch (error) {
                            console.error('Erreur lors de la suppression:', error);
                            Alert.alert('Erreur', 'Impossible de supprimer l\'adresse');
                        }
                    },
                },
            ]
        );
    };

    const handleAddCommentPhoto = async () => {
        if (commentPhotoUris.length >= 3) {
            Alert.alert('Limite atteinte', 'Vous ne pouvez ajouter que 3 photos maximum');
            return;
        }

        try {
            const uri = await pickImage();
            if (uri) {
                setUploadingPhotos(true);

                // Convertir immédiatement en base64
                const base64Images = await convertMultipleImagesToBase64([uri], 400, 0.6);

                setCommentPhotoUris([...commentPhotoUris, uri]);
                setCommentPhotosBase64([...commentPhotosBase64, base64Images[0]]);

                setUploadingPhotos(false);
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la photo:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter la photo');
            setUploadingPhotos(false);
        }
    };

    const handleRemoveCommentPhoto = (index: number) => {
        setCommentPhotoUris(commentPhotoUris.filter((_, i) => i !== index));
        setCommentPhotosBase64(commentPhotosBase64.filter((_, i) => i !== index));
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) {
            Alert.alert('Erreur', MESSAGES.COMMENT.TEXT_REQUIRED);
            return;
        }

        if (!user || !address) return;

        try {
            setSubmittingComment(true);

            await createComment(
                user.id,
                user.displayName,
                user.photoURL,
                {
                    addressId: address.id,
                    text: commentText.trim(),
                    photos: commentPhotosBase64, // Envoyer directement les photos en base64
                }
            );

            Alert.alert('Succès', MESSAGES.COMMENT.CREATE_SUCCESS);
            setCommentText('');
            setCommentPhotoUris([]);
            setCommentPhotosBase64([]);
            setShowCommentForm(false);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        Alert.alert(
            'Confirmation',
            'Êtes-vous sûr de vouloir supprimer ce commentaire ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteComment(commentId);
                            Alert.alert('Succès', MESSAGES.COMMENT.DELETE_SUCCESS);
                        } catch (error) {
                            console.error('Erreur lors de la suppression:', error);
                            Alert.alert('Erreur', 'Impossible de supprimer le commentaire');
                        }
                    },
                },
            ]
        );
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                {item.userPhotoURL ? (
                    <Image
                        source={{ uri: item.userPhotoURL }}
                        style={styles.commentAvatar}
                    />
                ) : (
                    <View style={[styles.commentAvatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                            {item.userDisplayName?.[0]?.toUpperCase() || '?'}
                        </Text>
                    </View>
                )}
                <View style={styles.commentInfo}>
                    <Text style={styles.commentAuthor}>{item.userDisplayName}</Text>
                    <Text style={styles.commentDate}>
                        {item.createdAt?.toLocaleDateString('fr-FR')}
                    </Text>
                </View>
                {user?.id === item.userId && (
                    <TouchableOpacity
                        onPress={() => handleDeleteComment(item.id)}
                        style={styles.deleteButton}
                    >
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.commentText}>{item.text}</Text>
            {item.photos && item.photos.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.commentPhotosContainer}
                >
                    {item.photos.map((photo, index) => (
                        <TouchableOpacity key={index} activeOpacity={0.9}>
                            <Image
                                source={{ uri: photo }}
                                style={styles.commentPhoto}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!address) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Adresse non trouvée</Text>
                <Button title="Retour" onPress={() => router.back()} />
            </View>
        );
    }

    const isOwner = user?.id === address.userId;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title} numberOfLines={1}>
                        {address.name}
                    </Text>
                    {isOwner && (
                        <TouchableOpacity onPress={handleDeleteAddress}>
                            <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                        </TouchableOpacity>
                    )}
                </View>

                {address.photoURL && (
                    <Image source={{ uri: address.photoURL }} style={styles.addressImage} />
                )}

                <View style={styles.mapContainer}>
                    <AddressMap
                        addresses={[
                            {
                                ...address,
                                color: isOwner
                                    ? COLORS.markerMine
                                    : address.isPublic
                                        ? COLORS.markerPublic
                                        : COLORS.markerPrivate,
                            },
                        ]}
                        showUserLocation={false}
                        onMarkerPress={() => {}}
                        height={200}
                    />
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.badge}>
                        <Ionicons
                            name={address.isPublic ? 'earth' : 'lock-closed'}
                            size={16}
                            color={address.isPublic ? COLORS.success : COLORS.textSecondary}
                        />
                        <Text style={styles.badgeText}>
                            {address.isPublic ? 'Publique' : 'Privée'}
                        </Text>
                    </View>

                    {address.description && (
                        <Text style={styles.description}>{address.description}</Text>
                    )}

                    <Text style={styles.coordinates}>
                        📍 {address.location.latitude.toFixed(6)}, {address.location.longitude.toFixed(6)}
                    </Text>
                </View>

                <View style={styles.commentsSection}>
                    <View style={styles.commentsSectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Commentaires ({comments.length})
                        </Text>
                        {!showCommentForm && (
                            <TouchableOpacity
                                onPress={() => setShowCommentForm(true)}
                                style={styles.addCommentButton}
                            >
                                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {showCommentForm && (
                        <View style={styles.commentForm}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Écrire un commentaire..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                numberOfLines={3}
                                maxLength={300}
                            />

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.commentPhotosPreview}
                            >
                                {commentPhotosBase64.map((photo, index) => (
                                    <View key={index} style={styles.photoPreview}>
                                        <Image source={{ uri: photo }} style={styles.photoPreviewImage} />
                                        <TouchableOpacity
                                            style={styles.removePhotoButton}
                                            onPress={() => handleRemoveCommentPhoto(index)}
                                        >
                                            <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {commentPhotosBase64.length < 3 && (
                                    <TouchableOpacity
                                        style={styles.addPhotoButton}
                                        onPress={handleAddCommentPhoto}
                                        disabled={uploadingPhotos}
                                    >
                                        {uploadingPhotos ? (
                                            <ActivityIndicator size="small" color={COLORS.primary} />
                                        ) : (
                                            <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                )}
                            </ScrollView>

                            <View style={styles.commentFormButtons}>
                                <Button
                                    title="Annuler"
                                    onPress={() => {
                                        setShowCommentForm(false);
                                        setCommentText('');
                                        setCommentPhotoUris([]);
                                        setCommentPhotosBase64([]);
                                    }}
                                    variant="outline"
                                    size="small"
                                    style={styles.commentFormButton}
                                />
                                <Button
                                    title="Publier"
                                    onPress={handleSubmitComment}
                                    loading={submittingComment}
                                    disabled={!commentText.trim() || submittingComment || uploadingPhotos}
                                    size="small"
                                    style={styles.commentFormButton}
                                />
                            </View>
                        </View>
                    )}

                    {comments.length > 0 ? (
                        <FlatList
                            data={comments}
                            renderItem={renderComment}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    ) : (
                        <Text style={styles.noComments}>Aucun commentaire pour le moment</Text>
                    )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.lg,
    },
    errorText: {
        fontSize: SIZES.fontLg,
        color: COLORS.textSecondary,
        marginBottom: SIZES.lg,
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
        flex: 1,
        marginHorizontal: SIZES.md,
    },
    addressImage: {
        width: '100%',
        height: 250,
    },
    mapContainer: {
        height: 200,
        margin: SIZES.lg,
        borderRadius: SIZES.radiusMd,
        overflow: 'hidden',
    },
    infoContainer: {
        padding: SIZES.lg,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
        marginBottom: SIZES.md,
    },
    badgeText: {
        marginLeft: SIZES.xs,
        fontSize: SIZES.fontSm,
        color: COLORS.text,
        fontWeight: '600',
    },
    description: {
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        marginBottom: SIZES.md,
        lineHeight: 22,
    },
    coordinates: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
    },
    commentsSection: {
        padding: SIZES.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    commentsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addCommentButton: {
        padding: SIZES.xs,
    },
    commentForm: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginBottom: SIZES.lg,
    },
    commentInput: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
        padding: SIZES.md,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    commentPhotosPreview: {
        flexDirection: 'row',
        marginTop: SIZES.md,
        marginBottom: SIZES.md,
    },
    photoPreview: {
        marginRight: SIZES.sm,
        position: 'relative',
    },
    photoPreviewImage: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radiusSm,
    },
    removePhotoButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusFull,
    },
    addPhotoButton: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radiusSm,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    commentFormButtons: {
        flexDirection: 'row',
        gap: SIZES.sm,
    },
    commentFormButton: {
        flex: 1,
    },
    commentCard: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginBottom: SIZES.md,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: SIZES.sm,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    commentInfo: {
        flex: 1,
    },
    commentAuthor: {
        fontSize: SIZES.fontMd,
        fontWeight: '600',
        color: COLORS.text,
    },
    commentDate: {
        fontSize: SIZES.fontXs,
        color: COLORS.textSecondary,
    },
    deleteButton: {
        padding: SIZES.xs,
    },
    commentText: {
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        lineHeight: 20,
    },
    commentPhotosContainer: {
        marginTop: SIZES.sm,
    },
    commentPhoto: {
        width: 100,
        height: 100,
        borderRadius: SIZES.radiusSm,
        marginRight: SIZES.sm,
    },
    noComments: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
        marginTop: SIZES.lg,
    },
});