// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';

// Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EnterNewPasswordScreen from '../screens/NewPasswordScreen';
import AddReportNameScreen from '../screens/AddReportNameScreen';
import AddUserDataScreen from '../screens/AddUserDataScreen';
import SelectReportTypeScreen from '../screens/SelectReportTypeScreen';
import CameraScreen from '../screens/CameraScreen';
import ResultScreen from '../screens/ResultScreen';
import ResultHistoryScreen from '../screens/ResultHistoryScreen';
import SettingsScreen from '../screens/SettingScreen';
import AccountDetailsScreen from '../screens/AccountDetailScreen';

// Stack Navigator
const Stack = createStackNavigator();

// 🔹 Deep Linking Configuration
const linking = {
  prefixes: [Linking.createURL('/'), 'myapp://'],
  config: {
    screens: {
      Splash: 'splash',
      Welcome: 'welcome',
      Login: 'login',
      Signup: 'signup',
      ForgotPassword: 'forgot-password',

      // ✅ FIX: accept token from deep link
      EnterNewPassword: 'reset-password/:token',

      Home: 'home',
      AddReportName: 'add-report-name',
      AddUserData: 'add-user-data',
      SelectReportType: 'select-report-type',
      Camera: 'camera',
      Result: 'result',
      ResultHistory: 'result-history',
      Reports: 'reports',
      Settings: 'settings',
      AccountDetails: 'account-details',
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth + Onboarding */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* ✅ Reset Password Screen with token */}
        <Stack.Screen name="EnterNewPassword" component={EnterNewPasswordScreen} />

        {/* Main App Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddReportName" component={AddReportNameScreen} />
        <Stack.Screen name="AddUserData" component={AddUserDataScreen} />
        <Stack.Screen name="SelectReportType" component={SelectReportTypeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="ResultHistory" component={ResultHistoryScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />

        {/* Settings & Account */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal', headerShown: true, title: 'Settings' }}
        />
        <Stack.Screen
          name="AccountDetails"
          component={AccountDetailsScreen}
          options={{ headerShown: true, title: 'Account Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
