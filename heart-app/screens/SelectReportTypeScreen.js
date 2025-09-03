import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SelectReportTypeScreen = ({ navigation, route }) => {
  const { token, userData, vitalsId } = route.params || {};

  const handleReportTypeSelect = (type) => {
    if (type === "Detect") {
      if (!userData) return Alert.alert("Error", "Please enter your data first.");
      navigation.navigate("Result", {
        token,
        userData,
        images: [],
        reportName: "Text Data Prediction",
      });
    } else {
      navigation.navigate("Camera", {
        token,
        userData,   // pass full userData forward
        vitalsId,
        reportType: "Report",
      });
    }
  };

  return (
    <LinearGradient colors={["#fcccc0", "#622c2c"]} style={styles.container}>
      <Text style={styles.heading}>Select an Option</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleReportTypeSelect("Detect")}
        >
          <Text style={styles.buttonText}>Detect</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleReportTypeSelect("Select Report")}
        >
          <Text style={styles.buttonText}>Select Report</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  heading: { fontSize: 26, fontWeight: "bold", marginBottom: 40, color: "#fff" },
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
});

export default SelectReportTypeScreen;
