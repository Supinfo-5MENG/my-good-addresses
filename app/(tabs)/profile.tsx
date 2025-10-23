import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SIZES } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
    const { user, signOut, updateUserProfile } = useAuth();
    const router = useRouter();

    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert("Erreur", "Le pseudo ne peut pas être vide.");
            return;
        }

        try {
            setLoading(true);
            await updateUserProfile(displayName, photoURL);
            Alert.alert("Succès", "Profil mis à jour !");
        } catch (err) {
            console.error(err);
            Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission refusée", "Accès à la galerie nécessaire pour changer la photo.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets?.length) {
            const uri = result.assets[0].uri;
            setPhotoURL(uri);
            // 👉 Si tu veux l’uploader vers Firebase Storage plus tard, on le fera ici
        }
    };

    const handleSignOut = async () => {
        Alert.alert("Déconnexion", "Souhaitez-vous vraiment vous déconnecter ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Oui",
                style: "destructive",
                onPress: () => {
                    signOut().then(() => router.replace("/login"));
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mon Profil</Text>

            <TouchableOpacity onPress={handlePickImage}>
                {photoURL ? (
                    <Image source={{ uri: photoURL }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                            {user?.email?.[0]?.toUpperCase() || "?"}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.platform}>Platform: {Platform.OS}</Text>

            <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                value={displayName}
                onChangeText={setDisplayName}
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={handleUpdateProfile}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Mettre à jour</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: SIZES.lg,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: SIZES.lg,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: SIZES.radiusFull,
        marginBottom: SIZES.md,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontXl,
        fontWeight: "bold",
    },
    email: {
        color: COLORS.textSecondary,
        marginBottom: SIZES.md,
    },
    platform: {
        color: COLORS.textTertiary,
        marginBottom: SIZES.md,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radiusSm,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginBottom: SIZES.md,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusSm,
        width: "100%",
        alignItems: "center",
        marginTop: SIZES.md,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: SIZES.fontMd,
    },
    logoutButton: {
        marginTop: SIZES.xl,
    },
    logoutText: {
        color: COLORS.danger,
        fontWeight: "bold",
        fontSize: SIZES.fontMd,
    },
});