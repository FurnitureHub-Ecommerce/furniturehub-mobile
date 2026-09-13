import { StyleSheet, Text, View } from "react-native";

export default function CustomerHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FurnitureHub</Text>
      <Text style={styles.subtitle}>Customer Home</Text>
      <Text style={styles.text}>
        Welcome to FurnitureHub!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F4EE",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#8A6A48",
  },

  subtitle: {
    fontSize: 20,
    marginTop: 8,
    fontWeight: "600",
  },

  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});