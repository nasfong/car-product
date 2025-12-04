import { uploadToMinio, deleteFromMinio, generateFileName } from './minio';

/**
 * Save image to MinIO object storage
 */
export async function saveImage(
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    // Determine content type from file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext || 'jpg'] || 'image/jpeg';

    // Generate unique filename with cars/ prefix
    const uniqueFileName = generateFileName(fileName);
    
    // Upload to MinIO and return public URL
    const url = await uploadToMinio(file, uniqueFileName, contentType);
    
    return url;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

/**
 * Delete image from MinIO object storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    // URL format: https://minio-api.nasfong.site/car-images/cars/123456-abc.jpg
    const urlParts = imageUrl.split('/');
    const fileName = urlParts.slice(-2).join('/'); // cars/123456-abc.jpg
    
    if (fileName) {
      await deleteFromMinio(fileName);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
