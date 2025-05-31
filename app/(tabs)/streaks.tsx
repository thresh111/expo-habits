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
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

interface StreakData {
  streak: number;
  bestStreak: number;
  total: number;
}

export default function Streaks() {
  const { user } = useAuth();

  const { habits, completedHabits, getHabits, getCompletedHabits } = useHabitData();

  useEffect(() => {
    getHabits();
    getCompletedHabits();

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
            getCompletedHabits();
          }
          getCompletedHabits();
        }
      );

      return () => {
        habitSubscription();
        habitCompletedSubscription();
      };
    }
  }, [user]);

  const getStreakData = (habitId: string) => {
    const habitCompletions = completedHabits
      .filter((habit) => habit.habit_id === habitId)
      .sort((a, b) => {
        const dateA = new Date(a.completed_at);
        const dateB = new Date(b.completed_at);
        return dateA.getTime() - dateB.getTime();
      });

    if (habitCompletions.length === 0) {
      return {
        streak: 0,
        bestStreak: 0,
        total: 0,
      };
    }

    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions.length;

    let lastDate: Date | null = null;

    let currentStreak = 0;

    habitCompletions.forEach((completion) => {
      const completionDate = new Date(completion.completed_at);
      if (lastDate) {
        const diffTime = Math.abs(completionDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1.5) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        streak = currentStreak;
        lastDate = completionDate;
      }
    });

    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreakData(habit.$id);
    return {
      habit,
      streak,
      bestStreak,
      total,
    };
  });

  const rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);

  return (
    <View style={styles.view}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Habit Streaks
        </Text>
      </View>

      <View style={styles.container}>
        {habits.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="notebook-plus-outline" size={80} color="#9E9E9E" />
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubText}>Start building better habits today!</Text>
            <Button mode="contained" onPress={() => {}} icon="plus">
              Add Your First Habit
            </Button>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {rankedHabits.length > 0 &&
            rankedHabits.map(({ habit, streak, bestStreak, total }, key) => {
              return (
                <Card key={key} style={styles.card}>
                  <Card.Content style={styles.cardContent}>
                    {key < 3 && (
                      <View style={styles.rankBadge}>
                        {key === 0 && (
                          <>
                            <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
                            <Text style={[styles.rankText, { color: "#FFD700" }]}>冠军</Text>
                          </>
                        )}
                        {key === 1 && (
                          <>
                            <MaterialCommunityIcons name="medal" size={20} color="#C0C0C0" />
                            <Text style={[styles.rankText, { color: "#C0C0C0" }]}>亚军</Text>
                          </>
                        )}
                        {key === 2 && (
                          <>
                            <MaterialCommunityIcons name="medal" size={20} color="#CD7F32" />
                            <Text style={[styles.rankText, { color: "#CD7F32" }]}>季军</Text>
                          </>
                        )}
                      </View>
                    )}

                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    <Text style={styles.habitDescription}>{habit.description}</Text>

                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <MaterialCommunityIcons name="fire" size={20} color="#493FFF" />
                        <Text style={styles.statText}>{streak} 天连续</Text>
                      </View>

                      <View style={styles.statItem}>
                        <AntDesign name="Trophy" size={20} color="#493FFF" />
                        <Text style={styles.statText}>最佳 {bestStreak}</Text>
                      </View>

                      <View style={styles.statItem}>
                        <AntDesign name="checksquareo" size={20} color="#493FFF" />
                        <Text style={styles.statText}>总计 {total}</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    padding: 16,
    flex: 1,
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
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
  cardContent: {
    padding: 16,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  habitDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#493FFF11",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#493FFF",
  },
  rankBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
