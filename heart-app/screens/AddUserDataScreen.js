import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  View,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.13:5000"; // 👈 your backend

const AddUserDataScreen = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [userData, setUserData] = useState({
    age: "",
    gender: "Select Gender",
    weight: "",
    height: "",
    smokingStatus: "Select Smoking Status",
    alcoholConsumption: "Select Alcohol Consumption",
    cholesterolLevel: "",
    bloodPressure: "",
    fastingBloodSugar: "Select Fasting Blood Sugar",
    chestPainType: "Select Chest Pain",
  });

  useEffect(() => {
    (async () => {
      const storedToken = await SecureStore.getItemAsync("token");
      setToken(storedToken);
      setLoading(false);
    })();
  }, []);

  const handleChange = (key, value) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    const {
      age,
      gender,
      weight,
      height,
      smokingStatus,
      alcoholConsumption,
      cholesterolLevel,
      bloodPressure,
      fastingBloodSugar,
      chestPainType,
    } = userData;

    if (
      !age ||
      !weight ||
      !height ||
      !cholesterolLevel ||
      !bloodPressure ||
      gender.startsWith("Select") ||
      smokingStatus.startsWith("Select") ||
      alcoholConsumption.startsWith("Select") ||
      fastingBloodSugar.startsWith("Select") ||
      chestPainType.startsWith("Select")
    ) {
      return Alert.alert("Incomplete Data", "Please fill in all fields correctly.");
    }

    if (!token) {
      return Alert.alert("Error", "You must log in first.");
    }

    try {
      setSubmitting(true);

      const payload = {
        age: Number(age),
        gender,
        weight: Number(weight),
        height: Number(height),
        smokingStatus,
        alcoholConsumption,
        cholesterolLevel: Number(cholesterolLevel),
        bloodPressure,
        fastingBloodSugar,
        chestPainType,
      };

      const response = await axios.post(`${API_BASE_URL}/api/userdata`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success && response.data?.vitalsId) {
        navigation.navigate("SelectReportType", {
          token,
          vitalsId: response.data.vitalsId,
          userData: payload, // pass clean payload forward
        });
      } else {
        Alert.alert("Error", response.data?.message || "Failed to save user data.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || error.message || "Server connection failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#fcccc0", "#622c2c"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Enter Your Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Age"
          keyboardType="numeric"
          value={String(userData.age)}
          onChangeText={(v) => handleChange("age", v)}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userData.gender}
            onValueChange={(v) => handleChange("gender", v)}
          >
            <Picker.Item label="Select Gender" value="Select Gender" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          keyboardType="numeric"
          value={String(userData.weight)}
          onChangeText={(v) => handleChange("weight", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          keyboardType="numeric"
          value={String(userData.height)}
          onChangeText={(v) => handleChange("height", v)}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userData.smokingStatus}
            onValueChange={(v) => handleChange("smokingStatus", v)}
          >
            <Picker.Item label="Smoking Status" value="Select Smoking Status" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userData.alcoholConsumption}
            onValueChange={(v) => handleChange("alcoholConsumption", v)}
          >
            <Picker.Item
              label="Alcohol Consumption"
              value="Select Alcohol Consumption"
            />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Cholesterol Level"
          keyboardType="numeric"
          value={String(userData.cholesterolLevel)}
          onChangeText={(v) => handleChange("cholesterolLevel", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Blood Pressure (e.g. 120/80)"
          value={userData.bloodPressure}
          onChangeText={(v) => handleChange("bloodPressure", v)}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userData.fastingBloodSugar}
            onValueChange={(v) => handleChange("fastingBloodSugar", v)}
          >
            <Picker.Item
              label="Fasting Blood Sugar > 120 mg/dL?"
              value="Select Fasting Blood Sugar"
            />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userData.chestPainType}
            onValueChange={(v) => handleChange("chestPainType", v)}
          >
            <Picker.Item label="Chest Pain?" value="Select Chest Pain" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? "Submitting..." : "Next"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#fff" },
  input: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 30,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  pickerContainer: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 30,
    backgroundColor: "#fff",
    marginVertical: 10,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default AddUserDataScreen;
