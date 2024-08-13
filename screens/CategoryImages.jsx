import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { apiCall } from "../api/api";

const { width, height } = Dimensions.get("window");

export default function CategoryImages({ route }) {
  const { images = [], categoryName = "" } = route.params || {};

  const [data, setData] = useState(images);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreImages = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await apiCall({ q: categoryName, page: page + 1 });

      if (response.success) {
        if (response.data.hits.length > 0) {
          setData((prevData) => [...prevData, ...response.data.hits]);
          setPage((prevPage) => prevPage + 1);
        } else {
          setHasMore(false);
        }
      } else {
        console.error("API call failed:", response.message);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(images);
    setPage(1);
    setHasMore(true);
  }, [images]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{categoryName}</Text>
      <FlatList
      showsVerticalScrollIndicator={false}
        data={data}
        renderItem={({ item }) => (
          <Image source={{ uri: item.largeImageURL }} style={styles.image} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.imageList}
        numColumns={3}
        onEndReached={fetchMoreImages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  title: {
    fontSize: height * 0.05,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: width / 3 - 15,
    height: height * 0.25,
    margin: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  imageList: {
    alignSelf: "center",
  },
});
