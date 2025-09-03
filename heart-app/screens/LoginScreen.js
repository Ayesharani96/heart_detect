import React, { useState } from 'react';
import {
  StyleSheet, Text, TextInput, View, TouchableOpacity, Alert,
  ScrollView, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.13:5000';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email: email.trim().toLowerCase(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      const { token, user } = response.data;

      // Save token and user
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      // Navigate to Home with user data
      navigation.replace('Home', { user });

    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      Alert.alert('Login Failed', err.response?.data?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#fcccc0', '#622c2c']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Welcome Back</Text>

          <View style={styles.inputContainer}>
            <Image source={require('../assets/user.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Image source={require('../assets/door-key.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showHideButton}>
              <Image source={require('../assets/view.png')} style={styles.showHideIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkContainer}>
            <Text style={styles.link}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkContainer}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, color: '#fff' },
  inputContainer: { width: '80%', flexDirection: 'row', alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 30, backgroundColor: '#fff', elevation: 5 },
  inputIcon: { width: 20, height: 20, marginLeft: 10, tintColor: '#800000' },
  input: { flex: 1, padding: 15, fontSize: 16, color: '#333' },
  showHideButton: { position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -12 }] },
  showHideIcon: { width: 20, height: 20, tintColor: '#800000' },
  button: { backgroundColor: '#800000', padding: 15, borderRadius: 30, width: '80%', alignItems: 'center', marginVertical: 20, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { marginTop: 20 },
  link: { color: '#fff', fontSize: 16, textDecorationLine: 'underline', fontWeight: 'bold' },
});

export default LoginScreen;
