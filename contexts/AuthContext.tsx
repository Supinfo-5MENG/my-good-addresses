import {User} from "@/types";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile
} from 'firebase/auth'
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {auth, db} from '@/services/firebase/firebase'
import {doc, getDoc, setDoc} from "@firebase/firestore";
import {COLLECTIONS} from "@/constants";

type AuthContactType = {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (displayName?: string, photoUrl?: string) => Promise<void>,
}

const AuthContext = createContext<AuthContactType | undefined>(undefined);

export function AuthProvider({ children  } : Readonly<{ children: React.ReactNode}>) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("auth changes detected")
            if (!firebaseUser) {
                console.log("firebaseUser is null")
                setUser(null);
                setLoading(false);
                return;
            }

            const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            let userData;
            if (userSnap.exists()) {
                userData = userSnap.data();
            } else {
                userData = {
                    email: firebaseUser.email!,
                    displayName: firebaseUser.displayName || null,
                    photoURL: firebaseUser.photoURL || null,
                    createdAt: new Date(),
                };
                await setDoc(userRef, userData);
            }

            setUser({
                id: firebaseUser.uid,
                email: userData.email,
                displayName: userData.displayName || firebaseUser.displayName || undefined,
                photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
                createdAt: userData.createdAt?.toDate?.() || userData.createdAt || new Date(),
            });

            setLoading(false);
        });
    }, [])

    const signIn = useCallback(async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);

        await new Promise<void>((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                if (firebaseUser) {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }, []);

    const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName) {
            await updateProfile(userCredential.user, { displayName })
        }

        await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
            email,
            displayName: displayName || null,
            photoURL: null,
            createdAt: new Date(),
        })
    }, []);

    const signOut = useCallback(async () => {
        await firebaseSignOut(auth);
    }, []);

    const updateUserProfile = useCallback(async (displayName?: string, photoURL?: string) => {
        if (!auth.currentUser) {
            return
        }

        await updateProfile(auth.currentUser, {
            displayName: displayName || auth.currentUser.displayName,
            photoURL: photoURL || auth.currentUser.photoURL,
        });

        await setDoc(doc(db, COLLECTIONS.USERS, auth.currentUser.uid), {
            displayName: displayName || null,
            photoURL: photoURL || null,

        }, { merge: true });

        setUser((prev) => prev
            ? {
                ...prev,
                displayName: displayName || prev.displayName,
                photoURL: photoURL || prev.photoURL,
            }
            : null
        )
    }, []);

    const authContextValues = useMemo(() => ({
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
    }), [user, loading, signIn, signUp, signOut, updateUserProfile])

    return (
        <AuthContext.Provider value={authContextValues}>
            { children }
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
}