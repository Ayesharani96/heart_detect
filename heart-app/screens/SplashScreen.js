import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

const SplashScreen = ({ navigation }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome'); // Navigate to WelcomeScreen after 4 seconds
    }, 2000); // 4 seconds delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../assets/HEARTDETECT.mp4')}
        style={styles.video}
        resizeMode="cover" // Ensures full-screen coverage
        shouldPlay
        isLooping
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Removes background color
  },
  video: {
    width: '100%', // Full width
    height: '100%', // Full height
    position: 'absolute', // Covers entire screen
  },
});

export default SplashScreen;
