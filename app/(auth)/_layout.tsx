import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.content,
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#1a1a1a',
  },
});