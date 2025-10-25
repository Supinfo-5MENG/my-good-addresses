import { User } from "../types";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    User as FirebaseUser
} from 'firebase/auth';
import {createContext, useCallback, useContext, useEffect, useMemo, useState, useRef, ReactNode} from "react";
import { auth, db } from '../services/firebase/firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { COLLECTIONS } from "../constants";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (displayName?: string, photoUrl?: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const authSubscriptionRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (authSubscriptionRef.current) {
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            console.log("Auth state changed:", firebaseUser?.uid || "null");

            try {
                if (!firebaseUser) {
                    setUser(null);
                    setLoading(false);
                    setIsInitialized(true);
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

                const userObject: User = {
                    id: firebaseUser.uid,
                    email: userData.email,
                    displayName: userData.displayName || firebaseUser.displayName || undefined,
                    photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
                    createdAt: userData.createdAt?.toDate?.() || userData.createdAt || new Date(),
                };

                setUser(userObject);
            } catch (error) {
                console.error("Error loading user data:", error);
                if (firebaseUser) {
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email!,
                        displayName: firebaseUser.displayName || undefined,
                        photoURL: firebaseUser.photoURL || undefined,
                        createdAt: new Date(),
                    });
                }
            } finally {
                setLoading(false);
                setIsInitialized(true);
            }
        });

        authSubscriptionRef.current = unsubscribe;

        return () => {
            if (authSubscriptionRef.current) {
                authSubscriptionRef.current();
                authSubscriptionRef.current = null;
            }
        };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const userRef = doc(db, COLLECTIONS.USERS, userCredential.user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                setUser({
                    id: userCredential.user.uid,
                    email: userData.email,
                    displayName: userData.displayName || userCredential.user.displayName || undefined,
                    photoURL: userData.photoURL || userCredential.user.photoURL || undefined,
                    createdAt: userData.createdAt?.toDate?.() || userData.createdAt || new Date(),
                });
            }
        } catch (error) {
            console.error("Sign in error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }

            await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
                email,
                displayName: displayName || null,
                photoURL: null,
                createdAt: new Date(),
            });

            setUser({
                id: userCredential.user.uid,
                email,
                displayName: displayName || undefined,
                photoURL: undefined,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("Sign up error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Sign out error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserProfile = useCallback(async (displayName?: string, photoURL?: string) => {
        if (!auth.currentUser) {
            throw new Error("No authenticated user");
        }

        try {
            setLoading(true);

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
            );
        } catch (error) {
            console.error("Update profile error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        if (!auth.currentUser || !user?.email) {
            throw new Error("No authenticated user");
        }

        try {
            setLoading(true);

            // Ré-authentifier l'utilisateur d'abord
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await reauthenticateWithCredential(auth.currentUser, credential);

            // Puis changer le mot de passe
            await updatePassword(auth.currentUser, newPassword);

            console.log("Password changed successfully");
        } catch (error: any) {
            console.error("Change password error:", error);
            if (error.code === 'auth/wrong-password') {
                throw new Error('Le mot de passe actuel est incorrect');
            } else if (error.code === 'auth/weak-password') {
                throw new Error('Le nouveau mot de passe est trop faible (6 caractères minimum)');
            } else {
                throw error;
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    const authContextValues = useMemo(() => ({
        user,
        loading: loading || !isInitialized,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
        changePassword,
    }), [user, loading, isInitialized, signIn, signUp, signOut, updateUserProfile, changePassword]);

    return (
        <AuthContext.Provider value={authContextValues}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};