import { router, type RelativePathString } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  authenticateUser,
  setAuthenticatedUser,
} from "@/services/userService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [matkhau, setMatkhau] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !matkhau) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const user = await authenticateUser(email, matkhau);
      if (!user) {
        Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không đúng.");
        return;
      }
      setAuthenticatedUser(user);
      router.replace("/users" as RelativePathString);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Lỗi", "Không thể đăng nhập. Hãy kiểm tra kết nối Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Quản trị tài khoản</Text>
          <Text style={styles.subtitle}>Đăng nhập dành cho admin</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8A8F98"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#8A8F98"
            secureTextEntry
            value={matkhau}
            onChangeText={setMatkhau}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F6FA" },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: { color: "#20242C", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#68707D", fontSize: 15, marginTop: 8, marginBottom: 24 },
  input: {
    backgroundColor: "#F1F3F6",
    borderRadius: 12,
    color: "#20242C",
    fontSize: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 15,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
