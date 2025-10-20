// ===== USER TYPES =====
export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
}

// ===== ADDRESS TYPES =====
export interface Location {
    latitude: number;
    longitude: number;
}

export interface Address {
    id: string;
    userId: string;
    name: string;
    description: string;
    photoURL?: string;
    location: Location;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAddressInput {
    name: string;
    description: string;
    photoURL?: string;
    location: Location;
    isPublic: boolean;
}

export interface UpdateAddressInput {
    name?: string;
    description?: string;
    photoURL?: string;
    location?: Location;
    isPublic?: boolean;
}

// ===== COMMENT TYPES =====
export interface Comment {
    id: string;
    addressId: string;
    userId: string;
    userDisplayName?: string;
    userPhotoURL?: string;
    text: string;
    photos: string[];
    createdAt: Date;
}

export interface CreateCommentInput {
    addressId: string;
    text: string;
    photos?: string[];
}