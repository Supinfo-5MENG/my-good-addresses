import '@testing-library/jest-native/extend-expect';
import {Alert} from "react-native";

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

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

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

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    Accuracy: {
        Balanced: 4,
    },
}));

jest.mock('expo-image-picker', () => ({
    requestCameraPermissionsAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
}));

Alert.alert = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: null,
    })),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn((auth, callback) => {
        return jest.fn();
    }),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    reauthenticateWithCredential: jest.fn(),
    EmailAuthProvider: {
        credential: jest.fn(),
    },
}));

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
    onSnapshot: jest.fn(() => jest.fn()),
}));

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
    getApp: jest.fn(() => ({})),
    getApps: jest.fn(() => [{}]),
}));

jest.mock('react-native-webview', () => ({
    WebView: 'WebView',
}));

global.console = {
    ...console,
};