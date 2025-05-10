import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUrl } from '@/utils';

interface UploadedImage {
  url: string;
  altText: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();

  const uploadImage = async (file: File, altText: string = ''): Promise<UploadedImage | null> => {
    if (!token) {
      setError(new Error('Authentication token is required'));
      return null;
    }

    try {
      setUploading(true);
      setError(null);

      // Convert the file to base64
      const base64 = await fileToBase64(file);
      const API_URL = getUrl();
      const response = await fetch(`${API_URL}/uploads/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileData: base64,
          fileName: file.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error uploading image');
      }

      const data = await response.json();
      return {
        url: data.imageUrl,
        altText: altText || file.name.split('.')[0] // Use filename as alt text if none provided
      };
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Unknown upload error');
      setError(uploadError);
      console.error('Error uploading image:', uploadError);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Function to upload multiple images
  const uploadImages = async (files: File[], altTexts: string[] = []): Promise<UploadedImage[]> => {
    if (!token) {
      setError(new Error('Authentication token is required'));
      return [];
    }

    try {
      setUploading(true);
      setError(null);

      const results = await Promise.all(
        files.map((file, i) => uploadImage(file, altTexts[i] || ''))
      );

      return results.filter((r): r is UploadedImage => r !== null);
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Unknown upload error');
      setError(uploadError);
      console.error('Error uploading images:', uploadError);
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return {
    uploadImage,
    uploadImages,
    uploading,
    error
  };
} 