import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import { Ionicons, MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import CategoryScreens from "./screens/CategoryScreens";
import CategoryImages from "./screens/CategoryImages";
import { SafeAreaView } from "react-native";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "compass";
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === "Category") {
            iconName = "category";
            return <MaterialIcons name={iconName} size={size} color={color} />;
          } else if (route.name === "Trending") {
            iconName = "flame-sharp";
            return <Ionicons name={iconName} size={size} color={color} />;
          }

          return null;
        },
        tabBarLabel: () => null,
        tabBarActiveTintColor: "orange",
        tabBarInactiveTintColor: "#cecece",
        tabBarStyle: {
          height: 60,
          backgroundColor: "#fff", // Adjust color as needed
          elevation: 0, // Removes shadow on Android
          borderTopWidth: 0, // Removes border on iOS
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={CategoryScreens} />
      <Tab.Screen name="Trending" component={HomeScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HomeTabs" component={BottomTabNavigator} />
          <Stack.Screen name="CategoryImages" component={CategoryImages} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
