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
    console.log('Deleting image with URL:', imageUrl);
    
    // Extract filename from URL
    // URL format: https://minio-api.nasfong.site/car-images/cars/123456-abc.jpg
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    
    // Remove leading slash and bucket name from pathname
    // pathname: /car-images/cars/123456-abc.jpg -> cars/123456-abc.jpg
    const pathParts = pathname.split('/').filter(part => part !== '');
    
    // Find the bucket name and get everything after it
    const bucketName = process.env.MINIO_BUCKET_NAME || 'car-images';
    const bucketIndex = pathParts.indexOf(bucketName);
    
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      // Get everything after the bucket name
      const fileName = pathParts.slice(bucketIndex + 1).join('/');
      console.log('Extracted filename for deletion:', fileName);
      
      if (fileName) {
        await deleteFromMinio(fileName);
        console.log('Successfully deleted from MinIO:', fileName);
      }
    } else {
      console.error('Could not extract filename from URL:', imageUrl);
      throw new Error('Invalid image URL format');
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
    console.log('Deleting video with URL:', videoUrl);
    
    // Extract filename from URL
    // URL format: https://minio-api.nasfong.site/car-images/cars/123456-abc.mp4
    const url = new URL(videoUrl);
    const pathname = url.pathname;
    
    // Remove leading slash and bucket name from pathname
    // pathname: /car-images/cars/123456-abc.mp4 -> cars/123456-abc.mp4
    const pathParts = pathname.split('/').filter(part => part !== '');
    
    // Find the bucket name and get everything after it
    const bucketName = process.env.MINIO_BUCKET_NAME || 'car-images';
    const bucketIndex = pathParts.indexOf(bucketName);
    
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      // Get everything after the bucket name
      const fileName = pathParts.slice(bucketIndex + 1).join('/');
      console.log('Extracted filename for deletion:', fileName);
      
      if (fileName) {
        await deleteFromMinio(fileName);
        console.log('Successfully deleted from MinIO:', fileName);
      }
    } else {
      console.error('Could not extract filename from URL:', videoUrl);
      throw new Error('Invalid video URL format');
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}
