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

export const createAddress = async (
    userId: string,
    input: CreateAddressInput
): Promise<string> => {
    try {
        const addressRef = doc(collection(db, COLLECTIONS.ADDRESSES));

        const addressData = {
            ...input,
            userId,
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
    updates: UpdateAddressInput
): Promise<void> => {
    try {
        const addressRef = doc(db, COLLECTIONS.ADDRESSES, addressId);

        const updateData: any = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(addressRef, updateData);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'adresse:', error);
        throw error;
    }
};

export const deleteAddress = async (addressId: string): Promise<void> => {
    try {
        const addressRef = doc(db, COLLECTIONS.ADDRESSES, addressId);
        const commentsQuery = query(
            collection(db, COLLECTIONS.COMMENTS),
            where('addressId', '==', addressId)
        );
        const commentDocs = await getDocs(commentsQuery);

        const deletePromises = commentDocs.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all([...deletePromises, deleteDoc(addressRef)]);
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
    }, (error) => {
        console.error('Erreur lors de l\'écoute des adresses publiques:', error);
    });
};

export const subscribeToUserAddresses = (
    userId: string,
    callback: (addresses: Address[]) => void
): Unsubscribe => {
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
    }, (error) => {
        console.error('Erreur lors de l\'écoute des adresses utilisateur:', error);
    });
};

export const getUserAddressesCount = async (userId: string): Promise<number> => {
    try {
        const q = query(
            collection(db, COLLECTIONS.ADDRESSES),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Erreur lors du comptage des adresses:', error);
        return 0;
    }
};