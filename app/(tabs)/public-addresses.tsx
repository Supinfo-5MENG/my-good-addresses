import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, SIZES } from '@/constants';

export default function PublicAddressesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adresses Publiques</Text>
            <Text style={styles.platform}>Platform: {Platform.OS}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: 'bold',
        marginBottom: SIZES.md,
    },
    platform: {
        fontSize: SIZES.fontSm,
        color: COLORS.textTertiary,
    },
});