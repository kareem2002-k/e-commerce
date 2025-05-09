import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImagesUploaded: (images: { url: string; altText: string }[]) => void;
  maxImages?: number;
  existingImages?: { url: string; altText: string }[];
  label?: string;
}

export function ImageUploader({
  onImagesUploaded,
  maxImages = 5,
  existingImages = [],
  label = 'Upload Images'
}: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; altText: string }[]>(existingImages);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImages, uploading, error } = useImageUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Check if adding new files would exceed the limit
      if (uploadedImages.length + newFiles.length > maxImages) {
        alert(`You can only upload a maximum of ${maxImages} images.`);
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Generate previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPreviews(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    const images = await uploadImages(selectedFiles);
    if (images.length > 0) {
      const newImages = [...uploadedImages, ...images];
      setUploadedImages(newImages);
      onImagesUploaded(newImages);
      setSelectedFiles([]);
      setPreviews([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{label}</label>
        
        {/* Display uploaded images */}
        <div className="flex flex-wrap gap-2 mb-2">
          {uploadedImages.map((image, index) => (
            <div key={`uploaded-${index}`} className="relative group w-24 h-24">
              <img
                src={image.url}
                alt={image.altText}
                className="w-full h-full object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removeUploadedImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Display previews of images to be uploaded */}
        <div className="flex flex-wrap gap-2 mb-2">
          {previews.map((preview, index) => (
            <div key={`preview-${index}`} className="relative group w-24 h-24">
              <img
                src={preview}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover rounded-md border border-dashed"
              />
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Upload form */}
        <div className="flex flex-col gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
            id="image-upload"
          />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || uploadedImages.length >= maxImages}
              className="flex items-center gap-2"
            >
              <ImageIcon size={18} />
              Select Images
            </Button>
            
            <Button 
              type="button"
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload
                </>
              )}
            </Button>
          </div>
          
          {uploadedImages.length > 0 && (
            <p className="text-xs text-gray-500">
              {uploadedImages.length} of {maxImages} images uploaded
            </p>
          )}
          
          {error && (
            <p className="text-xs text-red-500">{error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
} 