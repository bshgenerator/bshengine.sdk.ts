import { BshObject, BshConfigurations } from '@types';

export type StorageProvider = 'cloudinary';

export type CloudinaryConfig = {
    url: string;
    folder?: string;
}

export type StorageConfiguration = BshConfigurations & {
    enabled?: StorageProvider;
    cloudinary: CloudinaryConfig
}

export type BshFiles = {
    storageId: string;
    id: string;
    filename: string;
    mediaType: string;
    uri: string;
    secureUri: string;
    bytes: number;
    format: string;
    folder: string;
    width: number;
    height: number;
    tags: string[];
    context: { [key: string]: unknown };
    fileId: string;
} & BshObject

export type UploadOptions = {
    tags: string[]
    context: { [key: string]: unknown }
    [key: string]: unknown;
}

export type UploadResponse = {
    fileId: string
    publicId: string
    assetId: string
    uri: string
    secureUri: string
    tags: string[]
    context: { [key: string]: unknown }
}

export const formatFileSize = (file: BshFiles): string => {
    if (!file?.bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(file.bytes) / Math.log(1024));
    return Math.round(file.bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

