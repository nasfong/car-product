import { Client } from 'minio';

// MinIO client configuration
export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio-api.nasfong.site',
  port: parseInt(process.env.MINIO_PORT || '443'),
  useSSL: process.env.MINIO_USE_SSL === 'true' || true,
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'car-images';

/**
 * Initialize MinIO bucket
 */
export async function initializeBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      
      // Set bucket policy to public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    }
  } catch (err) {
    console.error('Error initializing bucket:', err);
    throw err;
  }
}

/**
 * Upload file to MinIO
 */
export async function uploadToMinio(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    // Ensure bucket exists before uploading
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await initializeBucket();
    }
    
    await minioClient.putObject(BUCKET_NAME, fileName, file, file.length, {
      'Content-Type': contentType,
    });
    
    // Return public URL
    return getMinioUrl(fileName);
  } catch (err) {
    console.error('Error uploading to MinIO:', err);
    throw err;
  }
}

/**
 * Delete file from MinIO
 */
export async function deleteFromMinio(fileName: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, fileName);
  } catch (err) {
    console.error('Error deleting from MinIO:', err);
    throw err;
  }
}

/**
 * Get public URL for MinIO object
 */
export function getMinioUrl(fileName: string): string {
  const endpoint = process.env.MINIO_ENDPOINT || 'minio-api.nasfong.site';
  const useSSL = process.env.MINIO_USE_SSL === 'true' || true;
  const protocol = useSSL ? 'https' : 'http';
  return `${protocol}://${endpoint}/${BUCKET_NAME}/${fileName}`;
}

/**
 * Generate unique filename
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const ext = originalName.split('.').pop();
  return `cars/${timestamp}-${random}.${ext}`;
}
