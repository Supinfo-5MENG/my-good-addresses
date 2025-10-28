import {
    createAddress,
    updateAddress,
    deleteAddress,
    getAddress,
    getUserAddresses,
    getPublicAddresses,
} from '../services/firebase/addressService';
import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { CreateAddressInput, UpdateAddressInput } from '../types';

// Mock Firebase modules
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

describe('Address Service Tests', () => {
    const mockUserId = 'user123';
    const mockAddressId = 'address123';

    const mockAddressInput: CreateAddressInput = {
        name: 'Mon Restaurant Préféré',
        description: 'Un excellent restaurant italien',
        location: {
            latitude: 48.8566,
            longitude: 2.3522,
        },
        isPublic: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createAddress', () => {
        it('should create a new address successfully', async () => {
            const mockDocRef = { id: mockAddressId };
            const mockCollection = {};

            (collection as jest.Mock).mockReturnValue(mockCollection);
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (setDoc as jest.Mock).mockResolvedValue(undefined);

            const result = await createAddress(mockUserId, mockAddressInput);

            expect(result).toBe(mockAddressId);
            expect(collection).toHaveBeenCalled();
            expect(doc).toHaveBeenCalledWith(mockCollection);
            expect(setDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.objectContaining({
                    ...mockAddressInput,
                    userId: mockUserId,
                })
            );
        });

        it('should handle creation errors', async () => {
            const mockDocRef = { id: mockAddressId };

            (collection as jest.Mock).mockReturnValue({});
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (setDoc as jest.Mock).mockRejectedValue(new Error('Firebase error'));

            await expect(createAddress(mockUserId, mockAddressInput)).rejects.toThrow('Firebase error');
        });
    });

    describe('updateAddress', () => {
        it('should update an address successfully', async () => {
            const mockDocRef = { id: mockAddressId };
            const updates: UpdateAddressInput = {
                name: 'Nouveau Nom',
                isPublic: false,
            };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (updateDoc as jest.Mock).mockResolvedValue(undefined);

            await updateAddress(mockAddressId, updates);

            expect(doc).toHaveBeenCalled();
            expect(updateDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.objectContaining({
                    ...updates,
                })
            );
        });

        it('should handle update errors', async () => {
            const mockDocRef = { id: mockAddressId };
            const updates: UpdateAddressInput = {
                name: 'Nouveau Nom',
            };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (updateDoc as jest.Mock).mockRejectedValue(new Error('Update error'));

            await expect(updateAddress(mockAddressId, updates)).rejects.toThrow('Update error');
        });
    });

    describe('deleteAddress', () => {
        it('should delete an address and its comments', async () => {
            const mockDocRef = { id: mockAddressId };
            const mockCommentDocs = [
                { ref: { id: 'comment1' } },
                { ref: { id: 'comment2' } },
            ];

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockCommentDocs,
            });
            (deleteDoc as jest.Mock).mockResolvedValue(undefined);

            await deleteAddress(mockAddressId);

            expect(deleteDoc).toHaveBeenCalledTimes(3); // 2 comments + 1 address
            expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
        });

        it('should handle deletion errors', async () => {
            const mockDocRef = { id: mockAddressId };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockRejectedValue(new Error('Delete error'));

            await expect(deleteAddress(mockAddressId)).rejects.toThrow('Delete error');
        });
    });

    describe('getAddress', () => {
        it('should retrieve an address by ID', async () => {
            const mockDocRef = { id: mockAddressId };
            const mockTimestamp = { toDate: () => new Date('2024-01-01') };
            const mockAddressData = {
                ...mockAddressInput,
                userId: mockUserId,
                createdAt: mockTimestamp,
                updatedAt: mockTimestamp,
            };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                id: mockAddressId,
                data: () => mockAddressData,
            });

            const result = await getAddress(mockAddressId);

            expect(result).toEqual({
                id: mockAddressId,
                ...mockAddressInput,
                userId: mockUserId,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            });
        });

        it('should return null for non-existent address', async () => {
            const mockDocRef = { id: mockAddressId };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => false,
            });

            const result = await getAddress(mockAddressId);

            expect(result).toBeNull();
        });

        it('should handle retrieval errors', async () => {
            const mockDocRef = { id: mockAddressId };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (getDoc as jest.Mock).mockRejectedValue(new Error('Retrieval error'));

            await expect(getAddress(mockAddressId)).rejects.toThrow('Retrieval error');
        });
    });

    describe('getUserAddresses', () => {
        it('should retrieve all addresses for a user', async () => {
            const mockAddresses = [
                { id: 'addr1', ...mockAddressInput, userId: mockUserId },
                { id: 'addr2', ...mockAddressInput, userId: mockUserId, isPublic: false },
            ];

            const mockDocs = mockAddresses.map(addr => ({
                id: addr.id,
                data: () => ({
                    ...addr,
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-01') },
                }),
            }));

            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockDocs,
            });

            const result = await getUserAddresses(mockUserId);

            expect(result).toHaveLength(2);
            expect(query).toHaveBeenCalled();
            expect(where).toHaveBeenCalledWith('userId', '==', mockUserId);
            expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
        });

        it('should return empty array when user has no addresses', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
            });

            const result = await getUserAddresses(mockUserId);

            expect(result).toHaveLength(0);
        });

        it('should handle errors when fetching user addresses', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockRejectedValue(new Error('Fetch error'));

            await expect(getUserAddresses(mockUserId)).rejects.toThrow('Fetch error');
        });
    });

    describe('getPublicAddresses', () => {
        it('should retrieve only public addresses', async () => {
            const mockPublicAddresses = [
                { id: 'addr1', ...mockAddressInput, userId: 'user1' },
                { id: 'addr2', ...mockAddressInput, userId: 'user2' },
            ];

            const mockDocs = mockPublicAddresses.map(addr => ({
                id: addr.id,
                data: () => ({
                    ...addr,
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-01') },
                }),
            }));

            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockDocs,
            });

            const result = await getPublicAddresses();

            expect(result).toHaveLength(2);
            expect(where).toHaveBeenCalledWith('isPublic', '==', true);
            expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
        });

        it('should return empty array when no public addresses exist', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
            });

            const result = await getPublicAddresses();

            expect(result).toHaveLength(0);
        });

        it('should handle errors when fetching public addresses', async () => {
            (collection as jest.Mock).mockReturnValue({});
            (query as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockRejectedValue(new Error('Fetch error'));

            await expect(getPublicAddresses()).rejects.toThrow('Fetch error');
        });
    });
});