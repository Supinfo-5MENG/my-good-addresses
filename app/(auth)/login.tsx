import {ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {COLORS, SIZES} from '../../constants';
import {useAuth} from "../../contexts/AuthContext";
import {useRouter} from "expo-router";
import {useState} from "react";

export default function LoginScreen() {
    const {signIn} = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Merci de remplir tous les champs.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await signIn(email.trim(), password)
            console.log("Authentication réussie");
            router.replace("/");
        } catch (error: any) {
            console.error(error);
            switch (error.code) {
                case "auth/invalid-email":
                    setError("Adresse email invalide.");
                    break;
                case "auth/user-not-found":
                    setError("Aucun compte trouvé avec cet email.");
                    break;
                case "auth/wrong-password":
                    setError("Mot de passe incorrect.");
                    break;
                default:
                    setError("Une erreur est survenue.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const goToRegister = () => {
        router.push("/(auth)/register");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion</Text>

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

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
                style={[styles.button, isSubmitting && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Se connecter</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={goToRegister} style={styles.linkButton}>
                <Text style={styles.linkText}>Créer un compte</Text>
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