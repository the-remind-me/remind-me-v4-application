// App.js or MainComponent.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Drawer } from "react-native-drawer-layout";
import Menu from "./Components/DrawerItem";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import PagerView from "react-native-pager-view";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClassCard from "./Components/Card";
import MyPicker from "./Components/picker";
import { NoScheduleFound, NoClassToday } from "./Components/notFound";

SplashScreen.preventAutoHideAsync();

const App = () => {
  const [schedule, setSchedule] = useState<{ [key: string]: any[] }>({});
  const [days, setDays] = useState<string[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const [net, setNet] = useState<boolean | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(({ isConnected }) => {
      setNet(isConnected);
    });
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(async () => {
    const classSchedule = await AsyncStorage.getItem("ClassSchedule");
    console.log(AsyncStorage.getAllKeys());

    if (!classSchedule) {
      setRefreshing(true);
      try {
        const response = await fetch(
          "http://192.168.0.131:5000/api/schedule/data"
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setSchedule(data);
        setDays(Object.keys(data));
        await AsyncStorage.setItem("ClassSchedule", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const getSchedule = async () => {
      const classSchedule = await AsyncStorage.getItem("GroupSchedule");
      if (classSchedule) {
        console.log(classSchedule);

        const parsedSchedule = JSON.parse(classSchedule);
        setSchedule(parsedSchedule);
        setDays(Object.keys(parsedSchedule));
      } else {
        await onRefresh();
      }
    };
    getSchedule().finally(() => setIsAppReady(true));
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  const onPageSelected = (e: { nativeEvent: { position: number } }) => {
    setSelectedDayIndex(e.nativeEvent.position);
  };

  const handleDayPress = (index: number) => {
    pagerRef.current?.setPage(index);
    setSelectedDayIndex(index);
  };

  const DrawerItem = () => {
    return <Menu />;
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleString('en-us', {weekday: 'long'});
    return schedule[today] || [];
  };

  return (
    <SafeAreaView className="flex-1" onLayout={onLayoutRootView}>
      <Drawer
        open={isOpen}
        drawerType="front"
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        renderDrawerContent={DrawerItem}
      >
        {refreshing && (
          <View className="flex-1 justify-center items-center w-full h-full bg-black bg-opacity-50 absolute">
            <ActivityIndicator className="z-50" size={100} color="#0000ff" />
            <Text className="mt-4 text-lg text-black">Loading...</Text>
          </View>
        )}
        <View className="p-4 bg-slate-300 flex-row items-center justify-between">
          <Text
            onPress={() => setIsOpen(!isOpen)}
            className="text-2xl font-bold"
          >
            ☰
          </Text>

          <TouchableOpacity onPress={() => setIsPickerModalVisible(true)} className="bg-slate-200 px-2 py-1 rounded">
            <Text className="text-lg font-bold">Hello BWU Student</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isPickerModalVisible}
          onRequestClose={() => setIsPickerModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white rounded-lg p-4 w-11/12 max-h-5/6">
              <MyPicker
                onClose={() => setIsPickerModalVisible(false)}
              />
            </View>
          </View>
        </Modal>
        <View>
          <Text className="text-2xl font-bold text-center">Today's Schedule</Text>
          <FlatList
            horizontal={true}
            className="p-2"
            showsHorizontalScrollIndicator={false}
            data={getTodaySchedule()}
            renderItem={({ item }) => <ClassCard classInfo={item} position='today'/>}
            keyExtractor={(item, index) =>
              `today-${item.Period}-${index}`
            }
            ListEmptyComponent={
              <Text className="flex-1 justify-center items-center">
                No classes scheduled for today
              </Text>
            }
          />
        </View>
        <View className="flex-1">
          <View className="p-2 flex-row justify-evenly">
            {days.map((day, index) => (
              <Text
                key={day}
                onPress={() => handleDayPress(index)}
                className={`my-2 mx-2 p-2 px-4 ${selectedDayIndex === index ? "bg-slate-200 rounded-lg" : ""}`}
              >
                {day.slice(0, 3)}
              </Text>
            ))}
          </View>
          <PagerView
            ref={pagerRef}
            className="flex-1"
            initialPage={selectedDayIndex}
            onPageSelected={onPageSelected}
            offscreenPageLimit={1}
          >
            {days.map((day, index) => (
              <View key={index} className="p-2">
                <FlatList
                  className="p-2"
                  showsVerticalScrollIndicator={false}
                  data={schedule[day]}
                  renderItem={({ item }) => <ClassCard classInfo={item} />}
                  keyExtractor={(item, index) =>
                    `${day}-${item.Period}-${index}`
                  }
                  ListEmptyComponent={
                    <NoClassToday />
                  }
                />
              </View>
            ))}
          </PagerView>
        </View>
      </Drawer>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
    </SafeAreaView>
  );
};

export default App;
