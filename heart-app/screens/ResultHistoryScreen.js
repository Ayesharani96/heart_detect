// screens/ResultHistoryScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const BASE_URL = "http://192.168.1.13:5000"; // 🔹 Your backend URL

export default function ResultHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await axios.get(`${BASE_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data || []);
    } catch (err) {
      console.error("❌ Fetch reports error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      await axios.delete(`${BASE_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("✅ Success", "Report deleted successfully.");
      fetchReports(); // Refresh list after deletion
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to delete report.");
    }
  };

  useEffect(() => {
    if (isFocused) fetchReports();
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading reports...</Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#fff" }}>No saved reports yet.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.reportName}</Text>
      <Text style={styles.meta}>
        Risk: {item.risk} | Probability:{" "}
        {item.finalProbability
          ? (item.finalProbability * 100).toFixed(0)
          : 0}
        %
      </Text>

      {!!(item.images && item.images[0]) && (
        <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
      )}

      <Text style={styles.date}>
        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
      </Text>

      {/* Action buttons row */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <LinearGradient colors={["#fcccc0", "#622c2c"]} style={[styles.actionBtn, { flex: 1 }]}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Result", {
                risk: item.risk,
                recommendation: item.recommendation,
                predictionScore: Math.round(
                  item.finalProbability ? item.finalProbability * 100 : 0
                ),
                userData: item.userData || null,
                images: item.images || [],
                reportName: item.reportName,
                result: item.rawResult || null,
              })
            }
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient colors={["#ff6b6b", "#c62828"]} style={[styles.actionBtn, { flex: 1 }]}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Delete Report",
                "Are you sure you want to delete this report?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => deleteReport(item._id) },
                ]
              )
            }
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(x) => x._id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, paddingBottom: 20, backgroundColor: "#622c2c" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#622c2c",
  },
  card: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  meta: { fontSize: 14, color: "#fff", marginBottom: 8 },
  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  date: { fontSize: 12, color: "#f0f0f0", marginBottom: 12 },
  actionBtn: {
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 8,
  },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
