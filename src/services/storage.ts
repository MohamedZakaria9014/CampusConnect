import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Uploads a local file URI (e.g., from expo-image-picker `file:///...`)
 * to Supabase Storage and returns a public web URL visible to all users.
 */
export async function uploadImageToSupabase(
  fileUri: string,
  bucket: string = 'posts',
  folderPath: string = 'post_images'
): Promise<string> {
  if (!fileUri) return '';
  // If it's already an HTTP/HTTPS public web URL, return as is
  if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
    return fileUri;
  }

  try {
    // 1. Generate unique file path
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt) ? fileExt : 'jpg';
    const filePath = `${folderPath}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

    let fileData: ArrayBuffer;

    // 2. Read file content safely across iOS / Android / Web (Expo SDK 54 FileSystem)
    if (fileUri.startsWith('file://') || fileUri.startsWith('ph://') || fileUri.startsWith('content://')) {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      fileData = decode(base64);
    } else {
      const response = await fetch(fileUri);
      fileData = await response.arrayBuffer();
    }

    const mimeType = cleanExt === 'png' ? 'image/png' : cleanExt === 'webp' ? 'image/webp' : 'image/jpeg';

    // 3. Upload to Supabase Storage bucket
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error(`Supabase storage upload error (bucket: ${bucket}):`, error.message);
      return fileUri;
    }

    // 4. Retrieve Public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    console.log('Successfully uploaded image to Supabase Storage:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error('Error in uploadImageToSupabase:', err);
    return fileUri;
  }
}
