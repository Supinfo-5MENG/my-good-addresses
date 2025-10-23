import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SIZES } from '@/constants';
import { Button } from '@/components/common';

export default function AddressDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Détail Adresse</Text>
            <Text style={styles.id}>ID: {id}</Text>

            <Button
                title="Fermer"
                onPress={() => router.back()}
                style={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: SIZES.lg,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: 'bold',
        marginBottom: SIZES.md,
    },
    id: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginBottom: SIZES.xl,
    },
    button: {
        minWidth: 200,
    },
});