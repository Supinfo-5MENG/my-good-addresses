import {useAuth} from "../contexts/AuthContext";
import {useRouter, useSegments} from "expo-router";
import {useEffect} from "react";
import {ActivityIndicator, View, StyleSheet} from "react-native";
import {COLORS} from "../constants";

export default function Index() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const segments= useSegments();

    useEffect(() => {
        if (loading) {
            return;
        }

        const firstSegment = segments[0];
        const inAuthGroup = firstSegment === "(auth)";
        const inTabsGroup = firstSegment === "(tabs)";

        // TODO Besoin d'une double authentification quand on vient de se déconnecter
        // Le user est à false lors de la première connexion et true à la seconde
        // Il y a surement un soucis au niveau de l'écoute de la réponse de firebase
        console.log({ segments, inAuthGroup, inTabsGroup, user: !!user });

        if (!user && !inAuthGroup) {
            router.replace("/login");
        } else if (user && (inAuthGroup || !firstSegment)) {
            router.replace("/(tabs)");
        }
    }, [user, loading, segments, router]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.primary}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    }
})