import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Uploads a local file URI (e.g., from expo-image-picker `file:///...`)
 * to Supabase Storage and returns a public web URL visible to all users.
 */
export async function uploadImageToSupabase(
  fileUri: string,
  bucket: string = 'avatars',
  folderPath: string = 'user_avatars'
): Promise<string> {
  // If it's already an HTTP/HTTPS public web URL, return as is
  if (!fileUri || fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
    return fileUri;
  }

  try {
    // 1. Generate unique file path
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${folderPath}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    let fileData: ArrayBuffer;

    // 2. Read file content safely across iOS / Android / Web (Expo SDK 54 legacy FileSystem)
    if (fileUri.startsWith('file://') || fileUri.startsWith('ph://')) {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      fileData = decode(base64);
    } else {
      const response = await fetch(fileUri);
      fileData = await response.arrayBuffer();
    }

    // 3. Upload to Supabase Storage bucket
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileData, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error.message);
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
