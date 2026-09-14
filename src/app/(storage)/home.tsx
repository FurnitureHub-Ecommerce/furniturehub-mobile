import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function StorageHomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back 👋</Text>
            <Text style={styles.title}>Storage Manager</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>V</Text>
          </View>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>Inventory Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statNumber}>128</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚠️</Text>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⬇️</Text>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Imports</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⬆️</Text>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Exports</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionCard}>
          <Pressable
            style={styles.actionItem}
            onPress={() => router.push("/(storage)/inventory")}
          >
            <Text style={styles.actionIcon}>📋</Text>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Inventory</Text>
              <Text style={styles.actionDescription}>
                View and manage product stock
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable
            style={styles.actionItem}
            onPress={() => router.push("/(storage)/import")}
          >
            <Text style={styles.actionIcon}>📥</Text>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Import Stock</Text>
              <Text style={styles.actionDescription}>
                Add products to inventory
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable
            style={styles.actionItem}
            onPress={() => router.push("/(storage)/export")}
          >
            <Text style={styles.actionIcon}>📤</Text>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Export Stock</Text>
              <Text style={styles.actionDescription}>
                Remove products from inventory
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable
            style={styles.actionItem}
            onPress={() => router.push("/(storage)/adjustment")}
          >
            <Text style={styles.actionIcon}>🔧</Text>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Stock Adjustment</Text>
              <Text style={styles.actionDescription}>
                Adjust inventory quantity
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable
            style={[styles.actionItem, styles.lastAction]}
            onPress={() => router.push("/(storage)/history")}
          >
            <Text style={styles.actionIcon}>🕒</Text>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Inventory History</Text>
              <Text style={styles.actionDescription}>
                View stock transaction history
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcome: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#5C4632",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#8A6A48",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#4F3B2A",
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 14,
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    minHeight: 120,
    justifyContent: "center",
  },

  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "700",
    color: "#5C4632",
  },

  statLabel: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  actionCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 24,
    marginBottom: 30,
    borderRadius: 18,
    overflow: "hidden",
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0ECE6",
  },

  lastAction: {
    borderBottomWidth: 0,
  },

  actionIcon: {
    fontSize: 25,
    width: 45,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F3B2A",
  },

  actionDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  arrow: {
    fontSize: 28,
    color: "#A38B72",
  },
});