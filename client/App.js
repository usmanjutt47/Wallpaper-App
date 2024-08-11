import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Text,
  Dimensions,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as Permissions from "expo-permissions"; // Import Permissions
import { apiCall } from "./api";
import Toast from "react-native-toast-message";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [page]);

  useEffect(() => {
    (async () => {
      // Request permissions when the component mounts
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Permission Denied",
          text2: "Media Library permission is required to save images.",
        });
      }
    })();
  }, []);

  const fetchPhotos = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const response = await apiCall({ q: query, page });

    if (response.success) {
      setPhotos((prevPhotos) => [...prevPhotos, ...response.data.hits]);
      setHasMore(response.data.hits.length > 0);
    } else {
      console.error("Error fetching photos:", response.message);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const searchPhotos = async () => {
    if (!query.trim()) return;

    setPage(1);
    setPhotos([]);
    setHasMore(true);
    fetchPhotos();
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const handleDownload = async () => {
    if (selectedImage) {
      setActionLoading(true);
      try {
        // Check for permissions again before saving
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            position: "bottom",
            text1: "Permission Denied",
            text2: "Media Library permission is required to save images.",
          });
          return;
        }

        const fileUri =
          FileSystem.documentDirectory +
          "images/" +
          new Date().getTime() +
          ".jpg";

        await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "images",
          { intermediates: true }
        );

        const { uri } = await FileSystem.downloadAsync(selectedImage, fileUri);

        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("WallpaperImages", asset, false);

        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Success",
          text2: "Image saved to gallery!",
        });
      } catch (error) {
        console.error("Error downloading or saving image:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error",
          text2: "Failed to save image.",
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleShare = async () => {
    if (selectedImage) {
      setActionLoading(true);
      try {
        const fileUri =
          FileSystem.documentDirectory +
          "images/" +
          new Date().getTime() +
          ".jpg";

        await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "images",
          { intermediates: true }
        );

        const { uri } = await FileSystem.downloadAsync(selectedImage, fileUri);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Toast.show({
            type: "info",
            position: "bottom",
            text1: "Share not available",
            text2: "Sharing functionality is not available on this device.",
          });
        }
      } catch (error) {
        console.error("Error sharing image:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error",
          text2: "Failed to share image.",
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search wallpapers"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchPhotos}
      />
      {loading && !loadingMore ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={photos}
          keyExtractor={(item) => `${item.id}-${item.largeImageURL}`}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleImagePress(item.largeImageURL)}
              style={styles.imageContainer}
            >
              <Image
                source={{ uri: item.webformatURL }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : null
          }
        />
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar style="auto" />
          {selectedImage && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
              />
              <View style={styles.buttonRow}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleDownload}
                    style={styles.button}
                  >
                    {actionLoading && actionLoading.action === "download" ? (
                      <ActivityIndicator size="small" color="#0000ff" />
                    ) : (
                      <>
                        <AntDesign name="download" size={24} color="black" />
                        <Text style={styles.buttonText}>Download</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={handleShare} style={styles.button}>
                    {actionLoading && actionLoading.action === "share" ? (
                      <ActivityIndicator size="small" color="#0000ff" />
                    ) : (
                      <>
                        <MaterialIcons name="share" size={24} color="black" />
                        <Text style={styles.buttonText}>Share</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.button}
                  >
                    <AntDesign name="close" size={24} color="black" />
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: width * 0.03,
  },
  searchInput: {
    height: height * 0.06,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
    backgroundColor: "#fff",
    marginTop: height * 0.03,
  },
  imageContainer: {
    flex: 1,
    margin: width * 0.01,
  },
  image: {
    width: "100%",
    height: width * 0.45,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "transparent",
    borderRadius: 10,
    padding: width * 0.05,
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: height * 0.4,
    borderRadius: 10,
    marginBottom: height * 0.02,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: height * 0.02,
  },
  buttonContainer: {
    position: "relative",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#cecece",
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: 5,
  },
  buttonText: {
    marginLeft: 5,
    color: "#000",
    fontWeight: "bold",
  },
});
