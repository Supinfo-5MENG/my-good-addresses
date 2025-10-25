import * as ImageManipulator from 'expo-image-manipulator';

export const convertImageToBase64 = async (
    uri: string,
    maxWidth: number = 800,
    quality: number = 0.7
): Promise<string> => {
    try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: maxWidth } }],
            {
                compress: quality,
                format: ImageManipulator.SaveFormat.JPEG,
                base64: true,
            }
        );

        if (!manipulatedImage.base64) {
            throw new Error('Échec de la conversion en base64');
        }

        return `data:image/jpeg;base64,${manipulatedImage.base64}`;
    } catch (error) {
        console.error('Erreur lors de la conversion en base64:', error);
        throw error;
    }
};

export const convertMultipleImagesToBase64 = async (
    uris: string[],
    maxWidth: number = 600,
    quality: number = 0.6
): Promise<string[]> => {
    try {
        const promises = uris.map(uri => convertImageToBase64(uri, maxWidth, quality));
        return await Promise.all(promises);
    } catch (error) {
        console.error('Erreur lors de la conversion multiple:', error);
        throw error;
    }
};

export const getBase64Size = (base64String: string): number => {
    const base64 = base64String.split(',')[1] || base64String;
    const bytes = (base64.length * 3) / 4;

    return Math.round(bytes / 1024);
};

export const validateImageSize = (base64String: string, maxSizeKB: number = 500): boolean => {
    const sizeKB = getBase64Size(base64String);
    return sizeKB <= maxSizeKB;
};

export const compressImageToSize = async (
    uri: string,
    maxSizeKB: number = 500
): Promise<string> => {
    let quality = 0.8;
    let width = 800;
    let base64Image = '';
    let attempts = 0;
    const maxAttempts = 5;

    console.log(`Compression de l'image, taille cible: ${maxSizeKB}KB`);

    while (attempts < maxAttempts) {
        base64Image = await convertImageToBase64(uri, width, quality);
        const currentSize = getBase64Size(base64Image);

        console.log(`Tentative ${attempts + 1}: ${currentSize}KB (q:${quality}, w:${width})`);

        if (currentSize <= maxSizeKB) {
            console.log(`✅ Compression réussie: ${currentSize}KB`);
            return base64Image;
        }

        quality = Math.max(0.1, quality - 0.15);
        width = Math.max(200, width - 150);
        attempts++;
    }

    const finalSize = getBase64Size(base64Image);
    console.warn(`⚠️ Impossible d'atteindre la taille cible. Taille finale: ${finalSize}KB`);

    return base64Image;
};

export const getMimeType = (base64String: string): string => {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,/);
    if (matches && matches.length >= 2) {
        return matches[1];
    }
    return 'image/jpeg';
};

export const optimizeProfileImage = async (uri: string): Promise<string> => {
    return compressImageToSize(uri, 200); // 200KB max pour les photos de profil
};

export const optimizeAddressImage = async (uri: string): Promise<string> => {
    return compressImageToSize(uri, 400); // 400KB max pour les photos d'adresses
};

export const optimizeCommentImages = async (uris: string[]): Promise<string[]> => {
    const limitedUris = uris.slice(0, 3); // Max 3 images
    const promises = limitedUris.map(uri => compressImageToSize(uri, 300)); // 300KB par image
    return Promise.all(promises);
};

export const isValidBase64Image = (str: string): boolean => {
    if (!str) return false;

    const regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    if (!regex.test(str)) return false;

    try {
        const base64 = str.split(',')[1];
        if (!base64) return false;

        return /^[A-Za-z0-9+/]*={0,2}$/.test(base64);
    } catch {
        return false;
    }
};

export const getImageExtension = (base64String: string): string => {
    const mimeType = getMimeType(base64String);
    const extension = mimeType.split('/')[1];
    return extension === 'jpeg' ? 'jpg' : extension;
};