// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { User as UserIcon, Bell, CreditCard, Shield, CircleHelp as HelpCircle, Moon, Fingerprint, LogOut, ChevronRight, Wallet } from 'lucide-react-native';
import { useAuth } from '@/context/authContext'; // Import useAuth

export default function ProfilePage() {
  const { user, logout: contextLogout, isLoading: authLoading } = useAuth(); // Get user, logout, and loading state

  // Mock states for preference switches - you'd manage these with global state or settings persistence
  const [isDarkMode, setIsDarkMode] = useState(true); // Assuming dark mode is default
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await contextLogout();
            // Navigation to login is handled by LayoutController in _layout.tsx
            // but good to explicitly route if needed, or ensure context update triggers it.
            // router.replace('/(auth)/login'); // This might be redundant if LayoutController handles it well
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (authLoading && !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    // This case should ideally be handled by the LayoutController redirecting to login.
    // If it reaches here, it means something unexpected happened or user was cleared without redirect.
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>User not found. Please login.</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Use a placeholder avatar if `user.avatarUrl` is not available
  // You should add `avatarUrl` to your `AuthUser` type in AuthContext and backend User type if you want to store it
  const avatarUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'U')}+${encodeURIComponent(user.lastName || 'N')}&background=8e44ad&color=fff&size=128`;
  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User Name';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <UserIcon color="#8e44ad" size={32} />
        <Text style={styles.title}>Profile</Text>
      </View>

      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => router.push('/profile/edit')} // Make sure this screen exists and is set up
      >
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{displayName}</Text>
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
            onValueChange={setIsDarkMode} // TODO: Implement actual theme switching
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
            onValueChange={setNotificationsEnabled} // TODO: Implement actual notification preference saving
            trackColor={{ false: '#666', true: '#8e44ad' }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Fingerprint color="#8e44ad" size={24} />
            <Text style={styles.settingText}>Biometric Authentication</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={setBiometricEnabled} // TODO: Implement actual biometric setup
            trackColor={{ false: '#666', true: '#8e44ad' }}
            thumbColor="#fff"
          />
        </View>
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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
  scrollContent: {
    paddingBottom: 30, // Ensure content doesn't hide behind tab bar
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#8e44ad',
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60, // Adjust for status bar
    paddingBottom: 10,
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
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333', // Fallback background for avatar
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
    paddingHorizontal: 20,
    marginBottom: 20,
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
    paddingVertical: 18, // Increased padding
    paddingHorizontal: 16,
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
    marginHorizontal: 20,
    marginTop: 10, // Adjusted margin
    marginBottom: 20,
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