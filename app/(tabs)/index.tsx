import { useAuth } from "@/hooks/useAuth";
import { useHabitData } from "@/hooks/useHabitData";
import {
  client,
  DATABASE_ID,
  HABIT_COMPLETED_COLLECTION_ID,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

const renderRightActions = () => (
  <View style={styles.rightSwipeActions}>
    <MaterialCommunityIcons name="check-circle-outline" size={32} color="#fff" />
    <Text style={styles.rightSwipeActionsText}>Completed</Text>
  </View>
);

const renderLeftActions = () => {
  return (
    <View style={styles.leftSwipeActions}>
      <MaterialCommunityIcons name="trash-can-outline" size={32} color="#fff" />
      <Text style={styles.leftSwipeActionsText}>Delete</Text>
    </View>
  );
};

export default function Index() {
  const { signOut, user } = useAuth();

  const { habits, isCompletedHabit, handleDeleteHabit, handleCompleteHabit, getHabits, getCompletedHabitsByToday } =
    useHabitData();

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    getHabits();
    getCompletedHabitsByToday();
    if (user) {
      const habitSubscriptionChannel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
      const habitCompletedSubscriptionChannel = `databases.${DATABASE_ID}.collections.${HABIT_COMPLETED_COLLECTION_ID}.documents`;

      const habitSubscription = client.subscribe(habitSubscriptionChannel, (response: RealtimeResponse) => {
        if (response.events.some((event) => event.includes("database.*.collections.*.documents.*"))) {
          getHabits();
        }
        getHabits();
      });

      const habitCompletedSubscription = client.subscribe(
        habitCompletedSubscriptionChannel,
        (response: RealtimeResponse) => {
          if (response.events.includes("database.*.collections.*.documents.*.create")) {
            getCompletedHabitsByToday();
          }
          getCompletedHabitsByToday();
        }
      );

      return () => {
        habitSubscription();
        habitCompletedSubscription();
      };
    }
  }, [user]);

  return (
    <View style={styles.view}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Today's Habits
        </Text>
        <Button onPress={signOut} mode="text" icon="logout" labelStyle={styles.signOutButton} compact>
          Sign Out
        </Button>
      </View>

      {habits.length > 0 && (
        <ScrollView style={styles.habitList} showsVerticalScrollIndicator={false}>
          {habits.map((habit) => (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[habit.$id] = ref;
              }}
              key={habit.$id}
              overshootLeft={false}
              overshootRight={false}
              renderRightActions={renderRightActions}
              renderLeftActions={renderLeftActions}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  handleDeleteHabit(habit.$id);
                } else if (direction === "right") {
                  handleCompleteHabit(habit.$id);
                }

                swipeableRefs.current[habit.$id]?.close();
              }}
            >
              <Surface style={styles.habitCard} elevation={1}>
                <View style={styles.habitHeader}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <View style={styles.frequencyBadge}>
                    <Text style={styles.frequencyText}>
                      {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.habitDescription}>{habit.description}</Text>

                <View style={styles.habitFooter}>
                  <View style={styles.streakContainer}>
                    <View style={styles.streakInfo}>
                      <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
                      <Text style={styles.streakText}>{habit.streak_count} 天</Text>
                    </View>
                  </View>

                  <View style={styles.completedContainer}>
                    {isCompletedHabit(habit.$id) ? (
                      <>
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color="#4CAF50" />
                        <Text style={styles.completedText}>已完成</Text>
                      </>
                    ) : (
                      <>
                        <AntDesign name="closecircleo" size={16} color="#666" />
                        <Text style={styles.notCompletedText}>未完成</Text>
                      </>
                    )}
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))}
        </ScrollView>
      )}

      {habits.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="notebook-plus-outline" size={80} color="#9E9E9E" />
          <Text variant="bodyLarge" style={styles.emptyText}>
            No habits yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubText}>
            Start building better habits today!
          </Text>
          <Button mode="contained" onPress={() => {}} style={styles.addButton} icon="plus">
            Add Your First Habit
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: "600",
  },
  signOutButton: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#424242",
    marginTop: 16,
  },
  emptySubText: {
    textAlign: "center",
    color: "#757575",
    marginBottom: 8,
  },
  addButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  habitList: {
    padding: 16,
    gap: 12,
  },
  habitCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  habitDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  frequencyBadge: {
    backgroundColor: "#493FFF33",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  frequencyText: {
    color: "#493FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  habitFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakContainer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4CAF50",
  },
  notCompletedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF9800",
  },
  rightSwipeActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    height: "88%",
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 20,
    marginVertical: 6,
    flex: 1,
    marginTop: 2,
    marginBottom: 18,
    gap: 4,
  },
  rightSwipeActionsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  leftSwipeActions: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "#FF5252",
    height: "88%",
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 20,
    marginVertical: 6,
    flex: 1,
    marginTop: 2,
    gap: 4,
  },
  leftSwipeActionsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
