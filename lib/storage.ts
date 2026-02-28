import { uploadToMinio, deleteFromMinio, generateFileName } from './minio';
import sharp from 'sharp';

/**
 * Extract the MinIO object key (path after bucket name) from a public URL.
 * URL format: https://minio-api.nasfong.com/car-images/cars/123456-abc.webp
 */
function extractMinioKey(fileUrl: string): string {
  const url = new URL(fileUrl);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const bucketName = process.env.MINIO_BUCKET_NAME || 'car-images';
  const bucketIndex = pathParts.indexOf(bucketName);

  if (bucketIndex === -1 || bucketIndex >= pathParts.length - 1) {
    throw new Error(`Invalid MinIO URL format: ${fileUrl}`);
  }

  return pathParts.slice(bucketIndex + 1).join('/');
}

/**
 * Save image to MinIO object storage with WebP conversion.
 * Images are resized to max 1920px and converted to WebP for optimal web delivery.
 */
export async function saveImage(
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    const webpBuffer = await sharp(file)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true, // Never upscale
      })
      .webp({
        quality: 80,          // Good quality with better compression than 90
        effort: 3,            // Balanced compression effort (0-6)
        smartSubsample: true, // Better chroma subsampling
      })
      .toBuffer();

    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const webpFileName = `${nameWithoutExt}.webp`;
    const uniqueFileName = generateFileName(webpFileName);
    const url = await uploadToMinio(webpBuffer, uniqueFileName, 'image/webp');
    return url;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

/**
 * Save video to MinIO object storage.
 */
export async function saveVideo(
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/avi',
      'webm': 'video/webm',
      'mkv': 'video/x-matroska',
    };
    const contentType = contentTypeMap[ext ?? 'mp4'] ?? 'video/mp4';
    const uniqueFileName = generateFileName(fileName);
    const url = await uploadToMinio(file, uniqueFileName, contentType);
    return url;
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
}

/**
 * Delete image from MinIO object storage.
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const key = extractMinioKey(imageUrl);
    console.log('Deleting image from MinIO:', key);
    await deleteFromMinio(key);
    console.log('Successfully deleted image from MinIO:', key);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Delete video from MinIO object storage.
 */
export async function deleteVideo(videoUrl: string): Promise<void> {
  try {
    const key = extractMinioKey(videoUrl);
    console.log('Deleting video from MinIO:', key);
    await deleteFromMinio(key);
    console.log('Successfully deleted video from MinIO:', key);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}
