# React Native Mobile App Implementation

## Overview

This guide provides detailed instructions for creating a React Native mobile app that connects to your existing surf tracking backend API.

## Project Setup

### 1. Initialize React Native Project

```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Create new project
npx react-native init SurfTrackerApp
cd SurfTrackerApp

# Install required dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install axios react-native-vector-icons
npm install @react-native-async-storage/async-storage
npm install react-native-maps react-native-geolocation-service
```

### 2. Configure Platform-Specific Settings

#### iOS Configuration (ios/SurfTrackerApp/Info.plist)

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to find nearby surf spots.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to track surf sessions.</string>
```

#### Android Configuration (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

## App Architecture

### Directory Structure

```
src/
├── components/           # Reusable UI components
├── screens/             # Screen components
├── services/            # API services and utilities
├── navigation/          # Navigation configuration
├── store/              # State management
├── utils/              # Helper functions
└── assets/             # Images, fonts, etc.
```

## API Service Implementation

### services/api.js

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://your-app.railway.app";

class SurfAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Surf Spots
  async getSurfSpots() {
    return this.request("/api/surf-spots");
  }

  async createSurfSpot(spotData) {
    return this.request("/api/surf-spots", {
      method: "POST",
      body: JSON.stringify(spotData),
    });
  }

  async updateSurfSpot(id, spotData) {
    return this.request(`/api/surf-spots/${id}`, {
      method: "PUT",
      body: JSON.stringify(spotData),
    });
  }

  async deleteSurfSpot(id) {
    return this.request(`/api/surf-spots/${id}`, {
      method: "DELETE",
    });
  }

  // Surf Sessions
  async getSessions() {
    return this.request("/api/sessions");
  }

  async createSession(sessionData) {
    return this.request("/api/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request("/api/dashboard/stats");
  }
}

export default new SurfAPI();
```

### services/storage.js

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageService = {
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error storing data:", error);
    }
  },

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error retrieving data:", error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data:", error);
    }
  },
};
```

## Screen Components

### screens/SurfSpotsScreen.js

```javascript
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import SurfAPI from "../services/api";
import { StorageService } from "../services/storage";

