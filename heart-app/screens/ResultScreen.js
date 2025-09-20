// screens/ResultScreen.js
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const screenWidth = Dimensions.get("window").width;
const API_BASE_URL = "https://70a2f1e8c5be.ngrok-free.app"; // 🔹 update every time you restart ngrok

const ResultScreen = ({ route, navigation }) => {
  const { result: initialResult, userData, images, reportName } = route.params || {};
  const viewRef = useRef();

  const [risk, setRisk] = useState("Unknown");
  const [recommendations, setRecommendations] = useState([]);
  const [predictionScore, setPredictionScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [basedOn, setBasedOn] = useState("Pending");

  useEffect(() => {
    const fetchPrediction = async () => {
      if (initialResult) {
        processResult(initialResult);
        return;
      }

      if (!userData) {
        Alert.alert("Error", "Missing user data for prediction.");
        return;
      }

      try {
        setLoading(true);

        const formData = new FormData();
        Object.entries(userData).forEach(([key, val]) => formData.append(key, val));

        if (images && images.length === 3) {
          formData.append("ecg", { uri: images[0], type: "image/jpeg", name: "ecg.jpg" });
          formData.append("echo", { uri: images[1], type: "image/jpeg", name: "echo.jpg" });
          formData.append("xray", { uri: images[2], type: "image/jpeg", name: "xray.jpg" });
        }

        const response = await axios.post(${API_BASE_URL}/predict, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data?.final_decision) {
          processResult(response.data);
        } else {
          Alert.alert("Error", response.data?.message || "No result from server.");
        }
      } catch (err) {
        console.error("Prediction Error:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to fetch prediction.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [initialResult]);

  // 🔹 Updated processResult function
  const processResult = (res) => {
    let prob = 0;
    const finalDecision = res.final_decision || "Unknown";

    // Fusion Model probability
    if (res.fusion_model?.disease_prob !== undefined) {
      prob = Math.round(res.fusion_model.disease_prob * 100);
      setBasedOn("Fusion (Images + Tabular)");

    // Tabular Model probability
    } else if (res.tabular_model?.probabilities !== undefined) {
      prob = Math.round(res.tabular_model.probabilities[1] * 100);
      setBasedOn("Only Tabular Data");
    }

    setRisk(finalDecision);
    setPredictionScore(prob);

    // recommendations
    let recs = [];
    if (finalDecision.toLowerCase().includes("high")) {
      recs = [
        "See a doctor as soon as possible.",
        "Do not ignore chest pain or shortness of breath.",
        "Avoid heavy exercise until checked by a doctor.",
      ];
    } else if (finalDecision.toLowerCase().includes("moderate") || finalDecision.toLowerCase().includes("medium")) {
      recs = [
        "Keep track of your blood pressure and sugar.",
        "Eat healthy and avoid smoking or drinking.",
        "Visit a doctor if symptoms get worse.",
      ];
    } else {
      recs = [
        "Keep eating a balanced diet.",
        "Exercise regularly.",
        "Avoid smoking and excessive alcohol.",
      ];
    }
    setRecommendations(recs);
  };

  const getRiskColor = (r) => {
    const text = (r || "").toLowerCase();
    if (text.includes("high")) return "#800000";
    if (text.includes("low")) return "#388E3C";
    if (text.includes("moderate") || text.includes("medium")) return "#F9A825";
    return "#000";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={{ marginTop: 10 }}>Processing your result...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View collapsable={false} ref={viewRef}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{reportName || "Detection Result"}</Text>
          <Text style={styles.subHeader}>Based on: {basedOn}</Text>
        </View>

        <View style={styles.riskBox}>
          <Ionicons name="heart" size={60} color={getRiskColor(risk)} />
          <View style={{ marginLeft: 15 }}>
            <Text style={[styles.riskTitle, { color: getRiskColor(risk) }]}>{risk}</Text>
            <Text style={styles.riskSubtitle}>Probability: {predictionScore}%</Text>
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.box, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.boxTitle}>Your Entered Data</Text>
            {Object.entries(userData || {}).map(([key, val]) => (
              <Text key={key} style={styles.dataText}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {val}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <AnimatedCircularProgress
              size={150}
              width={15}
              fill={predictionScore}
              tintColor={getRiskColor(risk)}
              backgroundColor="#e0e0e0"
            >
              {() => (
                <Text style={{ fontSize: 18, fontWeight: "bold", color: getRiskColor(risk) }}>
                  {predictionScore}%
                </Text>
              )}
            </AnimatedCircularProgress>
            <Text style={{ marginTop: 10, fontWeight: "bold", color: getRiskColor(risk) }}>
              {risk}
            </Text>
          </View>
        </View>

        <View style={styles.recBox}>
          <Text style={styles.recTitle}>Recommendations</Text>
          {recommendations.map((rec, idx) => (
            <Text key={idx} style={styles.recText}>
              • {rec}
            </Text>
          ))}
        </View>

        {images && images.length > 0 && (
          <View style={[styles.box, { flexDirection: "row" }]}>
            <Text style={styles.boxTitle}>Uploaded Reports</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.reportImage} resizeMode="contain" />
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() =>
            navigation.navigate("AddReportName", { risk, recommendations, predictionScore, userData, images })
          }
        >
          <Text style={styles.btnText}>Save Result</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  header: { alignItems: "center", marginBottom: 10 },
  headerText: { fontSize: 22, fontWeight: "bold", color: "#800000" },
  subHeader: { fontSize: 14, color: "#666", marginTop: 4 },
  riskBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEC",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  riskTitle: { fontSize: 20, fontWeight: "bold" },
  riskSubtitle: { fontSize: 14, color: "#555" },
  rowContainer: { flexDirection: "row", marginBottom: 20 },
  box: { backgroundColor: "#FDECEC", borderRadius: 10, padding: 10 },
  boxTitle: { fontWeight: "bold", marginBottom: 5, color: "#800000" },
  dataText: { fontSize: 13, color: "#333" },
  recBox: { backgroundColor: "#fff8f8", padding: 15, borderRadius: 10, marginBottom: 20 },
  recTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5, color: "#800000" },
  recText: { fontSize: 14, color: "#444", marginBottom: 5 },
  reportImage: { width: 120, height: 120, marginRight: 10, borderRadius: 10 },
  saveBtn: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});