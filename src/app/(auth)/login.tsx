import { router } from "expo-router";
import { useState } from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Login", "Please enter email and password.");
      return;
    }

    router.replace("/(customer)/home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FurnitureHub</Text>

      <Text style={styles.subtitle}>Login to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7F4EE",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#8A6A48",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    marginBottom: 16,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#8A6A48",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  registerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#8A6A48",
  },
});
