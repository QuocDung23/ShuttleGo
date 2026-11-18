import { Alert } from 'react-native';

const MAX_BASE64_LENGTH = 400_000;
const MAX_SOURCE_SIDE = 2048;

function centerCrop(width: number, height: number, aspectRatio: number) {
  if (width / height > aspectRatio) {
    const cropWidth = Math.floor(height * aspectRatio);
    return {
      originX: Math.floor((width - cropWidth) / 2),
      originY: 0,
      width: cropWidth,
      height,
    };
  }

  const cropHeight = Math.floor(width / aspectRatio);
  return {
    originX: 0,
    originY: Math.floor((height - cropHeight) / 2),
    width,
    height: cropHeight,
  };
}

export async function pickVenueImage(options: {
  aspect: [number, number];
  width: number;
}) {
  try {
    const ImagePicker = await import('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: options.aspect,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) return null;

    const asset = result.assets?.[0];
    if (!asset) return null;

    // Try using ImageManipulator if the native module is linked in the runtime
    try {
      const manipulatorModule = await import('expo-image-manipulator');
      const ImageManipulator = manipulatorModule.ImageManipulator;
      const SaveFormat = manipulatorModule.SaveFormat;

      if (ImageManipulator && asset.width > 0 && asset.height > 0) {
        const sourceScale = Math.min(1, MAX_SOURCE_SIDE / Math.max(asset.width, asset.height));
        const sourceWidth = Math.max(1, Math.round(asset.width * sourceScale));
        const sourceHeight = Math.max(1, Math.round(asset.height * sourceScale));
        const aspectRatio = options.aspect[0] / options.aspect[1];
        const crop = centerCrop(sourceWidth, sourceHeight, aspectRatio);
        const outputWidths = [options.width, Math.round(options.width * 0.75), Math.round(options.width * 0.5)];
        const compressionLevels = [0.82, 0.68, 0.54];

        for (const outputWidth of outputWidths) {
          const context = ImageManipulator.manipulate(asset.uri, {
            maxWidth: MAX_SOURCE_SIDE,
            maxHeight: MAX_SOURCE_SIDE,
          });
          try {
            context.crop(crop).resize({
              width: outputWidth,
              height: Math.round(outputWidth / aspectRatio),
            });
            const renderedImage = await context.renderAsync();
            try {
              for (const compress of compressionLevels) {
                const processed = await renderedImage.saveAsync({
                  format: SaveFormat.JPEG,
                  compress,
                  base64: true,
                });
                const base64 = processed.base64;
                if (base64 && base64.length <= MAX_BASE64_LENGTH) {
                  return `data:image/jpeg;base64,${base64}`;
                }
              }
            } finally {
              renderedImage.release();
            }
          } finally {
            context.release();
          }
        }
      }
    } catch {
      // expo-image-manipulator native module not linked or not supported, fallback below
    }

    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }
    return asset.uri;
  } catch {
    Alert.alert('Không thể chọn ảnh', 'Vui lòng thử lại sau.');
    return null;
  }
}
