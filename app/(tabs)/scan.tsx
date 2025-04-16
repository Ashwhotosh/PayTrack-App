import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { QrCode, Flashlight } from 'lucide-react-native';

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torch, setTorch] = useState<'on' | 'off'>('off');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // TODO: Implement QR code payment logic
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const toggleTorch = () => {
    setTorch(current => (current === 'on' ? 'off' : 'on'));
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <QrCode color="#8e44ad" size={32} />
          <Text style={styles.title}>Scan & Pay</Text>
        </View>
        <View style={styles.webPlaceholder}>
          <Text style={styles.webText}>QR Scanner is not available on web.</Text>
          <Text style={styles.webSubtext}>Please use the mobile app to scan and pay.</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
      </View>
    );
  }

  const CameraComponent = Platform.select({
    native: () => (
      <CameraView
        style={styles.camera}
        type="back"
        onBarCodeScanned={handleBarCodeScanned}
        torch={torch}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanText}>Align QR code within frame</Text>
          
          <TouchableOpacity 
            style={styles.torchButton}
            onPress={toggleTorch}
          >
            <Flashlight color={torch === 'on' ? '#8e44ad' : '#fff'} size={24} />
            <Text style={[styles.buttonText, torch === 'on' && styles.activeButtonText]}>
              {torch === 'on' ? 'Torch On' : 'Torch Off'}
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    ),
    default: () => null,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <QrCode color="#8e44ad" size={32} />
        <Text style={styles.title}>Scan & Pay</Text>
      </View>

      <View style={styles.cameraContainer}>
        {CameraComponent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    gap: 12,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Inter-Regular',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    margin: 20,
    borderRadius: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#8e44ad',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'Inter-Regular',
  },
  torchButton: {
    backgroundColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  activeButtonText: {
    color: '#8e44ad',
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  webSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
});