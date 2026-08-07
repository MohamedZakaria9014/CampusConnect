import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressionResult {
  uri: string;
  width: number;
  height: number;
}

/**
 * Resizes and compresses image to optimized web/mobile size (max 1200px width/height, 0.7 compression quality)
 */
export async function compressImage(uri: string): Promise<CompressionResult> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.warn('Image compression fallback to original URI:', error);
    return { uri, width: 800, height: 600 };
  }
}
