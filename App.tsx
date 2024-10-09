import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Pressable,
  Modal,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClassCard from "./Components/Card";
import MyPicker from "./Components/picker";
import { NoClassToday } from "./Components/notFound";
import * as Notifications from "expo-notifications";
import Feather from "@expo/vector-icons/Feather";
import Carousel from "react-native-reanimated-carousel";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { convertTime } from "./Components/Utils/utils";
import ErrorComponent from "./Components/error"; // Assuming you have this component

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

const width = Dimensions.get("window").width;
const ITEM_HEIGHT = 100; // Example height for FlatList optimization

const DrawerItem = () => <Menu />;

const App = () => {
  const [schedule, setSchedule] = useState<{ [key: string]: any[] }>({});
  const [days, setDays] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const prepare = async () => {
      try {
        // Pre-load data and fonts
        await checkForNewData();
        await setupNotifications();
        setIsAppReady(true);
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    // Set initial index to today's day
    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    const todayIndex = days.findIndex((day) => day === today);
    if (todayIndex !== -1) {
      setIndex(todayIndex);
    }
  }, [days]);

  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert(
          "You need to grant notification permissions to receive schedule updates."
        );
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      const trigger = new Date();
      trigger.setHours(21, 0, 0, 0); // Set to 9 PM
      trigger.setDate(trigger.getDate());

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Tomorrow's Schedule",
          body: getNextDayFirstClass(),
        },
        trigger: {
          hour: 21,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error("Failed to setup notifications:", error);
    }
  };

  const getNextDayFirstClass = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date().getDay();
    const tomorrow = days[(today + 1) % 7];
    const tomorrowSchedule = schedule[tomorrow];

    if (tomorrowSchedule && tomorrowSchedule.length > 0) {
      const firstClass = tomorrowSchedule[0];
      const newTime =
        convertTime(firstClass.Start_Time) +
        " - " +
        convertTime(firstClass.End_Time);

      return `${tomorrow}'s class at: ${newTime} \n\nBuilding: ${firstClass.Building} || Room No: ${firstClass.Room}\nInstructor: ${firstClass.Instructor}`;
    } else {
      return "You have no classes tomorrow.";
    }
  };

  const checkForNewData = useCallback(async () => {
    setLoading(true);
    try {
      const id = await AsyncStorage.getItem("ID");
      setSelectedId(id || "");

      const newData = await AsyncStorage.getItem("GroupSchedule");
      if (newData) {
        const parsedNewData = JSON.parse(newData);
        setSchedule((prevSchedule) =>
          JSON.stringify(parsedNewData) !== JSON.stringify(prevSchedule)
            ? parsedNewData
            : prevSchedule
        );
        setDays(Object.keys(parsedNewData));
      }
    } catch (error) {
      console.error("Failed to check for new data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) {
      // Hide splash screen immediately
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  const getTodaySchedule = useMemo(() => {
    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    return schedule[today] || [];
  }, [schedule]);

  const renderScene = SceneMap(
    Object.fromEntries(
      days.map((day) => [
        day,
        () => (
          <View className="p-2">
            <FlatList
              className="p-2"
              showsVerticalScrollIndicator={false}
              data={schedule[day]}
              renderItem={({ item }) => <ClassCard classInfo={item} />}
              keyExtractor={(item, index) => `${day}-${item.Period}-${index}`}
              ListEmptyComponent={<NoClassToday />}
              getItemLayout={(data, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
            />
          </View>
        ),
      ])
    )
  );

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor: "#4F46E5",
        height: 3,
        borderRadius: 999,
      }}
      style={{ backgroundColor: "#EEF2FF" }}
      labelStyle={{ color: "#4F46E5", fontSize: 13 }}
    />
  );

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
            <Pressable
              onPress={() => setIsOpen(!isOpen)}
              className="px-2 py-2 rounded-lg"
            >
              <Feather name="menu" size={24} color="white" />
            </Pressable>
            <Text className="text-white text-lg">
              {selectedId.replace(/-/g, " ")}
            </Text>
          </View>

          <Pressable
            onPress={() => setIsPickerModalVisible(true)}
            className="px-3 py-2 rounded-lg"
          >
            <Feather name="edit" size={24} color="white" />
          </Pressable>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isPickerModalVisible}
          onRequestClose={() => setIsPickerModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-[#00000095]">
            <View className="bg-white rounded-lg p-4 w-11/12 max-h-5/6">
              <MyPicker
                onClose={() => {
                  setIsPickerModalVisible(false);
                  setLoading(true);
                  checkForNewData();
                }}
              />
            </View>
          </View>
        </Modal>

        {!selectedId ? (
          <ErrorComponent
            message="You haven't selected any class schedule yet. Please select your class."
            onRetry={() => setIsPickerModalVisible(true)}
            retryText="Select Schedule"
          />
        ) : (
          <>
            <View className="bg-indigo-100 py-3 h-60">
              {getTodaySchedule.length > 0 ? (
                <>
                  <Text className="text-2xl font-bold text-center text-indigo-800">
                    {new Date().toLocaleString("en-us", { weekday: "long" })}'s
                    Schedule
                  </Text>
                  <Carousel
                    loop={false}
                    mode="parallax"
                    modeConfig={{
                      parallaxScrollingScale: 0.9,
                      parallaxScrollingOffset: 50,
                      parallaxAdjacentItemScale: 0.8,
                    }}
                    width={width}
                    height={200}
                    autoPlay={false}
                    data={getTodaySchedule}
                    scrollAnimationDuration={1000}
                    renderItem={({ item }) => <ClassCard classInfo={item} />}
                  />
                </>
              ) : (
                <NoClassToday />
              )}
            </View>

            <View className="flex-1 bg-indigo-100">
              <TabView
                navigationState={{
                  index,
                  routes: days.map((day) => ({ key: day, title: day.slice(0, 3) })),
                }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width }}
                renderTabBar={renderTabBar}
              />
            </View>
          </>
        )}
      </Drawer>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
    </SafeAreaView>
  );
};

export default App;
