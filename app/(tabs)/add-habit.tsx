import { useAuth } from "@/hooks/useAuth";
import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";

const FREQUENCY_OPTIONS = ["daily", "weekly", "monthly"];

type Frequency = (typeof FREQUENCY_OPTIONS)[number];

export default function AddHabit() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");

  const [error, setError] = useState<string | null>(null);

  const handleAddHabit = async () => {
    if (!user) return;

    try {
      await databases.createDocument(DATABASE_ID, HABITS_COLLECTION_ID, ID.unique(), {
        user_id: user.$id,
        title,
        description,
        frequency,
        streak_count: 0,
        created_at: new Date().toISOString(),
        last_completed: new Date().toISOString(),
      });

      router.back();

      setTitle("");
      setDescription("");
      setFrequency("daily");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("There was an error adding the habit");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput label={"Title"} mode={"outlined"} value={title} onChangeText={setTitle} />
      <TextInput label={"Description"} mode={"outlined"} value={description} onChangeText={setDescription} />

      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          buttons={FREQUENCY_OPTIONS.map((option) => ({
            value: option,
            label: option.charAt(0).toUpperCase() + option.slice(1),
          }))}
          value={frequency}
          onValueChange={(val: Frequency) => setFrequency(val)}
        />
      </View>

      <Button mode={"contained"} disabled={!title || !description} onPress={handleAddHabit}>
        Add Habit
      </Button>
      {error && <Text style={{ color: colors.error }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    flexDirection: "column",
    gap: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  frequencyContainer: {
    marginBottom: 24,
  },
});
