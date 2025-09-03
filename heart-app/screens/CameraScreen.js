// screens/CameraScreen.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera"; // expo-camera v16+
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
const BASE_URL = "https://f8284a63fbca.ngrok-free.app"; 
// change for your backend

export default function CameraScreen({ navigation, route }) {
const { token, userData, vitalsId, reportType } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const cameraRef = useRef(null);

  const [images, setImages] = useState([]); // ✅ multiple images
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Flip camera
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

// Capture photo
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setImages((prev) => [...prev, photo.uri].slice(0, 3)); // Keep max 3
    }
  };

// Pick images from gallery
  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 3)); // Keep max 3
    }
  };


  // ✅ Clear all
  function clearImages() {
    setImages([]);
  }
// Upload images + user data to backend
  const uploadReport = async () => {
    if (images.length !== 3) {
      Alert.alert(
        "Upload Error",
        "Please capture or select exactly 3 images: ECG, Echo, X-ray."
      );
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Append images with keys the backend expects
      formData.append("ecg", {
        uri: images[0],
        type: "image/jpeg",
        name: "ecg.jpg",
      });
      formData.append("echo", {
        uri: images[1],
        type: "image/jpeg",
        name: "echo.jpg",
      });
      formData.append("xray", {
        uri: images[2],
        type: "image/jpeg",
        name: "xray.jpg",
      });

      // Append user vitals
      Object.entries(userData || {}).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("reportType", reportType || "Report");

      const res = await axios.post(`${BASE_URL}/predict`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Prediction Response:", res.data); // ✅ Debug response

      setLoading(false);

      if (res.data.status === "success") {
        // ✅ Navigate to ResultScreen with images + prediction result
        navigation.navigate("Result", {
          result: res.data,
          userData,
          images,
        });
      } else {
        Alert.alert("Prediction Error", JSON.stringify(res.data));
      }
    } catch (error) {
      setLoading(false);
      console.error("Upload error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || error.message);
    }
  };


  return (
    <View style={styles.container}>
      {/* ✅ Preview strip */}
      {images.length > 0 && (
        <View style={{ height: 120 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ✅ Camera */}
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.sideButton} onPress={toggleCameraFacing}>
            <Text style={styles.controlText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture} />

          <TouchableOpacity style={styles.sideButton} onPress={pickImageFromGallery}>
            <Text style={styles.controlText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* ✅ Bottom buttons */}
      {images.length > 0 && (
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={clearImages}>
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={uploadReport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  message: { textAlign: "center", paddingBottom: 10, color: "#800000" },
  permissionButton: {
    backgroundColor: "#800000",
    padding: 12,
    borderRadius: 10,
    alignSelf: "center",
  },
  permissionText: { color: "white", fontWeight: "bold" },

  camera: { flex: 1 },

  bottomControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sideButton: {
    backgroundColor: "#800000",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  controlText: { color: "white", fontWeight: "bold" },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: "#800000",
    backgroundColor: "white",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 5,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 15,
    backgroundColor: "#111",
  },
  actionButton: {
    backgroundColor: "#800000",
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 40,
  },
  actionText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
