import {initializeApp} from "@firebase/app";
import {getReactNativePersistence, initializeAuth} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore} from "@firebase/firestore";
import {getStorage} from "@firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDj2QQEGeBRWx-dz5Sm-JIe6n0W_evKIko",
    authDomain: "my-good-addresses-d7bf8.firebaseapp.com",
    projectId: "my-good-addresses-d7bf8",
    storageBucket: "my-good-addresses-d7bf8.firebasestorage.app",
    messagingSenderId: "950097850723",
    appId: "1:950097850723:web:f7df494a93a7463c8ba356"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

const storage = getStorage(app)

export { auth, db, storage };