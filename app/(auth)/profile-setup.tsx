// app/(auth)/profile-setup.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { router } from 'expo-router';
import { CircleUser as UserCircle2, Briefcase, Calendar, CreditCard } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { format } from 'date-fns';

type Gender = 'male' | 'female' | 'other';

const professions = [
  'Software Engineer',
  'Doctor',
  'Teacher',
  'Business Owner',
  'Designer',
  'Marketing Professional',
  'Student',
  'Other'
];

export default function ProfileSetupPage() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profession, setProfession] = useState('');
  const [income, setIncome] = useState('');
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const handleComplete = () => {
    // TODO: Implement profile setup logic
    router.replace('/(tabs)');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          onChange={(e) => setDob(new Date(e.target.value))}
          style={{
            backgroundColor: '#2a2a2a',
            border: 'none',
            borderRadius: 12,
            padding: 16,
            color: '#fff',
            fontSize: 16,
            fontFamily: 'Inter-Regular',
            width: '100%'
          }}
        />
      );
    }

    return (
      <>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar color="#666" size={20} />
          <Text style={styles.selectButtonText}>
            {dob ? format(dob, 'dd/MM/yyyy') : 'Select date'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <UserCircle2 color="#8e44ad" size={48} />
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowGenderDropdown(true)}
          >
            <Text style={styles.selectButtonText}>
              {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Select gender'}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showGenderDropdown}
            transparent
            animationType="slide"
            onRequestClose={() => setShowGenderDropdown(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              onPress={() => setShowGenderDropdown(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Gender</Text>
                {(['male', 'female', 'other'] as Gender[]).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => {
                      setGender(option);
                      setShowGenderDropdown(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          {renderDatePicker()}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Profession</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowProfessionDropdown(true)}
          >
            <Briefcase color="#666" size={20} />
            <Text style={styles.selectButtonText}>
              {profession || 'Select Profession'}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showProfessionDropdown}
            transparent
            animationType="slide"
            onRequestClose={() => setShowProfessionDropdown(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              onPress={() => setShowProfessionDropdown(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Profession</Text>
                {professions.map((prof) => (
                  <TouchableOpacity
                    key={prof}
                    style={styles.modalOption}
                    onPress={() => {
                      setProfession(prof);
                      setShowProfessionDropdown(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{prof}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monthly Income</Text>
          <View style={styles.inputWithIcon}>
            <CreditCard color="#666" size={20} />
            <TextInput
              style={styles.inputIcon}
              placeholder="Enter your monthly income"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={income}
              onChangeText={setIncome}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Complete Setup</Text>
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
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 10,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  inputWithIcon: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  inputIcon: {
    flex: 1,
    padding: 15,
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
  button: {
    backgroundColor: '#8e44ad',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
});