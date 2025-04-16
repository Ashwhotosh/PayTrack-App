// app/profile/_layout.tsx
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  // This Stack navigator will manage all screens within app/profile/*
  // You can customize screen options here if needed
  return <Stack screenOptions={{ headerShown: false }} />;
}
