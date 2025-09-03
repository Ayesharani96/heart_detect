import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ✅ Use your PC LAN IP
const BASE_URL = 'http://192.168.1.13:5000';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

const handleSignUp = async () => {
  if (!username.trim() || !email.trim() || !password) {  // ✅ use username here
    Alert.alert('⚠️ Incomplete Info', 'Please fill in all the fields.');
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
      username: username.trim(), // ✅ send 'name' to backend
      email: email.trim(),
      password,
    });

    Alert.alert('✅ Success', 'Account created successfully!');
    navigation.replace('Login'); // ✅ go to login screen
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Something went wrong during signup. Please try again.';
    Alert.alert('❌ Error', message);
  } finally {
    setLoading(false);
  }
};


  return (
    <LinearGradient colors={['#fcccc0', '#622c2c']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Sign Up</Text>

          <View style={styles.inputContainer}>
            <Image source={require('../assets/user.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Image source={require('../assets/email.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Image source={require('../assets/door-key.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible((prev) => !prev)}
              style={styles.eyeIconContainer}
            >
              <Image source={require('../assets/view.png')} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 5,
  },
  input: { flex: 1, height: 50, fontSize: 16, color: '#333', paddingLeft: 10 },
  icon: { width: 20, height: 20, tintColor: '#800000' },
  eyeIconContainer: { padding: 10 },
  eyeIcon: { width: 20, height: 20, tintColor: '#800000' },
  button: {
    backgroundColor: '#800000',
    padding: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});
