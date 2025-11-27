import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
export function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

export async function saveImage(
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    ensureUploadDir();
    
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    
    fs.writeFileSync(filePath, file);

    return `/uploads/${uniqueFileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      const filePath = path.join(uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
