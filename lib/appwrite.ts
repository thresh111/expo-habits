import { Account, Client, Databases } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6839da5d000941c46fc5")
  .setPlatform("app.habit.tracker");

export const account = new Account(client);

export const databases = new Databases(client);

export const DATABASE_ID = process.env.EXPO_PUBLIC_DB_ID!;
export const HABITS_COLLECTION_ID = process.env.EXPO_PUBLIC_HABITS_COLLECTION_ID!;

export const HABIT_COMPLETED_COLLECTION_ID = process.env.EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID!;

export interface RealtimeResponse {
  events: string[];
  payload: {};
}
