import React from "react";
import { View, Text, Switch } from "react-native";
import { expo } from "../app.json";


const Menu = () => (
  <View className={`bg-slate-100 justify-between`}>
    <View>
      <Text className='text-2xl text-center font-semibold py-4'>Settings</Text>

      <View className='flex-row justify-between items-center'>
        <Text className=''>Dark Mode</Text>
        <Switch />
      </View>

      <View className='flex-row justify-between items-center'>
        <Text className=''>Send Notification</Text>
        <Switch />
      </View>

      <View className='flex-row justify-between items-center'>
        <Text className=''>Set Alarm</Text>
        <Switch />
      </View>
    </View>

    <View className='items-center '>
      <Text className=''>App version: {expo.version}</Text>
    </View>

  </View>
);

export default Menu;
