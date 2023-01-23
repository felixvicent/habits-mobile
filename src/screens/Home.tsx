import { useNavigation, useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { Text, View, ScrollView, Alert } from "react-native";

import { HabitDay, DAY_SIZE } from "../components/habitDay";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";

import { generateDatesFromYearBeginning } from "../utils/generate-dates-from-year-beginning";
const datesFromYearStart = generateDatesFromYearBeginning();
const minimumSummaryDatesSizes = 18 * 5;
const amountOfDaysToFill = minimumSummaryDatesSizes - datesFromYearStart.length;

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

type SummaryProps = Array<{
  id: string;
  date: string;
  amount: number;
  completed: number;
}>;

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryProps | null>(null);

  const { navigate } = useNavigation();

  async function fetchData() {
    try {
      setIsLoading(true);

      const response = await api.get("/summary");

      setSummary(response.data);
    } catch (error) {
      Alert.alert("Ops", "Não foi possível carregar o sumário de hábitos");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, index) => (
          <Text
            className="text-zinc-400 text-xl font-bold text-center mx-1"
            key={`${weekDay}-${index}`}
            style={{ width: DAY_SIZE }}
          >
            {weekDay}
          </Text>
        ))}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map((date) => {
              const dayWithHabits = summary.find(
                (day) => dayjs(date).isSame(day.date),
                "day"
              );

              return (
                <HabitDay
                  date={date}
                  amountOfHabits={dayWithHabits?.amount}
                  amountCompleted={dayWithHabits?.completed}
                  key={date.toString()}
                  onPress={() =>
                    navigate("habit", { date: date.toISOString() })
                  }
                />
              );
            })}
            {amountOfDaysToFill > 0 &&
              Array.from({ length: amountOfDaysToFill }).map((_, index) => (
                <View
                  className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                  key={index}
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                ></View>
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
