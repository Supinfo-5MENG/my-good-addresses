import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAXddfzeeu11C1K4UUm-qkSz5VrCk4949I",
    authDomain: "my-good-adresses.firebaseapp.com",
    projectId: "my-good-adresses",
    storageBucket: "my-good-adresses.firebasestorage.app",
    messagingSenderId: "116853918771",
    appId: "1:116853918771:web:47d073c0e4b67271a7a746",
    measurementId: "G-V9YW0RLW0V"
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };
