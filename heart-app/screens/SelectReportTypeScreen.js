// SelectReportTypeScreen.js
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SelectReportTypeScreen = ({ navigation, route }) => {
  const { token, userData, vitalsId } = route.params || {};
  const [loading, setLoading] = useState(false);

  const handleReportTypeSelect = () => {
    navigation.navigate("Camera", {
      token,
      userData,
      vitalsId,
      reportType: "Report",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Processing your data...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#fcccc0", "#622c2c"]} style={styles.container}>
      <Text style={styles.heading}>Select an Option</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleReportTypeSelect}>
          <Text style={styles.buttonText}>Select Report</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default SelectReportTypeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#fff",
  },
  buttonContainer: { width: "100%" },
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#800000" },
});
