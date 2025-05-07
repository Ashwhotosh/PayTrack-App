// app/profile/edit.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Camera, ChevronDown, Calendar, Briefcase } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface ProfileFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  profession: string;
  monthlyIncome: string;
  profilePicture: string | null;
}

export default function EditProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: 'Alex',
    middleName: '',
    lastName: 'Johnson',
    gender: 'Male',
    dateOfBirth: '',
    profession: '',
    monthlyIncome: '',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  });

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setFormData(prev => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update profile
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Complete Your Profile</Text>
      </View>

      <Text style={styles.subtitle}>
        Please fill in your profile details to personalize your experience.
      </Text>

      <View style={styles.imageContainer}>
        <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
          {formData.profilePicture ? (
            <Image source={{ uri: formData.profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <View style={styles.cameraButton}>
            <Camera color="#fff" size={20} />
          </View>
        </TouchableOpacity>
        <Text style={styles.uploadText}>Click to upload profile picture</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              placeholder="First name"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Middle Name (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.middleName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, middleName: text }))}
              placeholder="Middle name"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            placeholder="Last name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>{formData.gender || 'Select gender'}</Text>
              <ChevronDown color="#666" size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Calendar color="#666" size={20} />
              <Text style={styles.selectButtonText}>Select date</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Profession</Text>
          <TouchableOpacity style={styles.selectButton}>
            <Briefcase color="#666" size={20} />
            <Text style={styles.selectButtonText}>Select Profession</Text>
            <ChevronDown color="#666" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Monthly Income</Text>
          <TextInput
            style={styles.input}
            value={formData.monthlyIncome}
            onChangeText={(text) => setFormData(prev => ({ ...prev, monthlyIncome: text }))}
            placeholder="Monthly income"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
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
    gap: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2a2a2a',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#8e44ad',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  form: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  selectButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectButtonText: {
    flex: 1,
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  saveButton: {
    backgroundColor: '#8e44ad',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});