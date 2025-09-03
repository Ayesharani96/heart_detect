import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

const AccountDetailScreen = ({ navigation }) => {
  const [user, setUser] = useState({ username: 'N/A', email: 'N/A' });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Stored user:', parsedUser); // check what keys exist
          setUser({
            username: parsedUser.username || parsedUser.name || 'N/A',
            email: parsedUser.email || 'N/A',
          });
        }
      } catch (e) {
        console.log('Error loading user data:', e);
      }
    };
    loadUser();
  }, []);

  return (
    <LinearGradient colors={['#fcccc0', '#622c2c']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Account Details</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{user.username}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 30,
  },
  detailRow: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#800000', marginBottom: 4 },
  value: { fontSize: 16, color: '#333' },
  button: { backgroundColor: '#800000', borderRadius: 30, paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center', elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AccountDetailScreen;
