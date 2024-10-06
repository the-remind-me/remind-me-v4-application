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
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClassCard from "./Components/Card";
import MyPicker from "./Components/picker";
import { NoClassToday } from "./Components/notFound";
import * as Notifications from "expo-notifications";
import Feather from "@expo/vector-icons/Feather";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [schedule, setSchedule] = useState<{ [key: string]: any[] }>({});
  const [days, setDays] = useState<string[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const pagerRef = useRef<PagerView>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await checkForNewData();
        await setupNotifications();
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

  const setupNotifications = async () => {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert(
        "You need to grant notification permissions to receive schedule updates."
      );
      return;
    }

    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily notification at 9 AM
    const trigger = new Date();
    trigger.setHours(9, 0, 0, 0);
    trigger.setDate(trigger.getDate() + 1); // Start from tomorrow

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Schedule Reminder",
        body: "Check your schedule for today!",
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  };

  const checkForNewData = useCallback(async () => {
    setLoading(true);
    try {
      const id = await AsyncStorage.getItem("ID");
      setSelectedId(id || "");
      const newData = await AsyncStorage.getItem("GroupSchedule");
      if (newData) {
        const parsedNewData = JSON.parse(newData);
        if (JSON.stringify(parsedNewData) !== JSON.stringify(schedule)) {
          setSchedule(parsedNewData);
          setDays(Object.keys(parsedNewData));
        }
      }
    } catch (error) {
      console.error("Failed to check for new data:", error);
    } finally {
      setLoading(false);
    }
  }, [schedule]);

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) {
      // This tells the splash screen to hide immediately
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
    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    return schedule[today] || [];
  };

  if (!isAppReady) {
    return null;
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-indigo-100">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-lg text-indigo-700">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" onLayout={onLayoutRootView}>
      <Drawer
        open={isOpen}
        drawerType="front"
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        renderDrawerContent={DrawerItem}
      >
        <View className="p-4 bg-indigo-600 flex-row items-center justify-between">
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              onPress={() => setIsOpen(!isOpen)}
              className="px-2 py-2 rounded-lg"
            >
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg">
              {selectedId.replace(/-/g, " ")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsPickerModalVisible(true)}
            className="px-3 py-2 rounded-lg"
          >
            <Feather name="edit" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isPickerModalVisible}
          onRequestClose={() => setIsPickerModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-[#000000b2]">
            <View className="bg-white rounded-lg p-4 w-11/12 max-h-5/6">
              <MyPicker
                onClose={() => {
                  setIsPickerModalVisible(false);
                  checkForNewData();
                }}
              />
            </View>
          </View>
        </Modal>
        <View className="bg-indigo-100 py-4">
          <Text className="text-2xl font-bold text-center text-indigo-800">
            Today's Schedule
          </Text>
          <FlatList
            horizontal={true}
            className="p-2"
            showsHorizontalScrollIndicator={false}
            data={getTodaySchedule()}
            renderItem={({ item }) => (
              <ClassCard classInfo={item} position="today" />
            )}
            keyExtractor={(item, index) => `today-${item.Period}-${index}`}
            ListEmptyComponent={<NoClassToday />}
          />
        </View>
        <View className="flex-1 bg-indigo-50">
          <View className="p-2 flex-row justify-evenly bg-indigo-200">
            {days.map((day, index) => (
              <Text
                key={day}
                onPress={() => handleDayPress(index)}
                className={`my-2 mx-2 p-2 px-4 ${
                  selectedDayIndex === index
                    ? "bg-indigo-600 text-white rounded-lg"
                    : "text-indigo-800"
                }`}
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
                  ListEmptyComponent={<NoClassToday />}
                />
              </View>
            ))}
          </PagerView>
        </View>
      </Drawer>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
    </SafeAreaView>
  );
};

export default App;
