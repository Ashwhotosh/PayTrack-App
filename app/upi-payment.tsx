import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { Camera } from 'expo-camera';
import { IndianRupee, QrCode, ArrowLeft, Send } from 'lucide-react-native';

interface UPIDetails {
  pa: string; // payee address (UPI ID)
  pn: string; // payee name
  tn: string; // transaction note
  am: string; // amount
}

export default function UPIPaymentScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [upiDetails, setUpiDetails] = useState<UPIDetails>({
    pa: '',
    pn: '',
    tn: '',
    am: '',
  });

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const parseUPIString = (data: string): UPIDetails | null => {
    try {
      const url = new URL(data);
      if (!url.protocol.includes('upi')) return null;

      const params = Object.fromEntries(url.searchParams);
      return {
        pa: params.pa || '',
        pn: params.pn || '',
        tn: params.tn || '',
        am: params.am || '',
      };
    } catch (e) {
      return null;
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    const details = parseUPIString(data);
    if (details) {
      setUpiDetails(details);
      setScanning(false);
    } else {
      Alert.alert('Invalid QR Code', 'Please scan a valid UPI QR code.');
    }
  };

  const constructUPIUrl = () => {
    const baseUrl = 'upi://pay';
    const params = new URLSearchParams({
      pa: upiDetails.pa,
      pn: upiDetails.pn || 'Recipient',
      tn: upiDetails.tn || 'Payment',
      am: upiDetails.am,
      cu: 'INR',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePayment = async () => {
    if (!upiDetails.pa || !upiDetails.am) {
      Alert.alert('Missing Details', 'Please provide UPI ID and amount.');
      return;
    }

    const url = constructUPIUrl();
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'No UPI App Found',
        'Please install a UPI-enabled payment app to proceed.'
      );
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>UPI Payment</Text>
        </View>
        <View style={styles.webMessage}>
          <Text style={styles.webText}>UPI payments are not available on web.</Text>
          <Text style={styles.webSubtext}>Please use the mobile app to make UPI payments.</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>UPI Payment</Text>
      </View>

      {scanning ? (
        <View style={styles.scannerContainer}>
          <Camera
            style={styles.scanner}
            type={Camera.Constants.Type.back}
            onBarCodeScanned={handleBarCodeScanned}
            barCodeScannerSettings={{
              barCodeTypes: ['qr'],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanText}>Align QR code within frame</Text>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => setScanning(true)}
          >
            <QrCode color="#fff" size={24} />
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Or Enter Details Manually</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UPI ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter UPI ID (e.g., name@upi)"
                placeholderTextColor="#666"
                value={upiDetails.pa}
                onChangeText={(text) => setUpiDetails(prev => ({ ...prev, pa: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountInput}>
                <IndianRupee color="#666" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={upiDetails.am}
                  onChangeText={(text) => setUpiDetails(prev => ({ ...prev, am: text }))}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Note (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Add a note"
                placeholderTextColor="#666"
                value={upiDetails.tn}
                onChangeText={(text) => setUpiDetails(prev => ({ ...prev, tn: text }))}
              />
            </View>

            <TouchableOpacity 
              style={styles.payButton}
              onPress={handlePayment}
            >
              <Send color="#fff" size={24} />
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    gap: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8e44ad',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 32,
    marginBottom: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  amountInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8e44ad',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  scannerContainer: {
    flex: 1,
    overflow: 'hidden',
    margin: 20,
    borderRadius: 20,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    fontFamily: 'Inter-Regular',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Inter-Regular',
  },
  webMessage: {
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