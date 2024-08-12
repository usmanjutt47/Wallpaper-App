import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const { width, height } = Dimensions.get("window");

// Sample data with images
const Data = [
  { title: "Abstract", imageUri: require("../assets/images/abstract.png") },
  { title: "Amoled", imageUri: require("../assets/images/amoled.png") },
  { title: "Exclusive", imageUri: require("../assets/images/animal.png") },
  { title: "Games", imageUri: require("../assets/images/games.png") },
  { title: "Gradient", imageUri: require("../assets/images/gradient.png") },
  { title: "Sports", imageUri: require("../assets/images/sports.png") },
];

function CategoryCard({ title, imageUri }) {
  return (
    <View style={styles.card}>
      <Image source={imageUri} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardText}>{title}</Text>
      </View>
    </View>
  );
}

function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={Data}
        renderItem={({ item }) => (
          <CategoryCard title={item.title} imageUri={item.imageUri} />
        )}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.cardList}
      />
    </View>
  );
}

function ColorsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Colors</Text>
    </View>
  );
}

export default function CustomTabView() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "categories", title: "Categories" },
    { key: "colors", title: "Colors" },
  ]);

  const renderScene = SceneMap({
    categories: CategoriesScreen,
    colors: ColorsScreen,
  });

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
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  tabBar: {
    backgroundColor: "#fff",
    marginTop: height * 0.02,
    elevation: null,
  },
  tabLabel: {
    fontWeight: "bold",
    color: "#000",
    textTransform: "capitalize",
  },
  indicator: {
    backgroundColor: "orange",
  },
});
