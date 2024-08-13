import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./screens/HomeScreen";
import CategoryScreens from "./screens/CategoryScreens";
import CategoryImages from "./screens/CategoryImages";
import DownloadImage from "./screens/DownloadImage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return <Ionicons name="compass" size={size} color={color} />;
          } else if (route.name === "Category") {
            return (
              <Image
                source={require("./assets/images/category.png")}
                style={{
                  width: size,
                  height: size,
                  tintColor: color,
                }}
              />
            );
          } else if (route.name === "Trending") {
            return <Ionicons name="flame-sharp" size={size} color={color} />;
          }
          return null;
        },
        tabBarLabel: () => null,
        tabBarActiveTintColor: "orange",
        tabBarInactiveTintColor: "#cecece",
        tabBarStyle: {
          height: 60,
          backgroundColor: "#fff",
          elevation: 0,
          borderTopWidth: 0,
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
          <Stack.Screen name="DownloadImage" component={DownloadImage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
