/**
 * Storage Module
 * Handles file storage for the application
 */

export { uploadToBlob, uploadProductImage, deleteFromBlob, listBlobFiles, isBlobConfigured } from './blob';
export type { UploadResult } from './blob';
