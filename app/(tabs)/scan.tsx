// app/(tabs)/scan.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { router } from 'expo-router';
import { QrCode, X as XIcon, Camera as FlipCamera } from 'lucide-react-native';

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<'front' | 'back'>('back');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Extract UPI ID from QR code data
    const upiMatch = data.match(/pa=([^&]+)/);
    const upiId = upiMatch ? decodeURIComponent(upiMatch[1]) : null;

    if (upiId) {
      router.push({
        pathname: '/upi-payment',
        params: { upiId }
      });
    } else {
      console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    }
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
        type={type}
        onBarCodeScanned={handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanText}>Align QR code within frame</Text>
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

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setType(type === 'back' ? 'front' : 'back')}
        >
          <FlipCamera color="#fff" size={24} />
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => router.back()}
        >
          <XIcon color="#fff" size={24} />
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  controlButton: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
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