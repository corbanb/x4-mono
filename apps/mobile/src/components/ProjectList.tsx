import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { trpc } from "@x4/shared/api-client";

export function ProjectList({
  onProjectPress,
}: {
  onProjectPress?: (id: string) => void;
}) {
  const { data, isLoading, error, refetch } = trpc.projects.list.useQuery({
    limit: 50,
    offset: 0,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load projects</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!data?.items.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No projects yet</Text>
        <Text style={styles.emptySubtext}>
          Create your first project to get started
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data.items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => onProjectPress?.(item.id)}
        >
          <Text style={styles.projectName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.projectDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
  },
});
