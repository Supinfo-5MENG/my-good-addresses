// ===== COULEURS =====
export const COLORS = {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',

    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F7',

    text: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',

    border: '#E5E5EA',
    separator: '#D1D1D6',

    // Map colors
    markerPublic: '#34C759',
    markerPrivate: '#007AFF',
    markerMine: '#FF3B30',
};

// ===== TAILLES =====
export const SIZES = {
    // Spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,

    // Font sizes
    fontXs: 12,
    fontSm: 14,
    fontMd: 16,
    fontLg: 18,
    fontXl: 24,
    fontXxl: 32,

    // Border radius
    radiusSm: 4,
    radiusMd: 8,
    radiusLg: 12,
    radiusXl: 16,
    radiusFull: 9999,

    // Avatar sizes
    avatarSm: 32,
    avatarMd: 48,
    avatarLg: 64,
    avatarXl: 96,
};

// ===== REGEX PATTERNS =====
export const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// ===== MESSAGES =====
export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: 'Connexion réussie !',
        LOGOUT_SUCCESS: 'Déconnexion réussie !',
        REGISTER_SUCCESS: 'Compte créé avec succès !',
        INVALID_EMAIL: 'Adresse email invalide',
        WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
        EMAIL_ALREADY_IN_USE: 'Cette adresse email est déjà utilisée',
        WRONG_PASSWORD: 'Mot de passe incorrect',
        USER_NOT_FOUND: 'Aucun compte trouvé avec cette adresse email',
        UNKNOWN_ERROR: 'Une erreur est survenue',
    },
    ADDRESS: {
        CREATE_SUCCESS: 'Adresse créée avec succès !',
        UPDATE_SUCCESS: 'Adresse mise à jour !',
        DELETE_SUCCESS: 'Adresse supprimée !',
        DELETE_CONFIRM: 'Êtes-vous sûr de vouloir supprimer cette adresse ?',
        NAME_REQUIRED: 'Le nom est requis',
        LOCATION_REQUIRED: 'La localisation est requise',
    },
    COMMENT: {
        CREATE_SUCCESS: 'Commentaire ajouté !',
        DELETE_SUCCESS: 'Commentaire supprimé !',
        TEXT_REQUIRED: 'Le texte du commentaire est requis',
    },
    LOCATION: {
        PERMISSION_DENIED: 'Permission de localisation refusée',
        ERROR: 'Erreur lors de la récupération de la localisation',
    },
};

// ===== FIREBASE COLLECTIONS =====
export const COLLECTIONS = {
    USERS: 'users',
    ADDRESSES: 'addresses',
    COMMENTS: 'comments',
};

// ===== STORAGE PATHS =====
export const STORAGE_PATHS = {
    PROFILE_PHOTOS: 'profile_photos',
    ADDRESS_PHOTOS: 'address_photos',
    COMMENT_PHOTOS: 'comment_photos',
};

// ===== MAP CONFIG =====
export const MAP_CONFIG = {
    DEFAULT_LATITUDE: 48.8566, // Paris
    DEFAULT_LONGITUDE: 2.3522,
    DEFAULT_DELTA: 0.0922,
    MARKER_SIZE: 40,
};