import React, { useState } from "react";
import { View, Text, Switch } from "react-native";
import { expo } from "../app.json";

const Menu = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const [setAlarm, setSetAlarm] = useState(false);

  return (
    <View className="bg-slate-100 h-full flex justify-between">
      <View>
        <Text className="text-2xl text-center font-semibold py-4">Settings</Text>

        <View className="flex-row justify-between items-center px-4 py-2">
          <Text className="text-lg">Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
          />
        </View>

        <View className="flex-row justify-between items-center px-4 py-2">
          <Text className="text-lg">Send Notification</Text>
          <Switch
            value={sendNotification}
            onValueChange={setSendNotification}
          />
        </View>

        <View className="flex-row justify-between items-center px-4 py-2">
          <Text className="text-lg">Set Alarm</Text>
          <Switch
            value={setAlarm}
            onValueChange={setSetAlarm}
          />
        </View>
      </View>

      <View className="items-center pb-4">
        <Text className="text-sm text-gray-500">App version: {expo.version}</Text>
      </View>
    </View>
  );
};

export default Menu;
