// screens/AddReportNameScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";

const BASE_URL = "http://192.168.1.13:5000"; // 🔹 your backend LAN IP

export default function AddReportNameScreen({ navigation, route }) {
  // params coming from ResultScreen
  const { result, risk, recommendation, predictionScore, userData, images } =
    route.params || {};

  const [reportName, setReportName] = useState("");

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      Alert.alert("Error", "Report name is required");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");

      const res = await axios.post(
        `${BASE_URL}/api/reports`,
        {
          reportName,
          reportType: "AI Result", // default type
          risk,
          recommendation,
          finalProbability: predictionScore ? predictionScore / 100 : null,
          userData,
          images,
          rawResult: result,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Save report response:", res.data);
      Alert.alert("Success", "Report saved successfully!");
      navigation.navigate("Home"); // ✅ go to Home instead of history
    } catch (err) {
      console.error("Save report error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.error || "Failed to save report");
    }
  };

  return (
    <LinearGradient colors={["#fcccc0", "#622c2c"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%", justifyContent: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.heading}>Enter Report Name</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. My Heart Report"
          placeholderTextColor="#999"
          value={reportName}
          onChangeText={setReportName}
        />

        <TouchableOpacity style={styles.button} onPress={handleSaveReport}>
          <Text style={styles.buttonText}>Save Report</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#fff", textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#fff",
    width: "90%",
    alignSelf: "center",
    fontSize: 16,
  },
  button: {
    marginVertical: 12,
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: "#800000",
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
    elevation: 5,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
