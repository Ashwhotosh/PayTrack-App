// app/profile/security.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { 
  Shield,
  Lock,
  Fingerprint,
  Smartphone,
  Key
} from 'lucide-react-native';

export default function SecurityPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Shield color="#8e44ad" size={32} />
        <Text style={styles.title}>Security Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Fingerprint color="#8e44ad" size={24} />
            <View>
              <Text style={styles.settingText}>Biometric Login</Text>
              <Text style={styles.settingDescription}>Use fingerprint or face ID to login</Text>
            </View>
          </View>
          <Switch 
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#666', true: '#8e44ad' }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Smartphone color="#8e44ad" size={24} />
            <View>
              <Text style={styles.settingText}>Two-Factor Authentication</Text>
              <Text style={styles.settingDescription}>Secure your account with 2FA</Text>
            </View>
          </View>
          <Switch 
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: '#666', true: '#8e44ad' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Password & PIN</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Lock color="#8e44ad" size={24} />
          <View style={styles.menuInfo}>
            <Text style={styles.menuText}>Change Password</Text>
            <Text style={styles.menuDescription}>Last changed 3 months ago</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Key color="#8e44ad" size={24} />
          <View style={styles.menuInfo}>
            <Text style={styles.menuText}>Change Transaction PIN</Text>
            <Text style={styles.menuDescription}>Required for all transactions</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Security</Text>
        <View style={styles.securityInfo}>
          <Text style={styles.securityText}>Last login: Today, 10:30 AM</Text>
          <Text style={styles.securityText}>Device: iPhone 12 Pro</Text>
          <Text style={styles.securityText}>Location: Mumbai, India</Text>
        </View>
        <TouchableOpacity style={styles.logoutAllButton}>
          <Text style={styles.logoutAllText}>Logout from all devices</Text>
        </TouchableOpacity>
      </View>
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
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  menuDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  securityInfo: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  logoutAllButton: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutAllText: {
    fontSize: 16,
    color: '#FF5252',
    fontFamily: 'Inter-SemiBold',
  },
});