import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const ReportHistoryScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUserId = await SecureStore.getItemAsync('userId'); // ✅ store userId in SecureStore at login/signup

      if (!storedToken || !storedUserId) {
        Alert.alert('Error', 'Please login first');
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setUserId(storedUserId);

      try {
        const res = await axios.get('http://192.168.1.9:5000/api/reports', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setReports(res.data); // ✅ ensure backend sends { _id, reportName, image, reportType, userData }
      } catch (error) {
        console.error('Error fetching reports:', error);
        Alert.alert('Error', 'Failed to fetch report history');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reports found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {reports.map((report) => (
        <TouchableOpacity
          key={report._id}
          style={styles.reportItem}
          onPress={() =>
            navigation.navigate('ResultScreen', {
              token,
              userId,
              reportName: report.reportName,
              reportType: report.reportType,
              userData: report.userData,
              imageUri: report.image, // ✅ ensure backend returns correct image URL or base64
            })
          }
        >
          <Image
            source={{
              uri: report.image.startsWith('data:')
                ? report.image
                : `http://192.168.1.10:5000/${report.image}`, // ✅ adjust if backend returns file path
            }}
            style={styles.reportImage}
          />
          <Text style={styles.reportName}>{report.reportName}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#800000',
  },
  reportItem: {
    width: 150,
    marginBottom: 15,
    alignItems: 'center',
  },
  reportImage: {
    width: 140,
    height: 140,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#800000',
  },
  reportName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#800000',
    textAlign: 'center',
  },
});

export default ReportHistoryScreen;
