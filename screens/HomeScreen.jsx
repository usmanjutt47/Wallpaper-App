import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Text,
} from "react-native";
import { apiCall } from "../api/api";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";

const { width, height } = Dimensions.get("window");

export default function Home() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleChangeText = (text) => {
    setSearchText(text);
  };

  const handleClear = () => {
    setSearchText("");
  };

  const fetchImages = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await apiCall({ q: "nature", page: page });

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
    fetchImages();
  }, []);

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="auto" />
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={24}
          color="gray"
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={handleChangeText}
          cursorColor={"#000"}
        />
        {searchText.length > 0 && (
          <Pressable onPress={handleClear} style={{ marginLeft: 10 }}>
            <Ionicons name="close-circle" size={24} color="gray" />
          </Pressable>
        )}
      </View>
      <FlatList
        key={2}
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => handleImagePress(index)}>
            <Image source={{ uri: item.largeImageURL }} style={styles.image} />
          </Pressable>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.imageList}
        numColumns={2}
        onEndReached={fetchImages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Carousel
            width={width * 0.9}
            height={height * 0.9}
            autoPlay={true}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.largeImageURL }}
                style={styles.modalImage}
              />
            )}
            mode="parallax"
            defaultIndex={selectedImageIndex}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  searchContainer: {
    backgroundColor: "#fff",
    height: 50,
    width: "95%",
    margin: 5,
    alignSelf: "center",
    marginTop: height * 0.05,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 10,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  image: {
    width: width / 2 - 15,
    height: height * 0.4,
    borderRadius: 12,
    overflow: "hidden",
    margin: 5,
  },
  imageList: {
    alignSelf: "center",
  },
  modalContainer: {
    backgroundColor: "grey",
    width: "100%",
    height: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  modalImage: {
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 12,
    alignSelf: "center",
  },
});
