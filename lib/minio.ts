import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'car-images';

export async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      
      // Set bucket policy to public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

export async function uploadImage(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    await ensureBucketExists();
    
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    await minioClient.putObject(bucketName, uniqueFileName, file, file.length, {
      'Content-Type': contentType,
    });

    const endpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'http://localhost:9000';
    return `${endpoint}/${bucketName}/${uniqueFileName}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await minioClient.removeObject(bucketName, fileName);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export { minioClient, bucketName };
