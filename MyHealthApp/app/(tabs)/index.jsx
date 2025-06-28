import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, Platform } from "react-native";
import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from "react-native-health-connect";

const delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RECORD_TYPES = [
  { key: "Steps", label: "stepsData" },
  { key: "ExerciseSession", label: "exerciseSessionsData" },
  { key: "TotalCaloriesBurned", label: "totalCaloriesData" },
  { key: "SleepSession", label: "sleepSessionsData" },
  { key: "HeartRate", label: "heartRateData" },
  { key: "RestingHeartRate", label: "restingHeartRateData" },
];

export default function HealthConnectAllDataScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "android") {
      setLoading(false);
      return;
    }

    const initAndFetch = async () => {
      try {
        setLoading(true);

        // 1. Check Health Connect availability
        const status = await getSdkStatus();
        if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
          Alert.alert(
            "Health Connect is not installed.",
            "Please install Health Connect from the Google Play Store."
          );
          setLoading(false);
          return;
        }
        if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
          Alert.alert(
            "Health Connect needs to be updated.",
            "Please update Health Connect from the Google Play Store."
          );
          setLoading(false);
          return;
        }

        // 2. Initialize Health Connect
        await initialize();
        await delay(500);

        // 3. Request all permissions
        const granted = await requestPermission(
          RECORD_TYPES.map((r) => ({ accessType: "read", recordType: r.key }))
        );
        if (!granted) {
          Alert.alert("Permission denied", "Cannot access health data.");
          setLoading(false);
          return;
        }

        // 4. Fetch and print all data types
        await fetchAllHealthData();

      } catch (error) {
        console.error(error);
        Alert.alert("Error", "An error occurred.");
        setLoading(false);
      }
    };

    initAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllHealthData = async () => {
  try {
    setLoading(true);

    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOfDay = yesterday.toISOString();
    const currentTime = now.toISOString();
    const options = {
      timeRangeFilter: {
        operator: "between",
        startTime: startOfDay,
        endTime: currentTime,
      },
    };

    let formatted = {
      steps: 0,
      exerciseMinutes: 0,
      totalCaloriesBurned: 0,
      sleepDuration: 0,
      sleepStages: { rem: 0, light: 0, deep: 0 },
      heartRate: null,
      restingHeartRate: null,
    };

    for (const rec of RECORD_TYPES) {
      try {
        const { records } = await readRecords(rec.key, options);

        if (rec.key === "Steps" && Array.isArray(records)) {
          formatted.steps = records.reduce((sum, r) => sum + (r.count || 0), 0);

        } else if (rec.key === "ExerciseSession" && Array.isArray(records)) {
          for (const session of records) {
            const segments = session.segments || [];
            for (const seg of segments) {
              if (seg.startTime && seg.endTime) {
                const dur = (new Date(seg.endTime) - new Date(seg.startTime)) / 60000;
                formatted.exerciseMinutes += dur;
              }
            }
          }

        } else if (rec.key === "TotalCaloriesBurned" && Array.isArray(records)) {
          for (const r of records) {
            if (r.energy?.inKilocalories) {
              formatted.totalCaloriesBurned += r.energy.inKilocalories;
            }
          }

        } else if (rec.key === "SleepSession" && Array.isArray(records) && records.length > 0) {
          const session = records[0]; // Assume one session per night
          if (session.startTime && session.endTime) {
            formatted.sleepDuration =
              (new Date(session.endTime) - new Date(session.startTime)) / 60000;
          }

          if (Array.isArray(session.stages)) {
            for (const stage of session.stages) {
              const dur = (new Date(stage.endTime) - new Date(stage.startTime)) / 60000;
              switch (stage.stage) {
                case 5:
                  formatted.sleepStages.rem += dur;
                  break;
                case 4:
                  formatted.sleepStages.light += dur;
                  break;
                case 6:
                  formatted.sleepStages.deep += dur;
                  break;
              }
            }
          }

        } else if (rec.key === "HeartRate" && Array.isArray(records)) {
          let allSamples = [];
          for (const r of records) {
            if (Array.isArray(r.samples)) {
              allSamples.push(...r.samples);
            }
          }
          const values = allSamples.map(s => s.beatsPerMinute).filter(Number.isFinite);
          if (values.length > 0) {
            const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
            formatted.heartRate = Number(avg.toFixed(2));
          }

        } else if (rec.key === "RestingHeartRate" && Array.isArray(records) && records.length > 0) {
          formatted.restingHeartRate = records[0].beatsPerMinute || null;
        }

      } catch (error) {
        console.error(`Error fetching ${rec.label}:`, error);
      }
    }

    console.log("\n==== FORMATTED HEALTH DATA ====");
    console.log(JSON.stringify(formatted, null, 2));

    setLoading(false);
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Could not fetch health data.");
    setLoading(false);
  }
};


  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-2xl font-bold mb-4 text-red-500">
        Health Connect Data
      </Text>
      {Platform.OS === "android" && (
        <Button title="Refresh" onPress={fetchAllHealthData} disabled={loading} />
      )}
      {loading && (
        <Text className="text-base text-gray-400 mt-4">Loading...</Text>
      )}
    </View>
  );
}
