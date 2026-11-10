import * as ImagePicker from "expo-image-picker";
import { router, type RelativePathString } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createUser,
  deleteUser,
  subscribeToUsers,
  updateUser,
  uploadUserImage,
  getAuthenticatedUser,
  setAuthenticatedUser,
  type User,
  type UserFields,
} from "@/services/userService";

const EMPTY_FORM: UserFields = {
  email: "",
  matkhau: "",
  hoten: "",
  hinhanh: "",
};

type FilterField = "all" | "email" | "hoten";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFields>(EMPTY_FORM);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState<FilterField>("all");

  useEffect(() => {
    if (!getAuthenticatedUser()) {
      router.replace("/" as RelativePathString);
      return;
    }

    return subscribeToUsers(
      (nextUsers) => {
        setUsers(nextUsers);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setLoading(false);
        Alert.alert("Lỗi", "Không thể tải danh sách tài khoản.");
      },
    );
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) => {
      if (filterField === "email") {
        return user.email.toLowerCase().includes(keyword);
      }
      if (filterField === "hoten") {
        return user.hoten.toLowerCase().includes(keyword);
      }
      return [user.email, user.hoten, user.matkhau]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [filterField, search, users]);

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setSelectedImageBase64(null);
    setEditingId(null);
    setFormVisible(false);
  }, []);

  const openEditForm = (user: User) => {
    setForm({
      email: user.email,
      matkhau: user.matkhau,
      hoten: user.hoten,
      hinhanh: user.hinhanh,
    });
    setSelectedImageBase64(null);
    setEditingId(user.id);
    setFormVisible(true);
  };

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Cần cấp quyền",
        "Hãy cho phép ứng dụng truy cập thư viện ảnh để chọn hình.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setForm((current) => ({ ...current, hinhanh: asset.uri }));
      setSelectedImageBase64(asset.base64 ?? null);
    }
  };

  const validateForm = () => {
    if (!form.email.trim() || !form.matkhau || !form.hoten.trim()) {
      Alert.alert("Thiếu thông tin", "Email, mật khẩu và họ tên là bắt buộc.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      Alert.alert("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      let imageUrl = form.hinhanh;
      if (imageUrl && (selectedImageBase64 || !imageUrl.startsWith("http"))) {
        imageUrl = await uploadUserImage(imageUrl, selectedImageBase64 ?? undefined);
      }

      const fields: UserFields = {
        email: form.email.trim().toLowerCase(),
        matkhau: form.matkhau,
        hoten: form.hoten.trim(),
        hinhanh: imageUrl,
      };
      if (editingId) {
        await updateUser(editingId, fields);
      } else {
        await createUser(fields);
      }
      resetForm();
    } catch (error) {
      console.error("Save user error:", error);
      Alert.alert("Lỗi", "Không thể lưu tài khoản hoặc hình ảnh.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user: User) => {
    Alert.alert("Xóa tài khoản", `Bạn có chắc muốn xóa ${user.email}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(user.id);
          } catch (error) {
            console.error("Delete user error:", error);
            Alert.alert("Lỗi", "Không thể xóa tài khoản.");
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      {item.hinhanh ? (
        <Image source={{ uri: item.hinhanh }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>
            {item.hoten.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.hoten}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPassword}>Mật khẩu: {item.matkhau}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditForm(item)}>
          <Text style={styles.editText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Quản lý tài khoản</Text>
            <Text style={styles.subtitle}>{users.length} tài khoản</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setAuthenticatedUser(null);
              router.replace("/");
            }}
          >
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Tìm kiếm tài khoản..."
          placeholderTextColor="#8A8F98"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.filterRow}>
          {(
            [
              ["all", "Tất cả"],
              ["email", "Email"],
              ["hoten", "Họ tên"],
            ] as const
          ).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.filterButton,
                filterField === value && styles.filterButtonActive,
              ]}
              onPress={() => setFilterField(value)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterField === value && styles.filterTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => {
          setForm({ ...EMPTY_FORM });
          setSelectedImageBase64(null);
          setEditingId(null);
          setFormVisible(true);
        }}>
          <Text style={styles.addButtonText}>+ Thêm tài khoản</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#4F46E5" />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không tìm thấy tài khoản.</Text>
            }
          />
        )}

        <Modal visible={formVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {editingId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}
              </Text>
              {(["email", "matkhau", "hoten"] as const).map((field) => (
                <TextInput
                  key={field}
                  style={styles.input}
                  placeholder={
                    field === "email"
                      ? "Email"
                      : field === "matkhau"
                        ? "Mật khẩu"
                        : "Họ tên"
                  }
                  placeholderTextColor="#8A8F98"
                  secureTextEntry={field === "matkhau"}
                  autoCapitalize={field === "email" ? "none" : "sentences"}
                  keyboardType={field === "email" ? "email-address" : "default"}
                  value={form[field]}
                  onChangeText={(value) =>
                    setForm((current) => ({ ...current, [field]: value }))
                  }
                />
              ))}
              <TouchableOpacity style={styles.imageButton} onPress={chooseImage}>
                <Text style={styles.imageButtonText}>
                  Chọn hình ảnh từ thiết bị
                </Text>
              </TouchableOpacity>
              {form.hinhanh ? (
                <Image source={{ uri: form.hinhanh }} style={styles.preview} />
              ) : null}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveText}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F6FA" },
  container: { flex: 1, paddingHorizontal: 18 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  title: { color: "#20242C", fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#68707D", marginTop: 4 },
  logoutText: { color: "#DC2626", fontWeight: "600" },
  search: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    color: "#20242C",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  filterRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  filterButton: {
    backgroundColor: "#E8EBF0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterButtonActive: { backgroundColor: "#4F46E5" },
  filterText: { color: "#59616E" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "700" },
  addButton: {
    alignItems: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 13,
  },
  addButtonText: { color: "#FFFFFF", fontWeight: "700" },
  loader: { marginTop: 40 },
  list: { gap: 10, paddingBottom: 24 },
  emptyText: { color: "#68707D", paddingTop: 40, textAlign: "center" },
  userCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    padding: 12,
  },
  avatar: { borderRadius: 28, height: 56, width: 56 },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#DDE1FF",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: { color: "#4F46E5", fontSize: 22, fontWeight: "700" },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { color: "#20242C", fontSize: 16, fontWeight: "700" },
  userEmail: { color: "#59616E", marginTop: 3 },
  userPassword: { color: "#8A8F98", fontSize: 12, marginTop: 3 },
  actions: { gap: 8 },
  editText: { color: "#4F46E5", fontWeight: "600" },
  deleteText: { color: "#DC2626", fontWeight: "600" },
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  modalTitle: {
    color: "#20242C",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F1F3F6",
    borderRadius: 10,
    color: "#20242C",
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  imageButton: {
    alignItems: "center",
    borderColor: "#4F46E5",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 11,
  },
  imageButtonText: { color: "#4F46E5", fontWeight: "600" },
  preview: {
    alignSelf: "center",
    borderRadius: 38,
    height: 76,
    marginTop: 12,
    width: 76,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  cancelButton: {
    alignItems: "center",
    backgroundColor: "#E8EBF0",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 13,
  },
  cancelText: { color: "#59616E", fontWeight: "700" },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 13,
  },
  saveText: { color: "#FFFFFF", fontWeight: "700" },
});
