import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

const LoadingCard = () => {
  const translateX = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 300,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -300,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateX]);

  return (
    <View style={styles.loadingCard}>
      <Animated.View
        style={[
          styles.loadingLine,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingCard: {
    backgroundColor: "#e0e0e0",
    height: 200,
    width: "90%",
    borderRadius: 10,
    margin: 10,
    alignSelf: "center",
    overflow: "hidden",
  },
  loadingLine: {
    backgroundColor: "#c0c0c0",
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: -300,
  },
});

export default LoadingCard;
