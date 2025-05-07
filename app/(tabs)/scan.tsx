// app/(tabs)/scan.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera'; // Camera should be imported if Camera.requestCameraPermissionsAsync is used.
import { router, useFocusEffect } from 'expo-router'; // Import useFocusEffect
import { QrCode, X as XIcon, Camera as FlipCamera } from 'lucide-react-native';
import { useCallback } from 'react'; // Import useCallback

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Use useFocusEffect to reset 'scanned' state when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setScanned(false); // Allow scanning when the screen is focused
      return () => {
        // Optional: cleanup if needed when screen loses focus,
        // for this simple case, not much is needed here.
        // setScanned(true); // You might want to set it to true if you only want one scan per focus.
      };
    }, [])
  );

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) { // Check if already processed a scan in this focus session or if an alert is up
      return;
    }
    setScanned(true); // Mark as scanned to prevent multiple triggers immediately

    const upiMatch = data.match(/pa=([^&]+)/);
    const upiId = upiMatch && upiMatch[1] ? decodeURIComponent(upiMatch[1]) : null;

    if (upiId) {
      router.push({
        pathname: '/upi-payment',
        params: { upiId }
      });
      // 'scanned' will be reset by useFocusEffect if the user navigates back
    } else {
      console.log(`Bar code with type ${type} and data ${data} has been scanned, but no UPI ID found.`);
      Alert.alert(
        "Invalid QR Code",
        "The scanned QR code does not appear to be a valid UPI QR code. Please try a different one.",
        [{ text: "OK", onPress: () => setScanned(false) }] // Allow another scan immediately after dismissing alert
      );
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
        <Text style={styles.message}>No access to camera. Please enable it in settings.</Text>
      </View>
    );
  }

  const CameraComponent = () => (
    <CameraView
      style={styles.camera}
      facing={facing}
      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <QrCode color="#8e44ad" size={32} />
        <Text style={styles.title}>Scan & Pay</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraComponent />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setFacing(prevFacing => prevFacing === 'back' ? 'front' : 'back')}
        >
          <FlipCamera color="#fff" size={24} />
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            // setScanned(false); // Not strictly needed here as useFocusEffect will handle reset on return
            router.back();
          }}
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
    paddingTop: Platform.OS === 'android' ? 40 : 60,
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
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#8e44ad',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'Inter-Regular',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    gap: 20,
  },
  controlButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
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