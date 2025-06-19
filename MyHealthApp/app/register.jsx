import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Registration successful! Please check your email to confirm your account.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center p-6"
      >
        <View className="w-full max-w-sm">
          <Text className="text-white text-4xl font-bold mb-4 text-center">Create Account</Text>
          <Text className="text-gray-400 text-lg mb-10 text-center">Sign up to get started</Text>

          <View className="mb-6">
            <Text className="text-gray-300 text-sm font-semibold mb-2">Email Address</Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg text-base focus:border-primary focus:border-2"
              placeholder="you@example.com"
              placeholderTextColor="#6b7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View className="mb-8">
            <Text className="text-gray-300 text-sm font-semibold mb-2">Password</Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg text-base focus:border-primary focus:border-2"
              placeholder="Create a password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className={`bg-primary py-4 rounded-lg shadow-md shadow-primary/50 ${loading ? 'opacity-50' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-background text-center font-bold text-lg">
              {loading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.replace('/')}
              disabled={loading}
            >
              <Text className="text-primary font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>);
}