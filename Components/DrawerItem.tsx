import React from "react";
import {
  View,
  Text,
  Switch,
  Pressable,
  Linking,
  ScrollView,
} from "react-native";
import { expo } from "../app.json";
import { Feather } from "@expo/vector-icons";
import ToggleSwitch from "toggle-switch-react-native";

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

  const handleSupport = () => {
    Linking.openURL("upi://pay?pa=biplabroy@slice&pn=Biplab%20Roy");
  };

  return (
    <View className="bg-slate-100 flex-1">
      <ScrollView>
        <View className="p-4">
          <Text className="p-6 text-3xl font-bold text-center text-indigo-800">
            Remind Me
          </Text>
          <View className="h-px w-full bg-gray-300 mb-6" />

          <View className="bg-white rounded-lg shadow-md p-4 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-medium text-gray-700">
                Send Notification
              </Text>
              <ToggleSwitch
                isOn={isNotificationEnabled}
                onToggle={toggleNotification}
                size="medium"
                onColor="#4f46e5"
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-medium text-gray-700">
                Set Alarm
              </Text>
              <ToggleSwitch
                isOn={isAlarmEnabled}
                onToggle={toggleAlarm}
                size="medium"
                onColor="#4f46e5"
              />
            </View>
          </View>

          <View className="p-4 bg-gray-100 rounded-lg mt-4">
            <Text className="text-lg font-semibold text-gray-800">
              Contribute to Remind Me
            </Text>
            <Text className="text-sm text-gray-600 mt-2">
              Love the app? Help us make it even better! Your feedback and
              contributions are always welcome. Feel free to suggest features,
              report bugs, or contribute to the codebase.
            </Text>
          </View>

          <Pressable
            onPress={handleContribute}
            className="bg-indigo-600 rounded-lg p-4 flex-row items-center justify-center mt-4"
          >
            <Feather name="github" size={24} color="white" className="mr-2" />
            <Text className="text-lg text-white"> Contribute</Text>
          </Pressable>

          <Pressable
            onPress={handleSupport}
            className="bg-yellow-400 rounded-lg p-4 flex-row items-center justify-center mt-4"
          >
            <Feather name="coffee" size={24} color="black" className="mr-2" />
            <Text className="text-lg text-black"> Buy me a coffee</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View className="items-center pb-6 mt-auto">
        <Text className="text-sm text-gray-500">
          App version: {expo.version}
        </Text>
        <Text className="text-sm text-gray-500">
          Developer: {expo.devs.lead}
        </Text>
      </View>
    </View>
  );
};

export default Menu;
