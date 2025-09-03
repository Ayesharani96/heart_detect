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
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://192.168.1.13:5000";
const screenWidth = Dimensions.get("window").width;

const ResultScreen = ({ route, navigation }) => {
  const { result, userData, images, reportName } = route.params || {};
  const viewRef = useRef();

  const [risk, setRisk] = useState("Unknown");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Use backend-provided fields instead of recalculating risk
  useEffect(() => {
    if (!result) return;

    const { fusion_risk_label = "Unknown" } = result;

    setRisk(fusion_risk_label);

    // Recommendation logic
    let rec = "";
    switch (fusion_risk_label) {
      case "Low":
        rec = "Maintain a healthy lifestyle.";
        break;
      case "Moderate":
        rec = "Monitor your health and exercise regularly.";
        break;
      case "High":
      default:
        rec = "Consult a doctor soon.";
    }
    setRecommendation(rec);
  }, [result]);

  const getRiskColor = (r) => {
    switch ((r || "").toLowerCase()) {
      case "high":
        return "#B71C1C";
      case "moderate":
        return "#FF9800";
      case "low":
        return "#388E3C";
      default:
        return "#000";
    }
  };

  const chartData = {
    labels: ["Low", "Moderate", "High"],
    datasets: [
      {
        data: result?.fusion_risk_probs || [0, 0, 0],
        color: () => "#B71C1C",
      },
    ],
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={{ marginTop: 10 }}>Saving your report...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View collapsable={false} ref={viewRef}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {reportName || "Detection Result"}
          </Text>
        </View>

        <View style={styles.riskBox}>
          <Ionicons name="heart" size={60} color={getRiskColor(risk)} />
          <View style={{ marginLeft: 15 }}>
            <Text
              style={[styles.riskTitle, { color: getRiskColor(risk) }]}
            >{`${risk} Risk`}</Text>
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.box, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.boxTitle}>Your Entered Data</Text>
            {Object.entries(userData || {}).map(([key, val]) => (
              <Text key={key} style={styles.dataText}>
                {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1 }}>
            <LineChart
              data={chartData}
              width={screenWidth / 2 - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#F8EAEA",
                backgroundGradientTo: "#F8EAEA",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(183,28,28,${opacity})`,
                labelColor: () => "#000",
              }}
              style={styles.chart}
            />
          </View>
        </View>

        <View style={styles.recBox}>
          <Text style={styles.recTitle}>Recommendation</Text>
          <Text style={styles.recText}>{recommendation}</Text>
        </View>

        {images && images.length > 0 && (
          <View style={[styles.box, { flexDirection: "row" }]}>
            <Text style={styles.boxTitle}>Uploaded Reports</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() =>
            navigation.navigate("AddReportName", {
              result,
              risk,
              recommendation,
              userData,
              images,
            })
          }
        >
          <Text style={styles.btnText}>Save Result</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", backgroundColor: "#622c2c" },
  header: {
    backgroundColor: "#800000",
    width: "100%",
    paddingVertical: 17,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    marginBottom: 21,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  riskBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5DCDC",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    marginBottom: 20,
  },
  riskTitle: { fontSize: 22, fontWeight: "bold" },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "90%",
    marginBottom: 20,
  },
  chart: { borderRadius: 6 },
  recBox: {
    borderRadius: 15,
    padding: 13,
    width: "90%",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  recTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#800000",
  },
  recText: { fontSize: 16, color: "#333" },
  box: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  boxTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  dataText: { fontSize: 12, color: "#444", marginBottom: 5 },
  saveBtn: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
    marginBottom: 30,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default ResultScreen;
