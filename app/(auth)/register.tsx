import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../../constants";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
    const { signUp } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError("Tous les champs sont requis.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await signUp(email.trim(), password, displayName);
            router.replace("/(tabs)");
        } catch (err: any) {
            console.error("Register error:", err);
            switch (err.code) {
                case "auth/invalid-email":
                    setError("Adresse email invalide.");
                    break;
                case "auth/email-already-in-use":
                    setError("Cette adresse est déjà utilisée.");
                    break;
                case "auth/weak-password":
                    setError("Mot de passe trop faible (6 caractères minimum).");
                    break;
                default:
                    setError("Une erreur est survenue.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Créer un compte</Text>

            <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor={COLORS.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={COLORS.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
                style={[styles.button, isSubmitting && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>S'inscrire</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: SIZES.lg,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: "bold",
        marginBottom: SIZES.lg,
        color: COLORS.text,
    },
    input: {
        width: "100%",
        height: 50,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: SIZES.radiusSm,
        paddingHorizontal: SIZES.md,
        marginBottom: SIZES.md,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
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
    error: {
        color: COLORS.danger,
        marginBottom: SIZES.sm,
        textAlign: "center",
    },
    linkButton: {
        marginTop: SIZES.md,
    },
    linkText: {
        color: COLORS.primary,
        fontSize: SIZES.fontMd,
    },
});