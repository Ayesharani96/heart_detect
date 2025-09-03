import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";

const SettingScreen = ({ visible, onClose, navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const [user, setUser] = useState({ username: "", email: "" });

  // Load user from SecureStore
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await SecureStore.getItemAsync("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("user"); // clear data
    navigation.navigate("Welcome");
    onClose();
  };

  const handleAccountDetails = () => {
    navigation.navigate("AccountDetails", {
      username: user.username,
      email: user.email,
    });
    onClose();
  };

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient colors={["#fcccc0", "#622c2c"]} style={styles.gradientHeader}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Settings</Text>
            </View>
          </LinearGradient>
          <LinearGradient colors={["#fcccc0", "#622c2c"]} style={styles.gradientContent}>
            <View style={styles.content}>
              <TouchableOpacity style={styles.optionButton} onPress={handleAccountDetails}>
                <Text style={styles.optionText}>Account Detail</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
                <Text style={styles.optionText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "#fff",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  gradientHeader: { flex: 0.15, padding: 10 },
  gradientContent: { flex: 0.85, padding: 10 },
  header: { justifyContent: "center", alignItems: "center" },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { justifyContent: "center", alignItems: "center", flex: 1 },
  optionButton: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "90%",
  },
  optionText: { color: "#fff", fontSize: 16, textAlign: "center" },
});

export default SettingScreen;
