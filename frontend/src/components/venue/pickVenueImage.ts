import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    if (!asset || asset.width <= 0 || asset.height <= 0) {
      Alert.alert('Không đọc được ảnh', 'Vui lòng chọn ảnh khác.');
      return null;
    }

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

    Alert.alert('Không thể xử lý ảnh', 'Vui lòng chọn ảnh khác rồi thử lại.');
    return null;
  } catch {
    Alert.alert('Không thể xử lý ảnh', 'Vui lòng chọn ảnh khác rồi thử lại.');
    return null;
  }
}
