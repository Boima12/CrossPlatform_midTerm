import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "@/firebaseConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Item {
    id: string;
    name: string;
    quantity: number;
    category: string;
    location: string;
    createdAt: Timestamp | null;
}

// ─── Category colors ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
    Electronics: "#6C5CE7",
    Furniture: "#00B894",
    Clothing: "#E17055",
    Food: "#FDCB6E",
    Tools: "#0984E3",
    Other: "#636E72",
};

function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] ?? "#6366F1";
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function InventoryScreen() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");

    // Edit mode
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formVisible, setFormVisible] = useState(false);

    // ── Real-time listener ────────────────────────────────────────────────────

    useEffect(() => {
        const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetched: Item[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...(d.data() as Omit<Item, "id">),
                }));
                setItems(fetched);
                setLoading(false);
            },
            (error) => {
                console.error("Firestore listener error:", error);
                setLoading(false);
            },
        );
        return unsubscribe;
    }, []);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const resetForm = useCallback(() => {
        setName("");
        setQuantity("");
        setCategory("");
        setLocation("");
        setEditingId(null);
        setFormVisible(false);
    }, []);

    const validate = (): boolean => {
        if (!name.trim()) {
            Alert.alert("Validation", "Item name is required.");
            return false;
        }
        if (
            !quantity.trim() ||
            isNaN(Number(quantity)) ||
            Number(quantity) < 0
        ) {
            Alert.alert(
                "Validation",
                "Quantity must be a non-negative number.",
            );
            return false;
        }
        if (!category.trim()) {
            Alert.alert("Validation", "Category is required.");
            return false;
        }
        if (!location.trim()) {
            Alert.alert("Validation", "Location is required.");
            return false;
        }
        return true;
    };

    // ── Create ─────────────────────────────────────────────────────────────────

    const handleAdd = async () => {
        if (!validate()) return;
        try {
            await addDoc(collection(db, "items"), {
                name: name.trim(),
                quantity: Number(quantity),
                category: category.trim(),
                location: location.trim(),
                createdAt: serverTimestamp(),
            });
            resetForm();
        } catch (error) {
            console.error("Error adding item:", error);
            Alert.alert("Error", "Failed to add item.");
        }
    };

    // ── Update ─────────────────────────────────────────────────────────────────

    const handleUpdate = async () => {
        if (!editingId || !validate()) return;
        try {
            await updateDoc(doc(db, "items", editingId), {
                name: name.trim(),
                quantity: Number(quantity),
                category: category.trim(),
                location: location.trim(),
            });
            resetForm();
        } catch (error) {
            console.error("Error updating item:", error);
            Alert.alert("Error", "Failed to update item.");
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────

    const handleDelete = (id: string, itemName: string) => {
        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete ${itemName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "items", id));
                        } catch (error) {
                            console.error("Error deleting item:", error);
                            Alert.alert("Error", "Failed to delete item.");
                        }
                    },
                },
            ],
        );
    };

    // ── Populate form for editing ──────────────────────────────────────────────

    const startEditing = (item: Item) => {
        setName(item.name);
        setQuantity(String(item.quantity));
        setCategory(item.category);
        setLocation(item.location);
        setEditingId(item.id);
        setFormVisible(true);
    };

    // ── Render an item card ────────────────────────────────────────────────────

    const renderItem = ({ item }: { item: Item }) => {
        const catColor = getCategoryColor(item.category);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                        <Text style={styles.cardName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <View
                            style={[
                                styles.badge,
                                { backgroundColor: catColor + "22" },
                            ]}
                        >
                            <Text
                                style={[styles.badgeText, { color: catColor }]}
                            >
                                {item.category}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cardMeta}>
                        <Text style={styles.metaLabel}>
                            Qty:{" "}
                            <Text style={styles.metaValue}>
                                {item.quantity}
                            </Text>
                        </Text>
                        <Text style={styles.metaDivider}>·</Text>
                        <Text style={styles.metaLabel}>
                            Location:{" "}
                            <Text style={styles.metaValue}>
                                {item.location}
                            </Text>
                        </Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => startEditing(item)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item.id, item.name)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // ── Main render ────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.flex}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Inventory</Text>
                        <Text style={styles.headerSubtitle}>
                            {items.length} items in stock
                        </Text>
                    </View>

                    {/* Toggle form button */}
                    {!formVisible && (
                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => setFormVisible(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.fabText}>+ Add Item</Text>
                        </TouchableOpacity>
                    )}

                    {/* Form */}
                    {formVisible && (
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>
                                {editingId ? "Edit Item" : "New Item"}
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Item name"
                                placeholderTextColor="#6B7280"
                                value={name}
                                onChangeText={setName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Quantity"
                                placeholderTextColor="#6B7280"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Category"
                                placeholderTextColor="#6B7280"
                                value={category}
                                onChangeText={setCategory}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Location"
                                placeholderTextColor="#6B7280"
                                value={location}
                                onChangeText={setLocation}
                            />

                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={resetForm}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelBtnText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={
                                        editingId ? handleUpdate : handleAdd
                                    }
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.submitBtnText}>
                                        {editingId ? "Update" : "Add"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Item list */}
                    {loading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color="#6366F1" />
                            <Text style={styles.loadingText}>
                                Loading inventory…
                            </Text>
                        </View>
                    ) : items.length === 0 ? (
                        <View style={styles.centered}>
                            <Text style={styles.emptyIcon}>📦</Text>
                            <Text style={styles.emptyTitle}>No items yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Tap + Add Item to create your first inventory
                                entry.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#0F111A",
    },
    safe: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },

    // FAB
    fab: {
        marginHorizontal: 20,
        marginVertical: 12,
        backgroundColor: "#6366F1",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    // Form
    formCard: {
        marginHorizontal: 20,
        marginVertical: 12,
        backgroundColor: "#1A1D2E",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#2A2D3E",
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    input: {
        backgroundColor: "#0F111A",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: "#FFFFFF",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#2A2D3E",
    },
    formActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 4,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "#2A2D3E",
    },
    cancelBtnText: {
        color: "#9CA3AF",
        fontSize: 15,
        fontWeight: "600",
    },
    submitBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "#6366F1",
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    submitBtnText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    // List
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        gap: 12,
    },

    // Card
    card: {
        backgroundColor: "#1A1D2E",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2D3E",
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    cardName: {
        fontSize: 17,
        fontWeight: "700",
        color: "#FFFFFF",
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
    },
    metaLabel: {
        fontSize: 13,
        color: "#6B7280",
    },
    metaValue: {
        color: "#D1D5DB",
        fontWeight: "600",
    },
    metaDivider: {
        color: "#4B5563",
        marginHorizontal: 8,
        fontSize: 13,
    },

    // Card actions
    cardActions: {
        flexDirection: "row",
        gap: 10,
    },
    editBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "#6366F120",
        borderWidth: 1,
        borderColor: "#6366F140",
    },
    editBtnText: {
        color: "#818CF8",
        fontSize: 14,
        fontWeight: "600",
    },
    deleteBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "#EF444420",
        borderWidth: 1,
        borderColor: "#EF444440",
    },
    deleteBtnText: {
        color: "#F87171",
        fontSize: 14,
        fontWeight: "600",
    },

    // States
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    loadingText: {
        color: "#6B7280",
        marginTop: 12,
        fontSize: 14,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
    },
});
