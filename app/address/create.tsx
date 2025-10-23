import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '@/constants';
import { Button } from '@/components/common';

export default function CreateAddressScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Créer une Adresse</Text>

            <Button
                title="Annuler"
                onPress={() => router.back()}
                variant="outline"
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
        marginBottom: SIZES.xl,
    },
    button: {
        minWidth: 200,
    },
});