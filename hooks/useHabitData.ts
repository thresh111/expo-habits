import { DATABASE_ID, databases, HABIT_COMPLETED_COLLECTION_ID, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { Habit, HabitCompleted } from "@/types/database.type";
import { useState } from "react";
import { ID, Query } from "react-native-appwrite";
import { useAuth } from "./useAuth";

export function useHabitData() {
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabitsByToday, setCompletedHabitsByToday] = useState<string[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompleted[]>([]);

  const isCompletedHabit = (habitId: string) => {
    return completedHabitsByToday.includes(habitId);
  };

  const getHabits = async () => {
    try {
      const { documents } = await databases.listDocuments(DATABASE_ID, HABITS_COLLECTION_ID, [
        Query.equal("user_id", user?.$id ?? ""),
      ]);
      setHabits(documents as Habit[]);
    } catch (error) {
      console.log(error, "=========> error");
    }
  };

  const getCompletedHabitsByToday = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const { documents } = await databases.listDocuments(DATABASE_ID, HABIT_COMPLETED_COLLECTION_ID, [
        Query.equal("user_id", user?.$id ?? ""),
        Query.greaterThanEqual("completed_at", startOfDay.toISOString()),
        Query.lessThanEqual("completed_at", endOfDay.toISOString()),
      ]);

      const completedHabitIds = documents.map((document) => document.habit_id);
      setCompletedHabitsByToday(completedHabitIds);
    } catch (error) {
      console.log(error, "=========> error");
    }
  };

  const getCompletedHabits = async () => {
    try {
      const { documents } = await databases.listDocuments(DATABASE_ID, HABIT_COMPLETED_COLLECTION_ID, [
        Query.equal("user_id", user?.$id ?? ""),
      ]);
      setCompletedHabits(documents as HabitCompleted[]);
    } catch (error) {
      console.log(error, "=========> error");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_COLLECTION_ID, habitId);
    } catch (error) {
      console.log(error, "=========> error");
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    if (!user || completedHabitsByToday.includes(habitId)) return;

    try {
      const habit = habits.find((habit) => habit.$id === habitId)!;
      const currentDate = new Date().toISOString();

      await databases.createDocument(DATABASE_ID, HABIT_COMPLETED_COLLECTION_ID, ID.unique(), {
        habit_id: habitId,
        user_id: user.$id,
        completed_at: currentDate,
      });

      await databases.updateDocument(DATABASE_ID, HABITS_COLLECTION_ID, habitId, {
        last_completed: currentDate,
        streak_count: habit.streak_count + 1,
      });
    } catch (error) {
      console.log(error, "=========> error");
    }
  };

  return {
    habits,
    completedHabits,
    completedHabitsByToday,
    handleDeleteHabit,
    handleCompleteHabit,
    isCompletedHabit,
    getHabits,
    getCompletedHabits,
    getCompletedHabitsByToday,
  };
}
