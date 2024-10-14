import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { expo } from "../app.json";
import { Feather } from "@expo/vector-icons";

interface MenuProps {
  isNotificationEnabled: boolean;
  isAlarmEnabled: boolean;
  toggleNotification: () => void;
  toggleAlarm: () => void;
}

const Menu: React.FC<MenuProps> = ({
  isNotificationEnabled,
  isAlarmEnabled,
  toggleNotification,
  toggleAlarm,
}) => {
  const handleContribute = () => {
    Linking.openURL("https://github.com/biplabroy-1/remind-me-v4-application");
  };

  return (
    <View className="bg-slate-100 flex-1">
      <View className="p-6">
        <Text className="text-3xl font-bold text-center text-indigo-800 mb-8">
          Settings
        </Text>

        <View className="bg-white rounded-lg shadow-md p-4 mb-6">
          {/* Notification Switch */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-medium text-gray-700">
              Send Notification
            </Text>
            <Switch
              value={isNotificationEnabled}
              onValueChange={toggleNotification}
              trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
              thumbColor={isNotificationEnabled ? "#4f46e5" : "#f4f4f5"}
            />
          </View>

          {/* Alarm Switch */}
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-medium text-gray-700">Set Alarm</Text>
            <Switch
              value={isAlarmEnabled}
              onValueChange={toggleAlarm}
              trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
              thumbColor={isAlarmEnabled ? "#4f46e5" : "#f4f4f5"}
            />
          </View>
        </View>

        {/* How this app works */}
        <View className="bg-indigo-50 rounded-lg p-4 mb-6">
          <Text className="text-xl font-semibold text-indigo-800 mb-2">
            How this app works
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed">
            This app is your personal class schedule manager. It sends timely
            notifications before each class and can set alarms to ensure you're
            always punctual. You can easily customize your schedule and tweak
            settings to perfectly fit your academic routine.
          </Text>
        </View>

        {/* Contribute Section */}
        <TouchableOpacity
          onPress={handleContribute}
          className="bg-indigo-600 rounded-lg p-4 flex-row items-center justify-center"
        >
          <Feather name="github" size={24} color="white" className="mr-2" />
          <Text className="text-lg font-semibold text-white">
            {" "}
            Contribute to this app
          </Text>
        </TouchableOpacity>
      </View>

      {/* Display App Version */}
      <View className="items-center pb-6 mt-auto">
        <Text className="text-sm text-gray-500">
          App version: {expo.version}
        </Text>
        <Text className="text-sm text-gray-500">Developer: {expo.devs.lead}</Text>
      </View>
    </View>
  );
};

export default Menu;
