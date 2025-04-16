import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { User, Bell, CreditCard, Shield, CircleHelp as HelpCircle, Moon, Fingerprint, LogOut, ChevronRight, Wallet } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export default function ProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop',
    profession: 'Software Engineer',
    income: '₹150,000/month'
  };

  useEffect(() => {
    // Load saved preferences
    loadPreferences();
    // Check biometric support
    checkBiometricSupport();
  }, []);

  const loadPreferences = async () => {
    try {
      const darkMode = await AsyncStorage.getItem('darkMode');
      const notifications = await AsyncStorage.getItem('notifications');
      const biometric = await AsyncStorage.getItem('biometric');

      setIsDarkMode(darkMode === 'true');
      setNotificationsEnabled(notifications === 'true');
      setBiometricEnabled(biometric === 'true');
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const checkBiometricSupport = async () => {
    if (Platform.OS === 'web') {
      setBiometricSupported(false);
      return;
    }

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setBiometricSupported(false);
    }
  };

  const toggleDarkMode = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('darkMode', value.toString());
      setIsDarkMode(value);
      // Here you would typically update your app's theme
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      if (Platform.OS === 'web') {
        if (value && 'Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await AsyncStorage.setItem('notifications', 'true');
            setNotificationsEnabled(true);
          } else {
            setNotificationsEnabled(false);
          }
        }
      } else {
        await AsyncStorage.setItem('notifications', value.toString());
        setNotificationsEnabled(value);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const toggleBiometric = async (value: boolean) => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      if (value) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
        });

        if (result.success) {
          await AsyncStorage.setItem('biometric', 'true');
          setBiometricEnabled(true);
        } else {
          setBiometricEnabled(false);
        }
      } else {
        await AsyncStorage.setItem('biometric', 'false');
        setBiometricEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      setBiometricEnabled(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <User color="#8e44ad" size={32} />
        <Text style={styles.title}>Profile</Text>
      </View>

      <TouchableOpacity 
        style={styles.profileCard}
        onPress={() => router.push('/profile/edit')}
      >
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <ChevronRight color="#666" size={24} />
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Moon color="#8e44ad" size={24} />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch 
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#666', true: '#8e44ad' }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell color="#8e44ad" size={24} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch 
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#666', true: '#8e44ad' }}
            thumbColor="#fff"
          />
        </View>
        {Platform.OS !== 'web' && biometricSupported && (
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Fingerprint color="#8e44ad" size={24} />
              <Text style={styles.settingText}>Biometric Authentication</Text>
            </View>
            <Switch 
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: '#666', true: '#8e44ad' }}
              thumbColor="#fff"
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/wallet')}
        >
          <Wallet color="#8e44ad" size={24} />
          <Text style={styles.menuText}>My Wallet</Text>
          <ChevronRight color="#666" size={24} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/payment-methods')}
        >
          <CreditCard color="#8e44ad" size={24} />
          <Text style={styles.menuText}>Payment Methods</Text>
          <ChevronRight color="#666" size={24} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/security')}
        >
          <Shield color="#8e44ad" size={24} />
          <Text style={styles.menuText}>Security Settings</Text>
          <ChevronRight color="#666" size={24} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/help-support')}
        >
          <HelpCircle color="#8e44ad" size={24} />
          <Text style={styles.menuText}>Help & Support</Text>
          <ChevronRight color="#666" size={24} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <LogOut color="#FF5252" size={24} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    margin: 20,
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  email: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF5252',
    fontFamily: 'Inter-SemiBold',
  },
});