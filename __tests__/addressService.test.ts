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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { CreateAddressInput, UpdateAddressInput } from '../types';

jest.mock('firebase/firestore');
jest.mock('firebase/storage');
jest.mock('@/services/firebase/firebase', () => ({
    db: {},
    storage: {},
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
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (collection as jest.Mock).mockReturnValue({});
            (setDoc as jest.Mock).mockResolvedValue(undefined);

            const result = await createAddress(mockUserId, mockAddressInput);

            expect(result).toBe(mockAddressId);
            expect(setDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.objectContaining({
                    ...mockAddressInput,
                    userId: mockUserId,
                })
            );
        });

        it('should handle creation errors', async () => {
            (doc as jest.Mock).mockReturnValue({ id: mockAddressId });
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

            expect(updateDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.objectContaining({
                    ...updates,
                })
            );
        });
    });

    describe('deleteAddress', () => {
        it('should delete an address and its photo', async () => {
            const mockDocRef = { id: mockAddressId };
            const mockAddressData = {
                ...mockAddressInput,
                photoURL: 'https://storage.example.com/photo.jpg',
            };

            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                data: () => mockAddressData,
            });
            (deleteDoc as jest.Mock).mockResolvedValue(undefined);
            (ref as jest.Mock).mockReturnValue({});
            (deleteObject as jest.Mock).mockResolvedValue(undefined);

            await deleteAddress(mockAddressId);

            expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
            expect(deleteObject).toHaveBeenCalled();
        });

        it('should handle deletion when address has no photo', async () => {
            const mockDocRef = { id: mockAddressId };
            
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                data: () => mockAddressInput,
            });
            (deleteDoc as jest.Mock).mockResolvedValue(undefined);

            await deleteAddress(mockAddressId);

            expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
            expect(deleteObject).not.toHaveBeenCalled();
        });
    });

    describe('getAddress', () => {
        it('should retrieve an address by ID', async () => {
            const mockDocRef = { id: mockAddressId };
            const mockTimestamp = { toDate: () => new Date('2024-01-01') };
            const mockAddressData = {
                ...mockAddressInput,
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
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            });
        });

        it('should return null for non-existent address', async () => {
            (doc as jest.Mock).mockReturnValue({ id: mockAddressId });
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => false,
            });

            const result = await getAddress(mockAddressId);

            expect(result).toBeNull();
        });
    });

    describe('getUserAddresses', () => {
        it('should retrieve all addresses for a user', async () => {
            const mockAddresses = [
                { id: 'addr1', ...mockAddressInput },
                { id: 'addr2', ...mockAddressInput, isPublic: false },
            ];

            const mockDocs = mockAddresses.map(addr => ({
                id: addr.id,
                data: () => ({
                    ...addr,
                    createdAt: { toDate: () => new Date() },
                    updatedAt: { toDate: () => new Date() },
                }),
            }));

            (query as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockDocs,
            });

            const result = await getUserAddresses(mockUserId);

            expect(result).toHaveLength(2);
            expect(query).toHaveBeenCalled();
            expect(where).toHaveBeenCalledWith('userId', '==', mockUserId);
        });
    });

    describe('getPublicAddresses', () => {
        it('should retrieve only public addresses', async () => {
            const mockPublicAddresses = [
                { id: 'addr1', ...mockAddressInput },
                { id: 'addr2', ...mockAddressInput },
            ];

            const mockDocs = mockPublicAddresses.map(addr => ({
                id: addr.id,
                data: () => ({
                    ...addr,
                    createdAt: { toDate: () => new Date() },
                    updatedAt: { toDate: () => new Date() },
                }),
            }));

            (query as jest.Mock).mockReturnValue({});
            (collection as jest.Mock).mockReturnValue({});
            (where as jest.Mock).mockReturnValue({});
            (orderBy as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockDocs,
            });

            const result = await getPublicAddresses();

            expect(result).toHaveLength(2);
            expect(where).toHaveBeenCalledWith('isPublic', '==', true);
        });
    });
});
