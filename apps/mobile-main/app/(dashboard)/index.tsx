import { View, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ProjectList } from "@/components/ProjectList";

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <Pressable
          style={styles.newButton}
          onPress={() => router.push("/(dashboard)/new")}
        >
          <Text style={styles.newButtonText}>New Project</Text>
        </Pressable>
      </View>
      <ProjectList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  newButton: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  newButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
