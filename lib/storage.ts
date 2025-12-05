import { uploadToMinio, deleteFromMinio, generateFileName } from './minio';
import sharp from 'sharp';

/**
 * Save image to MinIO object storage with WebP conversion
 * Standard resolution with high quality
 */
export async function saveImage(
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    // Convert image to WebP format - better performance without quality loss
    const webpBuffer = await sharp(file)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(1920, 1920, { 
        fit: 'inside', 
        withoutEnlargement: true // Never upscale, only downscale if too large
      }) // Max Full HD resolution (1920px) - standard for web
      .webp({ 
        quality: 90,      // High quality - excellent for web
        effort: 3,        // Balanced compression effort
        smartSubsample: true // Better color handling
      })
      .toBuffer();

    // Change extension to .webp
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const webpFileName = `${nameWithoutExt}.webp`;
    
    // Generate unique filename with cars/ prefix
    const uniqueFileName = generateFileName(webpFileName);
    
    // Upload to MinIO and return public URL
    const url = await uploadToMinio(webpBuffer, uniqueFileName, 'image/webp');
    
    return url;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

/**
 * Save video to MinIO object storage
 */
export async function saveVideo(
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    // Determine content type from file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/avi',
      'webm': 'video/webm',
      'mkv': 'video/x-matroska',
    };
    const contentType = contentTypeMap[ext || 'mp4'] || 'video/mp4';

    // Generate unique filename with cars/ prefix
    const uniqueFileName = generateFileName(fileName);
    
    // Upload to MinIO and return public URL
    const url = await uploadToMinio(file, uniqueFileName, contentType);
    
    return url;
  } catch (error) {
    console.error('Error saving video:', error);
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

/**
 * Delete video from MinIO object storage
 */
export async function deleteVideo(videoUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    // URL format: https://minio-api.nasfong.site/car-images/cars/123456-abc.mp4
    const urlParts = videoUrl.split('/');
    const fileName = urlParts.slice(-2).join('/'); // cars/123456-abc.mp4
    
    if (fileName) {
      await deleteFromMinio(fileName);
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}
