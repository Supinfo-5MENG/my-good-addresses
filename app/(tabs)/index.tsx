import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import {
    getCurrentLocation,
    selectImageSource
} from '@/utils/permissions';

export default function App() {
    const testLocation = async () => {
        const coords = await getCurrentLocation();
        if (coords) {
            alert(`Localisation: ${coords.latitude}, ${coords.longitude}`);
        }
    };

    const testImage = async () => {
        const uri = await selectImageSource();
        if (uri) {
            alert(`Photo sélectionnée: ${uri}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mes Bonnes Adresses</Text>
            <Text style={styles.text}>Firebase configuré ! 🔥</Text>

            <View style={styles.buttonContainer}>
                <Button title="🗺️ Tester Localisation" onPress={testLocation} />
                <Button title="📸 Tester Photo" onPress={testImage} />
            </View>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    buttonContainer: {
        gap: 10,
        width: '100%',
    },
});