const SurfSpotsScreen = ({ navigation }) => {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSurfSpots();
  }, []);

  const loadSurfSpots = async () => {
    try {
      const spots = await SurfAPI.getSurfSpots();
      setSurfSpots(spots);
      await StorageService.setItem("surfSpots", spots);
    } catch (error) {
      console.error("Failed to load surf spots:", error);
      // Load from cache if network fails
      const cachedSpots = await StorageService.getItem("surfSpots");
      if (cachedSpots) {
        setSurfSpots(cachedSpots);
        Alert.alert("Offline Mode", "Showing cached surf spots");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSurfSpots();
  };

  const renderSurfSpot = ({ item }) => (
    <TouchableOpacity
      style={styles.spotCard}
      onPress={() => navigation.navigate("SpotDetails", { spot: item })}
    >
      <View style={styles.spotHeader}>
        <Text style={styles.spotName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.average_rating || "N/A"}</Text>
        </View>
      </View>
      <Text style={styles.spotDetails}>
        {item.break_type} • {item.skill_requirement}
      </Text>
      <Text style={styles.sessionCount}>
        {item.total_sessions} sessions logged
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading surf spots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={surfSpots}
        renderItem={renderSurfSpot}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddSpot")}
      >
        <Icon name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  spotCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  spotName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  spotDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  sessionCount: {
    fontSize: 12,
    color: "#999",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default SurfSpotsScreen;
```

### screens/AddSpotScreen.js

```javascript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import SurfAPI from "../services/api";

const AddSpotScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    breakType: "Beach Break",
    skillRequirement: "Beginner",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const spotData = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        breakType: formData.breakType,
        skillRequirement: formData.skillRequirement,
        description: formData.description,
      };

      await SurfAPI.createSurfSpot(spotData);
      Alert.alert("Success", "Surf spot created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Failed to create surf spot:", error);
      Alert.alert("Error", "Failed to create surf spot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Spot Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter spot name"
          />

          <Text style={styles.label}>Latitude *</Text>
          <TextInput
            style={styles.input}
            value={formData.latitude}
            onChangeText={(text) =>
              setFormData({ ...formData, latitude: text })
            }
            placeholder="e.g., 34.0522"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Longitude *</Text>
          <TextInput
            style={styles.input}
            value={formData.longitude}
            onChangeText={(text) =>
              setFormData({ ...formData, longitude: text })
            }
            placeholder="e.g., -118.2437"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Break Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.breakType}
              onValueChange={(value) =>
                setFormData({ ...formData, breakType: value })
              }
            >
              <Picker.Item label="Beach Break" value="Beach Break" />
              <Picker.Item label="Point Break" value="Point Break" />
              <Picker.Item label="Reef Break" value="Reef Break" />
              <Picker.Item label="River Mouth" value="River Mouth" />
            </Picker>
          </View>

          <Text style={styles.label}>Skill Requirement</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.skillRequirement}
              onValueChange={(value) =>
                setFormData({ ...formData, skillRequirement: value })
              }
            >
              <Picker.Item label="Beginner" value="Beginner" />
              <Picker.Item label="Intermediate" value="Intermediate" />
              <Picker.Item label="Advanced" value="Advanced" />
              <Picker.Item label="Expert" value="Expert" />
            </Picker>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Add notes about this surf spot"
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Creating..." : "Create Surf Spot"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: "#CCC",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddSpotScreen;
```

## Navigation Setup

### navigation/AppNavigator.js

```javascript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/MaterialIcons";

import SurfSpotsScreen from "../screens/SurfSpotsScreen";
import AddSpotScreen from "../screens/AddSpotScreen";
import SessionsScreen from "../screens/SessionsScreen";
import DashboardScreen from "../screens/DashboardScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SurfSpotsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="SurfSpots"
      component={SurfSpotsScreen}
      options={{ title: "Surf Spots" }}
    />
    <Stack.Screen
      name="AddSpot"
      component={AddSpotScreen}
      options={{ title: "Add New Spot" }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Dashboard") {
              iconName = "dashboard";
            } else if (route.name === "Spots") {
              iconName = "place";
            } else if (route.name === "Sessions") {
              iconName = "timeline";
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Spots" component={SurfSpotsStack} />
        <Tab.Screen name="Sessions" component={SessionsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

## State Management

### store/SurfStore.js (using Context API)

```javascript
import React, { createContext, useContext, useReducer } from "react";

const SurfContext = createContext();

const initialState = {
  surfSpots: [],
  sessions: [],
  loading: false,
  error: null,
};

const surfReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SURF_SPOTS":
      return { ...state, surfSpots: action.payload };
    case "ADD_SURF_SPOT":
      return { ...state, surfSpots: [...state.surfSpots, action.payload] };
    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };
    case "ADD_SESSION":
      return { ...state, sessions: [...state.sessions, action.payload] };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const SurfProvider = ({ children }) => {
  const [state, dispatch] = useReducer(surfReducer, initialState);

  return (
    <SurfContext.Provider value={{ state, dispatch }}>
      {children}
    </SurfContext.Provider>
  );
};

export const useSurf = () => {
  const context = useContext(SurfContext);
  if (!context) {
    throw new Error("useSurf must be used within a SurfProvider");
  }
  return context;
};
```

## Location Services

### services/locationService.js

```javascript
import Geolocation from "react-native-geolocation-service";
import { PermissionsAndroid, Platform, Alert } from "react-native";

export const LocationService = {
  async requestLocationPermission() {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message:
              "This app needs access to location to find nearby surf spots.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  },

  async getCurrentLocation() {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error("Location permission denied");
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  },
};
```

## Build and Deploy

### 1. Development Build

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

### 2. Release Build

#### iOS Release

```bash
# Archive for release
npx react-native run-ios --configuration Release

# Using Xcode for App Store
open ios/SurfTrackerApp.xcworkspace
# Archive and upload to App Store Connect
```

#### Android Release

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# Generate release AAB for Play Store
./gradlew bundleRelease
```

### 3. Environment Configuration

#### Create config files for different environments

**config/index.js**

```javascript
const config = {
  development: {
    API_URL: "http://localhost:5000",
  },
  production: {
    API_URL: "https://your-app.railway.app",
  },
};

export default config[__DEV__ ? "development" : "production"];
```

## Testing

### 1. Unit Tests

```javascript
// __tests__/api.test.js
import SurfAPI from "../src/services/api";

describe("SurfAPI", () => {
  test("should fetch surf spots", async () => {
    const spots = await SurfAPI.getSurfSpots();
    expect(Array.isArray(spots)).toBe(true);
  });
});
```

### 2. Integration Tests

```javascript
// __tests__/SurfSpotsScreen.test.js
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import SurfSpotsScreen from "../src/screens/SurfSpotsScreen";

test("renders surf spots screen", async () => {
  const { getByText } = render(<SurfSpotsScreen />);
  await waitFor(() => {
    expect(getByText("Loading surf spots...")).toBeTruthy();
  });
});
```

## Performance Optimization

### 1. Image Optimization

```javascript
// components/OptimizedImage.js
import React from "react";
import { Image } from "react-native";
import FastImage from "react-native-fast-image";

const OptimizedImage = ({ source, ...props }) => {
  return (
    <FastImage
      source={{ uri: source, priority: FastImage.priority.normal }}
      resizeMode={FastImage.resizeMode.cover}
      {...props}
    />
  );
};

export default OptimizedImage;
```

### 2. List Optimization

```javascript
// Use FlatList optimizations
<FlatList
  data={surfSpots}
  renderItem={renderSurfSpot}
  keyExtractor={(item) => item.id.toString()}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

This React Native implementation provides a complete mobile app that connects to your existing backend API and Railway database. The app includes offline support, location services, and follows React Native best practices for performance and user experience.
