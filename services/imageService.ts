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
            throw new Error('Failed to convert image to base64');
        }

        return `data:image/jpeg;base64,${manipulatedImage.base64}`;
    } catch (error) {
        console.error('Error converting image to base64:', error);
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
        console.error('Error converting multiple images:', error);
        throw error;
    }
};

export const getBase64Size = (base64String: string): number => {
    // Enlever le préfixe data:image/...;base64,
    const base64 = base64String.split(',')[1] || base64String;
    // Calculer la taille en bytes
    const bytes = (base64.length * 3) / 4;
    // Convertir en KB
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

    while (attempts < maxAttempts) {
        base64Image = await convertImageToBase64(uri, width, quality);

        if (validateImageSize(base64Image, maxSizeKB)) {
            return base64Image;
        }

        quality -= 0.15;
        width -= 150;
        attempts++;

        if (quality <= 0.1 || width <= 200) {
            throw new Error('Impossible de compresser l\'image à la taille requise');
        }
    }

    throw new Error('Impossible de compresser l\'image après plusieurs tentatives');
};

export const getMimeType = (base64String: string): string => {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,/);
    if (matches && matches.length >= 2) {
        return matches[1];
    }
    return 'image/jpeg';
};