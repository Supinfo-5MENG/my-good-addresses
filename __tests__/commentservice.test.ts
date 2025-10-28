import {
    createComment,
    deleteComment,
    getAddressComments,
    getUserComments,
    getUserCommentsCount,
} from '../services/firebase/commentService';
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
} from 'firebase/firestore';
import { CreateCommentInput } from '../types';

jest.mock('firebase/firestore', () => {
    const actualFirestore = jest.requireActual('firebase/firestore');
    return {
        ...actualFirestore,
        getFirestore: jest.fn(),
        collection: jest.fn(),
        doc: jest.fn(),
        setDoc: jest.fn(),
        getDoc: jest.fn(),
        getDocs: jest.fn(),
        deleteDoc: jest.fn(),
        updateDoc: jest.fn(),
        query: jest.fn(),
        where: jest.fn(),
        orderBy: jest.fn(),
        serverTimestamp: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
        onSnapshot: jest.fn(),
    };
});

jest.mock('../services/firebase/firebase', () => ({
    db: {},
    auth: {},
}));

describe('Comment Service Tests', () => {
    const mockUserId = 'user123';
    const mockUserDisplayName = 'John Doe';
    const mockUserPhotoURL = 'https://example.com/photo.jpg';
    const mockAddressId = 'address123';
    const mockCommentId = 'comment123';

    const mockCommentInput: CreateCommentInput = {
        addressId: mockAddressId,
        text: 'Super restaurant, je recommande !',
        photos: ['photo1.jpg', 'photo2.jpg'],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createComment', () => {
        it('should create a new comment successfully', async () => {
            const mockDocRef = { id: mockCommentId };
            const mockCollection = {};

            (collection as jest.Mock).mockReturnValue(mockCollection);
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (setDoc as jest.Mock).mockResolvedValue(undefined);

            const result = await createComment(
                mockUserId,
                mockUserDisplayName,
                mockUserPhotoURL,
                mockCommentInput
            );

            expect(result).toBe(mockCommentId);
            expect(collection).toHaveBeenCalled();
            expect(doc).toHaveBeenCalledWith(mockCollection);
            expect(setDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.objectContaining({
                    ...mockCommentInput,
                    userId: mockUserId,
                    userDisplayName: mockUserDisplayName,
                    userPhotoURL: mockUserPhotoURL,
                })
            );
        });

        it('should create comment with default display name if not provided', async () => {
            const mockDocRef = { id: mockCommentId };
            const mockCollection = {};

            (collection as jest.Mock).mockReturnValue(mockCollection);
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (setDoc as jest.Mock).mockResolvedValue(undefined);

            await createComment(
                mockUserId,
                undefined,
                undefined,
                mockCommentInput
            );

            expect(setDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.objectContaining({
                    userDisplayName: 'Utilisateur anonyme',
                    userPhotoURL: null,
                })
            );
        });

        it('should create comment without photos if not provided', async () => {
            const mockDocRef = { id: mockCommentId };
            const mockCollection = {};
            const inputWithoutPhotos: CreateCommentInput = {
                addressId: mockAddressId,
                text: 'Commentaire sans photo',
            };

            (collection as jest.Mock).mockReturnValue(mockCollection);
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (setDoc as jest.Mock).mockResolvedValue(undefined);

            await createComment(
                mockUserId,
                mockUserDisplayName,
                mockUserPhotoURL,
                inputWithoutPhotos
            );

            expect(setDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.objectContaining({
                    photos: [],
                })
            );
        });

        it('should handle creation errors', async () => {
            const mockDocRef = { id: mockCommentId };

            (collection as jest.Mock).mockReturnValue({});
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (setDoc as jest.Mock).mockRejectedValue(new Error('Firebase error'));

            await expect(
                createComment(mockUserId, mockUserDisplayName, mockUserPhotoURL, mockCommentInput)
            ).rejects.toThrow('Firebase error');
        });
    });

    describe('deleteComment', () => {
        it('should delete a comment successfully', async () => {
            const mockDocRef = { id: mockCommentId };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (deleteDoc as jest.Mock).mockResolvedValue(undefined);

            await deleteComment(mockCommentId);

            expect(doc).toHaveBeenCalled();
            expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
        });

        it('should handle deletion errors', async () => {
            const mockDocRef = { id: mockCommentId };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (deleteDoc as jest.Mock).mockRejectedValue(new Error('Delete error'));

            await expect(deleteComment(mockCommentId)).rejects.toThrow('Delete error');
        });
    });

    describe('getAddressComments', () => {
        it('should retrieve all comments for an address', async () => {
            const mockComments = [
                {
                    id: 'comment1',
                    addressId: mockAddressId,
                    userId: 'user1',
                    text: 'Excellent !',
                    photos: [],
                    createdAt: { toDate: () => new Date('2024-01-01') },
                },
                {
                    id: 'comment2',
                    addressId: mockAddressId,
                    userId: 'user2',
                    text: 'Très bon',
                    photos: ['photo.jpg'],
                    createdAt: { toDate: () => new Date('2024-01-02') },
                },
            ];

            const mockDocs = mockComments.map(comment => ({
                id: comment.id,
                data: () => comment,
            }));

            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockDocs,
            });

            const result = await getAddressComments(mockAddressId);

            expect(result).toHaveLength(2);
            expect(result[0].text).toBe('Excellent !');
            expect(result[1].text).toBe('Très bon');
            expect(where).toHaveBeenCalledWith('addressId', '==', mockAddressId);
            expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
        });

        it('should return empty array when no comments exist', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
            });

            const result = await getAddressComments(mockAddressId);

            expect(result).toHaveLength(0);
        });

        it('should handle comments without photos', async () => {
            const mockComments = [
                {
                    id: 'comment1',
                    addressId: mockAddressId,
                    userId: 'user1',
                    text: 'Sans photo',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                },
            ];

            const mockDocs = mockComments.map(comment => ({
                id: comment.id,
                data: () => comment,
            }));

            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockDocs,
            });

            const result = await getAddressComments(mockAddressId);

            expect(result[0].photos).toEqual([]);
        });

        it('should handle retrieval errors', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockRejectedValue(new Error('Retrieval error'));

            await expect(getAddressComments(mockAddressId)).rejects.toThrow('Retrieval error');
        });
    });

    describe('getUserComments', () => {
        it('should retrieve all comments by a user', async () => {
            const mockComments = [
                {
                    id: 'comment1',
                    addressId: 'address1',
                    userId: mockUserId,
                    text: 'Mon premier commentaire',
                    photos: [],
                    createdAt: { toDate: () => new Date('2024-01-01') },
                },
                {
                    id: 'comment2',
                    addressId: 'address2',
                    userId: mockUserId,
                    text: 'Mon deuxième commentaire',
                    photos: ['photo.jpg'],
                    createdAt: { toDate: () => new Date('2024-01-02') },
                },
            ];

            const mockDocs = mockComments.map(comment => ({
                id: comment.id,
                data: () => comment,
            }));

            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockDocs,
            });

            const result = await getUserComments(mockUserId);

            expect(result).toHaveLength(2);
            expect(result[0].userId).toBe(mockUserId);
            expect(result[1].userId).toBe(mockUserId);
            expect(where).toHaveBeenCalledWith('userId', '==', mockUserId);
            expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
        });

        it('should return empty array when user has no comments', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
            });

            const result = await getUserComments(mockUserId);

            expect(result).toHaveLength(0);
        });

        it('should handle retrieval errors', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockRejectedValue(new Error('Retrieval error'));

            await expect(getUserComments(mockUserId)).rejects.toThrow('Retrieval error');
        });
    });

    describe('getUserCommentsCount', () => {
        it('should return the count of user comments', async () => {
            const mockSnapshot = {
                size: 5,
            };

            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

            const result = await getUserCommentsCount(mockUserId);

            expect(result).toBe(5);
            expect(where).toHaveBeenCalledWith('userId', '==', mockUserId);
        });

        it('should return 0 when user has no comments', async () => {
            const mockSnapshot = {
                size: 0,
            };

            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

            const result = await getUserCommentsCount(mockUserId);

            expect(result).toBe(0);
        });

        it('should return 0 on error', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockRejectedValue(new Error('Count error'));

            const result = await getUserCommentsCount(mockUserId);

            expect(result).toBe(0);
        });
    });
});