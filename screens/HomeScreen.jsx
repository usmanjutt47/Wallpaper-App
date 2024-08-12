import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Text,
  Dimensions,
  RefreshControl,
  Pressable,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { apiCall } from "../api";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "latest", title: "Latest" },
    { key: "foryou", title: "For You" },
  ]);

  const [photos, setPhotos] = useState([]);
  const [forYouPhotos, setForYouPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [forYouPage, setForYouPage] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [forYouHasMore, setForYouHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [page]);

  useEffect(() => {
    fetchForYouPhotos();
  }, [forYouPage]);

  useEffect(() => {
    (async () => {
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
    const response = await apiCall({ q: "", page });

    if (response.success) {
      setPhotos((prevPhotos) => [...prevPhotos, ...response.data.hits]);
      setHasMore(response.data.hits.length > 0);
    } else {
      console.error("Error fetching photos:", response.message);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const fetchForYouPhotos = async () => {
    if (loading || !forYouHasMore) return;

    setLoading(true);
    const response = await apiCall({ q: "", page: forYouPage });

    if (response.success) {
      setForYouPhotos((prevPhotos) => [...prevPhotos, ...response.data.hits]);
      setForYouHasMore(response.data.hits.length > 0);
    } else {
      console.error("Error fetching For You photos:", response.message);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const handleDownload = async () => {
    if (selectedImage) {
      setActionLoading(true);
      try {
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

  const handleForYouLoadMore = () => {
    if (!loading && forYouHasMore) {
      setLoadingMore(true);
      setForYouPage((prevPage) => prevPage + 1);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setPhotos([]);
    setHasMore(true);
    await fetchPhotos();
    setRefreshing(false);
  };

  const onForYouRefresh = async () => {
    setRefreshing(true);
    setForYouPage(50); // Reset For You page to 50 on refresh
    setForYouPhotos([]);
    setForYouHasMore(true);
    await fetchForYouPhotos();
    setRefreshing(false);
  };

  const renderScene = SceneMap({
    latest: () => (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={photos}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        numColumns={2}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleImagePress(item.largeImageURL)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: item.webformatURL }}
              style={styles.image}
              resizeMode="cover"
            />
          </Pressable>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="large" color="#cecece" />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    ),
    foryou: () => (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={forYouPhotos}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        numColumns={2}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleImagePress(item.largeImageURL)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: item.webformatURL }}
              style={styles.image}
              resizeMode="cover"
            />
          </Pressable>
        )}
        onEndReached={handleForYouLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="large" color="#cecece" />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onForYouRefresh} />
        }
      />
    ),
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
                      <ActivityIndicator size="small" color="#cecece" />
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
                      <ActivityIndicator size="small" color="#cecece" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    flex: 1,
    margin: "2%",
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: height * 0.4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 400,
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: "#F0F0F1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  buttonText: {
    marginTop: 5,
    color: "#000",
    fontWeight: "bold",
  },
  tabBar: {
    backgroundColor: "#fff",
    marginTop: height * 0.02,
    width: height * 0.3,
    elevation: null,
  },
  tabLabel: {
    fontWeight: "bold",
    color: "#000",
    textTransform: "capitalize",
  },
  indicator: {
    backgroundColor: "#000",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.05,
  },
  sectionText: {
    fontSize: 18,
    color: "#000",
  },
});
