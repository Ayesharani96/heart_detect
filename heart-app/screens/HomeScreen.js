import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import SettingScreen from "./SettingScreen";

const BASE_URL = "http://192.168.1.13:5000"; // ✅ Replace with your backend IP

const HomeScreen = ({ navigation }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [vitals, setVitals] = useState(null);
  const [user, setUser] = useState({ username: "N/A", email: "N/A" });
  const [profileImage, setProfileImage] = useState(null);

  // 🔹 Load user info + profile image
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync("user");
        if (userData) setUser(JSON.parse(userData));

        const savedImage = await SecureStore.getItemAsync("profileImage");
        if (savedImage) setProfileImage(savedImage);
      } catch (e) {
        console.log("Error loading user", e);
      }
    };
    loadUser();
  }, []);

  // 🔹 Load latest vitals
  const fetchVitals = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/api/userData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setVitals(data.vitals || {});
      } else {
        console.log("Failed to fetch vitals, status:", res.status);
      }
    } catch (e) {
      console.error("Fetch vitals error", e);
      Alert.alert("Error", "Failed to load vitals.");
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  // 🔹 Navigate to add data for prediction
  const handleDetectNow = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert("Error", "You must log in first");
      return;
    }
    navigation.navigate("AddUserData", { onGoBack: fetchVitals });
  };

  // 🔹 Pick image for profile
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your gallery.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // square
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await SecureStore.setItemAsync("profileImage", uri);
    }
  };

  return (
    <LinearGradient colors={["#fcccc0", "#622c2c"]} style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Image source={require("../assets/setting.png")} style={styles.icon} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.title}>Heart Detect</Text>
        </View>

        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileIcon} />
          ) : (
            <Image source={require("../assets/user.png")} style={styles.icon} />
          )}
        </TouchableOpacity>
      </View>

      {/* 🔹 Welcome */}
      <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>

      {/* 🔹 Detect Now */}
      <TouchableOpacity style={styles.mainButton} onPress={handleDetectNow}>
        <Image source={require("../assets/ecg.png")} style={styles.ecgIcon} />
        <Text style={styles.mainButtonText}>Detect Now</Text>
      </TouchableOpacity>

      {/* 🔹 Result History */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => navigation.navigate("ResultHistory")}
      >
        <Text style={styles.mainButtonText}>Result History</Text>
      </TouchableOpacity>

      {/* 🔹 Reports Section */}
      <Text style={styles.sectionTitle}>Reports</Text>
      <View style={styles.reportContainer}>
        {[
          { label: "Blood Pressure", value: vitals?.bloodPressure },
          { label: "Diabates", value: vitals?.fastingBloodSugar },
          { label: "Cholesterol Level", value: vitals?.cholesterolLevel },
          { label: "Weight", value: vitals?.weight },
        ].map(({ label, value }) => (
          <View key={label} style={styles.reportButton}>
            <Text style={styles.reportButtonText}>{label}</Text>
            <Text style={styles.reportValue}>{value ?? "N/A"}</Text>
          </View>
        ))}
      </View>

      {/* 🔹 Settings Modal */}
      <SettingScreen
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        navigation={navigation}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 21,
  },
  titleContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 45, height: 45, marginRight: 8, resizeMode: "contain" },
  title: { color: "white", fontSize: 22, fontWeight: "bold" },
  icon: { width: 40, height: 40, resizeMode: "contain" },
  profileIcon: { width: 40, height: 40, borderRadius: 20 },
  welcomeText: {
    color: "white",
    fontSize: 21,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 21,
  },
  mainButton: {
    flexDirection: "row",
    backgroundColor: "#800000",
    width: "100%",
    height: 90,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  mainButtonText: { color: "white", fontSize: 22, fontWeight: "bold" },
  ecgIcon: { width: 50, height: 50, marginRight: 15, resizeMode: "contain" },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
  },
  reportContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  reportButton: {
    backgroundColor: "#800000",
    width: "48%",
    height: 100,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  reportButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  reportValue: { color: "white", fontSize: 14, marginTop: 8 },
});

export default HomeScreen;
