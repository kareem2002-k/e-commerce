import supabase from '../lib/supabase';
import crypto from 'crypto';

const BUCKET_NAME = 'product-images';

/**
 * Uploads a file to Supabase Storage
 * @param file Base64 encoded file data (with data URI scheme)
 * @param fileName Original file name for extension extraction
 * @returns URL of the uploaded file
 */
export async function uploadImage(fileData: string, fileName: string): Promise<string> {
  try {
    // Ensure the bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (bucketError && bucketError.message.includes('does not exist')) {
      // Create bucket if it doesn't exist
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
    }

    // Extract file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Create a unique file name
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const uniqueFileName = `${uniqueId}.${fileExtension}`;
    const filePath = `${uniqueFileName}`;
    
    // Remove the data URI scheme part if present
    let base64Data = fileData;
    if (fileData.includes('base64,')) {
      base64Data = fileData.split('base64,')[1];
    }
    
    // Convert base64 to binary
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: `image/${fileExtension}`,
        upsert: false
      });
      
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
      
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }
} 