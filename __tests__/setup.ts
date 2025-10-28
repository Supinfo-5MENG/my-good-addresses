// Setup file pour Jest - Configuration globale des mocks

import '@testing-library/jest-native/extend-expect';

// Mock de console.error pour éviter les warnings inutiles pendant les tests
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render') ||
                args[0].includes('Warning: useLayoutEffect') ||
                args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});

// Mock de react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock de expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
    useSegments: jest.fn(),
    usePathname: jest.fn(),
    Link: 'Link',
    Redirect: 'Redirect',
    Stack: 'Stack',
    Tabs: 'Tabs',
}));

// Mock de expo-location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    Accuracy: {
        Balanced: 4,
    },
}));

// Mock de expo-image-picker
jest.mock('expo-image-picker', () => ({
    requestCameraPermissionsAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
}));

// Mock de expo-haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
}));

// Mock de react-native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

// Mock de firebase/auth - CORRIGÉ pour éviter les vraies connexions
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: null,
    })),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn((auth, callback) => {
        // Return unsubscribe function without calling callback
        return jest.fn();
    }),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    reauthenticateWithCredential: jest.fn(),
    EmailAuthProvider: {
        credential: jest.fn(),
    },
}));

// Mock de firebase/firestore - CORRIGÉ pour serverTimestamp
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(() => ({})),
    doc: jest.fn(() => ({ id: 'mock-id' })),
    setDoc: jest.fn(() => Promise.resolve()),
    getDoc: jest.fn(() => Promise.resolve({
        exists: () => false,
        data: () => ({}),
    })),
    getDocs: jest.fn(() => Promise.resolve({
        docs: [],
    })),
    deleteDoc: jest.fn(() => Promise.resolve()),
    updateDoc: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => ({})),
    where: jest.fn(() => ({})),
    orderBy: jest.fn(() => ({})),
    serverTimestamp: jest.fn(() => ({
        seconds: Date.now() / 1000,
        nanoseconds: 0
    })),
    onSnapshot: jest.fn(() => jest.fn()), // Return unsubscribe function
}));

// Mock de firebase/app - CORRIGÉ pour éviter la réinitialisation
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
    getApp: jest.fn(() => ({})),
    getApps: jest.fn(() => [{}]), // Return non-empty array to prevent re-initialization
}));

// Mock de WebView pour les tests
jest.mock('react-native-webview', () => ({
    WebView: 'WebView',
}));

// Supprimer les logs pendant les tests (optionnel)
global.console = {
    ...console,
    // Commentez ces lignes si vous voulez voir les logs
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
};