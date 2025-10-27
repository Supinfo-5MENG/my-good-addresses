import React, {useState} from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useRouter} from 'expo-router';
import {useAuth} from '../../contexts/AuthContext';
import {COLORS, SIZES} from '../../constants';
import {Button, Input} from '../../components/common';
import {Ionicons} from '@expo/vector-icons';
import {pickImage} from '../../utils/permissions';
import {compressImageToSize} from '../../services/imageService';

export default function ProfileScreen() {
    const { user, signOut, updateUserProfile, changePassword } = useAuth();
    const router = useRouter();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.photoURL || null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSelectPhoto = async () => {
        const uri = await pickImage();
        if (uri) {
            try {
                setLoading(true);
                const base64Image = await compressImageToSize(uri, 200);
                setProfilePhoto(base64Image);
            } catch (error) {
                Alert.alert('Erreur', 'Impossible de traiter l\'image');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            await updateUserProfile(displayName, profilePhoto || undefined);
            Alert.alert('Succès', 'Profil mis à jour avec succès');
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Erreur', 'Tous les champs sont requis');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            setLoading(true);
            await changePassword(currentPassword, newPassword);
            Alert.alert('Succès', 'Mot de passe modifié avec succès');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Erreur lors du changement de mot de passe:', error);
            Alert.alert('Erreur', error.message || 'Impossible de changer le mot de passe');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Se déconnecter',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/login');
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de se déconnecter');
                        }
                    },
                },
            ]
        );
    };

    const renderProfilePhoto = () => {
        if (profilePhoto) {
            return <Image source={{ uri: profilePhoto }} style={styles.profileImage} />;
        }

        return (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Ionicons name="person" size={50} color={COLORS.textSecondary} />
            </View>
        );
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
                    <Text style={styles.title}>Mon Profil</Text>
                </View>

                <View style={styles.profilePhotoSection}>
                    {renderProfilePhoto()}
                    <TouchableOpacity
                        style={styles.changePhotoButton}
                        onPress={handleSelectPhoto}
                        disabled={loading}
                    >
                        <Ionicons name="camera" size={20} color={COLORS.primary} />
                        <Text style={styles.changePhotoText}>Changer la photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Informations de base */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations personnelles</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user?.email}</Text>
                    </View>

                    {isEditingProfile ? (
                        <View style={styles.editForm}>
                            <Input
                                label="Nom d'affichage"
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Entrez votre nom"
                            />
                            <View style={styles.editButtons}>
                                <Button
                                    title="Annuler"
                                    variant="outline"
                                    size="small"
                                    onPress={() => {
                                        setIsEditingProfile(false);
                                        setDisplayName(user?.displayName || '');
                                    }}
                                    style={styles.editButton}
                                />
                                <Button
                                    title="Sauvegarder"
                                    size="small"
                                    loading={loading}
                                    onPress={handleUpdateProfile}
                                    style={styles.editButton}
                                />
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Nom d'affichage</Text>
                                <Text style={styles.value}>
                                    {user?.displayName || 'Non défini'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.editLink}
                                onPress={() => setIsEditingProfile(true)}
                            >
                                <Ionicons name="pencil" size={16} color={COLORS.primary} />
                                <Text style={styles.editLinkText}>Modifier</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Sécurité */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sécurité</Text>

                    {isChangingPassword ? (
                        <View style={styles.passwordForm}>
                            <Input
                                label="Mot de passe actuel"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                                placeholder="Entrez votre mot de passe actuel"
                            />
                            <Input
                                label="Nouveau mot de passe"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                placeholder="Entrez le nouveau mot de passe"
                            />
                            <Input
                                label="Confirmer le nouveau mot de passe"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholder="Confirmez le nouveau mot de passe"
                            />
                            <View style={styles.editButtons}>
                                <Button
                                    title="Annuler"
                                    variant="outline"
                                    size="small"
                                    onPress={() => {
                                        setIsChangingPassword(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    style={styles.editButton}
                                />
                                <Button
                                    title="Changer"
                                    size="small"
                                    loading={loading}
                                    onPress={handleChangePassword}
                                    style={styles.editButton}
                                />
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.securityButton}
                            onPress={() => setIsChangingPassword(true)}
                        >
                            <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                            <Text style={styles.securityButtonText}>
                                Changer le mot de passe
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Statistiques */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Statistiques</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>
                                {user?.createdAt
                                    ? Math.floor(
                                        (Date.now() - new Date(user.createdAt).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )
                                    : 0}
                            </Text>
                            <Text style={styles.statLabel}>Jours inscrits</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>-</Text>
                            <Text style={styles.statLabel}>Adresses créées</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>-</Text>
                            <Text style={styles.statLabel}>Commentaires</Text>
                        </View>
                    </View>
                </View>

                {/* Déconnexion */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleSignOut}
                >
                    <Ionicons name="log-out" size={20} color={COLORS.danger} />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>
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
        paddingBottom: SIZES.xl,
    },
    header: {
        padding: SIZES.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : SIZES.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    profilePhotoSection: {
        alignItems: 'center',
        paddingVertical: SIZES.xl,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: SIZES.md,
    },
    profileImagePlaceholder: {
        backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
    },
    changePhotoText: {
        marginLeft: SIZES.xs,
        color: COLORS.primary,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.sm,
    },
    label: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
    },
    value: {
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        fontWeight: '500',
    },
    editLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SIZES.sm,
    },
    editLinkText: {
        marginLeft: SIZES.xs,
        color: COLORS.primary,
        fontSize: SIZES.fontSm,
    },
    editForm: {
        marginTop: SIZES.md,
    },
    editButtons: {
        flexDirection: 'row',
        gap: SIZES.sm,
        marginTop: SIZES.md,
    },
    editButton: {
        flex: 1,
    },
    passwordForm: {
        marginTop: SIZES.sm,
    },
    securityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        padding: SIZES.md,
        borderRadius: SIZES.radiusMd,
    },
    securityButtonText: {
        flex: 1,
        marginLeft: SIZES.md,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: SIZES.sm,
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        padding: SIZES.md,
        borderRadius: SIZES.radiusMd,
        flex: 1,
        marginHorizontal: SIZES.xs,
    },
    statValue: {
        fontSize: SIZES.fontXl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: SIZES.fontXs,
        color: COLORS.textSecondary,
        marginTop: SIZES.xs,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: SIZES.lg,
        marginTop: SIZES.xl,
        padding: SIZES.md,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    logoutText: {
        marginLeft: SIZES.sm,
        color: COLORS.danger,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
});