import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      // Use signInWithPassword instead of querying your custom table
      console.log(email, password);
      console.log('hi')
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      if (session) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      Alert.alert('Success', 'Password reset instructions have been sent to your email.');
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
          <Text className="text-white text-4xl font-bold mb-4 text-center">Welcome To SerenIQ</Text>
          <Text className="text-gray-400 text-lg mb-10 text-center">Sign in to continue</Text>

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
              placeholder="••••••••"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            <TouchableOpacity 
              className="mt-2" 
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text className="text-primary text-right font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            className={`bg-primary py-4 rounded-lg shadow-md shadow-primary/50 ${loading ? 'opacity-50' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-background text-center font-bold text-lg">
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/register')}
              disabled={loading}
            > 
              <Text className="text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}