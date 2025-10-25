import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Comment, CreateCommentInput } from '../../types';
import { COLLECTIONS } from '../../constants';

export const createComment = async (
    userId: string,
    userDisplayName: string | undefined,
    userPhotoURL: string | undefined,
    input: CreateCommentInput
): Promise<string> => {
    try {
        const commentRef = doc(collection(db, COLLECTIONS.COMMENTS));

        const commentData = {
            ...input,
            userId,
            userDisplayName: userDisplayName || 'Utilisateur anonyme',
            userPhotoURL: userPhotoURL || null,
            photos: input.photos || [],
            createdAt: serverTimestamp(),
        };

        await setDoc(commentRef, commentData);
        return commentRef.id;
    } catch (error) {
        console.error('Erreur lors de la création du commentaire:', error);
        throw error;
    }
};

export const deleteComment = async (commentId: string): Promise<void> => {
    try {
        const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId);
        await deleteDoc(commentRef);
    } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        throw error;
    }
};

export const getAddressComments = async (addressId: string): Promise<Comment[]> => {
    try {
        const q = query(
            collection(db, COLLECTIONS.COMMENTS),
            where('addressId', '==', addressId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                photos: data.photos || [],
            } as Comment;
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        throw error;
    }
};

export const subscribeToAddressComments = (
    addressId: string,
    callback: (comments: Comment[]) => void
): Unsubscribe => {
    const q = query(
        collection(db, COLLECTIONS.COMMENTS),
        where('addressId', '==', addressId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                photos: data.photos || [],
            } as Comment;
        });

        callback(comments);
    }, (error) => {
        console.error('Erreur lors de l\'écoute des commentaires:', error);
    });
};

export const getUserComments = async (userId: string): Promise<Comment[]> => {
    try {
        const q = query(
            collection(db, COLLECTIONS.COMMENTS),
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
                photos: data.photos || [],
            } as Comment;
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        throw error;
    }
};

export const getUserCommentsCount = async (userId: string): Promise<number> => {
    try {
        const q = query(
            collection(db, COLLECTIONS.COMMENTS),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Erreur lors du comptage des commentaires:', error);
        return 0;
    }
};