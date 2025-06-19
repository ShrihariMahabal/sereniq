import { supabase } from "@/lib/supabase";
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

export default function HomeScreen() {
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "android") {
      setSteps(null);
      setLoading(false);
      return;
    }

    const getDataFromSupabase = async () => {
      const {data, error} = await supabase.from("users").select("*");
      console.log(data, error);
    }
    getDataFromSupabase();

    const getPermissionAndFetchSteps = async () => {
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

        // 3. Wait a moment after init
        await delay(500);

        // 4. Request permission to read steps
        const granted = await requestPermission([
          { accessType: "read", recordType: "Steps" },
        ]);
        if (!granted) {
          Alert.alert("Permission denied", "Cannot access step data.");
          setLoading(false);
          return;
        }

        // 5. Fetch today's steps
        await fetchSteps();
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "An error occurred.");
        setLoading(false);
      }
    };

    getPermissionAndFetchSteps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSteps = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const currentTime = now.toISOString();

      const stepsData = await readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: startOfDay,
          endTime: currentTime,
        },
      });

      console.log("stepsData:", stepsData);

      let totalSteps = 0;
      if (Array.isArray(stepsData)) {
        totalSteps = stepsData.reduce((sum, entry) => sum + (entry.count || 0), 0);
      }

      setSteps(totalSteps);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch steps.");
      setSteps(null);
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <View className="w-10 h-10 bg-primary rounded-full mb-4"> 

      </View>
      <Text className="text-2xl font-bold mb-4 text-red-500">
        Hello
      </Text>
      {Platform.OS === "android" && (
        <Button title="Refresh" onPress={fetchSteps} disabled={loading} />
      )}
    </View>
  );
}
