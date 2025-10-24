import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Address, CreateAddressInput, UpdateAddressInput } from '../../types';
import { COLLECTIONS } from '../../constants';
import { compressImageToSize } from '../imageService';

export const createAddress = async (
    userId: string,
    input: CreateAddressInput,
    photoUri?: string
): Promise<string> => {
    try {
        const addressRef = doc(collection(db, COLLECTIONS.ADDRESSES));

        let photoBase64 = null;
        if (photoUri) {
            try {
                photoBase64 = await compressImageToSize(photoUri, 400);
            } catch (error) {
                console.error('Erreur lors de la compression de l\'image:', error);
            }
        }

        const addressData = {
            ...input,
            userId,
            photoURL: photoBase64,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(addressRef, addressData);
        return addressRef.id;
    } catch (error) {
        console.error('Erreur lors de la création de l\'adresse:', error);
        throw error;
    }
};

export const updateAddress = async (
    addressId: string,
    updates: UpdateAddressInput,
    newPhotoUri?: string
): Promise<void> => {
    try {
        const addressRef = doc(db, COLLECTIONS.ADDRESSES, addressId);

        const updateData: any = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        if (newPhotoUri) {
            try {
                updateData.photoURL = await compressImageToSize(newPhotoUri, 400);
            } catch (error) {
                console.error('Erreur lors de la compression de l\'image:', error);
            }
        }

        await updateDoc(addressRef, updateData);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'adresse:', error);
        throw error;
    }
};

export const deleteAddress = async (addressId: string): Promise<void> => {
    try {
        const addressRef = doc(db, COLLECTIONS.ADDRESSES, addressId);
        await deleteDoc(addressRef);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'adresse:', error);
        throw error;
    }
};

export const getAddress = async (addressId: string): Promise<Address | null> => {
    try {
        const addressRef = doc(db, COLLECTIONS.ADDRESSES, addressId);
        const addressSnap = await getDoc(addressRef);

        if (addressSnap.exists()) {
            const data = addressSnap.data();
            return {
                id: addressSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Address;
        }

        return null;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'adresse:', error);
        throw error;
    }
};

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
    try {
        const q = query(
            collection(db, COLLECTIONS.ADDRESSES),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Address;
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des adresses:', error);
        throw error;
    }
};

export const getPublicAddresses = async (): Promise<Address[]> => {
    try {
        const q = query(
            collection(db, COLLECTIONS.ADDRESSES),
            where('isPublic', '==', true),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Address;
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des adresses publiques:', error);
        throw error;
    }
};

export const subscribeToPublicAddresses = (
    callback: (addresses: Address[]) => void
): Unsubscribe => {
    const q = query(
        collection(db, COLLECTIONS.ADDRESSES),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const addresses = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Address;
        });

        callback(addresses);
    });
};

export const subscribeToUserAddresses = (
    userId: string,
    callback: (addresses: Address[]) => void
): Unsubscribe => {

    console.log("pass here")
    console.log("userId:", userId)
    const q = query(
        collection(db, COLLECTIONS.ADDRESSES),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const addresses = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Address;
        });

        callback(addresses);
    });
};