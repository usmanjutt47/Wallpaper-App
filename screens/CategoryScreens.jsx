import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { apiCall } from "../api/api"; // Adjust the path as needed
import { TabBar, TabView } from "react-native-tab-view";

const { width, height } = Dimensions.get("window");

const Data = [
  { title: "Abstract", imageUri: require("../assets/images/abstract.png") },
  {
    title: "Illustrations",
    imageUri: require("../assets/images/Illustrations.png"),
  },
  { title: "Animal", imageUri: require("../assets/images/animal.png") },
  { title: "Games", imageUri: require("../assets/images/games.png") },
  { title: "Gradient", imageUri: require("../assets/images/gradient.png") },
  { title: "Sports", imageUri: require("../assets/images/sports.png") },
  { title: "Ai generated", imageUri: require("../assets/images/ai.png") },
  { title: "Fashion", imageUri: require("../assets/images/Fashion.png") },
];

function CategoryCard({ title, imageUri, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={imageUri} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CategoriesScreen() {
  const navigation = useNavigation();

  const onSelectCategory = async (category) => {
    const response = await apiCall({ q: category });

    if (response.success) {
      navigation.navigate("CategoryImages", {
        images: response.data.hits,
        categoryName: category, // Pass the category name
      });
    } else {
      console.log("API call failed:", response.message);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={Data}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CategoryCard
            title={item.title}
            imageUri={item.imageUri}
            onPress={() => onSelectCategory(item.title)}
          />
        )}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.cardList}
      />
    </View>
  );
}

const colorData = [
  "#000000",
  "#00FFFF",
  "#0128FF",
  "#0ABA00",
  "#7A7A7A",
  "#974B00",
  "#C0FF00",
  "#E8C03C",
  "#54299C",
  "#C0C0C0",
  "#FE0000",
  "#FF5ED2",
  "#FF7000",
  "#FFFB3A",
  "#FFFFFF",
];

function Colors() {
  const navigation = useNavigation();

  const handlePress = (color) => {
    console.log("Selected color:", color);
  };

  return (
    <FlatList
      data={colorData}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.colorBox, { backgroundColor: item }]}
          onPress={() => handlePress(item)}
        />
      )}
      keyExtractor={(item) => item}
      numColumns={3}
      contentContainerStyle={styles.grid}
    />
  );
}

export default function CustomTabView() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "categories", title: "Categories" },
    { key: "Colors", title: "Colors" },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "categories":
        return <CategoriesScreen />;
      case "Colors":
        return <Colors />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cardList: {
    padding: 10,
    alignSelf: "center",
  },
  card: {
    position: "relative",
    width: width * 0.9,
    height: height * 0.2,
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
  },
  cardText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "left",
  },
  tabBar: {
    backgroundColor: "#fff",
    marginTop: height * 0.02,
    elevation: null,
    width: height * 0.3,
  },
  tabLabel: {
    fontWeight: "bold",
    color: "#000",
    textTransform: "capitalize",
  },
  indicator: {
    backgroundColor: "#000",
  },
  grid: {
    padding: 10,
    alignSelf: "center",
  },
  colorBox: {
    width: width / 3 - 20, // Adjust width to fit 3 items per row
    height: width / 3 - 20, // Square shape
    margin: 10,
    borderRadius: 10,
  },
});
