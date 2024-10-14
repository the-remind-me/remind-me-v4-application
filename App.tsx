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
import { NoClassToday, Holiday } from "./Components/notFound";
import * as Notifications from "expo-notifications";
import Feather from "@expo/vector-icons/Feather";
import Carousel from "react-native-reanimated-carousel";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { convertTime } from "./Components/Utils/utils";
import ErrorComponent from "./Components/error";
import UpdateComponent from "./Components/update";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const { width } = Dimensions.get("window");
const ITEM_HEIGHT = 100;

interface Holiday {
  _id: string;
  date: string;
  name: string;
  __v: number;
}

const App: React.FC = () => {
  const [schedule, setSchedule] = useState<{ [key: string]: any[] }>({});
  const [days, setDays] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isNotificationEnabled, setNotificationEnabled] = useState(false);
  const [isAlarmEnabled, setAlarmEnabled] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await checkForNewData();
        await setupNotifications();
        await fetchHolidays();
        setIsAppReady(true);
      } catch (e) {
        console.error("Error during app preparation:", e);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationStatus = await AsyncStorage.getItem("notifications");
        const alarmStatus = await AsyncStorage.getItem("alarm");
        setNotificationEnabled(notificationStatus === "true");
        setAlarmEnabled(alarmStatus === "true");
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    const todayIndex = days.findIndex((day) => day === today);
    if (todayIndex !== -1) {
      setIndex(todayIndex);
    }
  }, [days]);

  const fetchHolidays = async () => {
    try {
      const storedHolidays = await AsyncStorage.getItem("holidays");
      if (storedHolidays) {
        setHolidays(JSON.parse(storedHolidays));
      }

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const response = await axios.get<Holiday[]>(
          "https://api.remindme.globaltfn.tech/api/holiday/all"
        );
        setHolidays(response.data);
        await AsyncStorage.setItem("holidays", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to fetch or sync holidays:", error);
    }
  };

  const setupNotifications = async () => {
    try {
      await Notifications.setNotificationChannelAsync("schedule", {
        name: "Schedule notifications",
        sound: "schedule_notification.ogg",
        importance: Notifications.AndroidImportance.HIGH,
      });
      await Notifications.setNotificationChannelAsync("alarm", {
        name: "Alarm notifications",
        sound: "alarm.ogg",
        importance: Notifications.AndroidImportance.HIGH,
      });

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Notification permissions not granted");
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      if (isNotificationEnabled) {
        await scheduleNotifications();
      }

      if (isAlarmEnabled) {
        await scheduleAlarms();
      }
    } catch (error) {
      console.error("Failed to setup notifications:", error);
    }
  };

  const scheduleNotifications = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toLocaleString("en-us", {
      weekday: "long",
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${tomorrowString}'s Schedule`,
        body: getNextDayFirstClass(),
      },
      trigger: {
        hour: 21,
        minute: 0,
        repeats: true,
        channelId: "schedule",
      },
    });
  };

  const scheduleAlarms = async () => {
    const todaySchedule = getTodaySchedule;
    if (todaySchedule.length > 0) {
      const firstClass = todaySchedule[0];
      const [startHour, startMinute] =
        firstClass.Start_Time.split(":").map(Number);
      const notificationTime = new Date();
      notificationTime.setHours(startHour - 1, startMinute, 0);

      if (notificationTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Upcoming Class",
            body: `You have a class in 1 hour: ${
              firstClass.Course_Name
            } at ${convertTime(firstClass.Start_Time)}`,
          },
          trigger: {
            date: notificationTime,
            channelId: "alarm",
          },
        });
      }
    }
  };

  const toggleNotification = async () => {
    const newStatus = !isNotificationEnabled;
    setNotificationEnabled(newStatus);
    await AsyncStorage.setItem("notifications", newStatus.toString());

    if (newStatus) {
      await scheduleNotifications();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notifications On",
          body: "You have enabled notifications!",
        },
        trigger: {
          seconds: 1,
          channelId: "schedule",
        },
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (isAlarmEnabled) {
        await scheduleAlarms();
      }
    }
  };

  const toggleAlarm = async () => {
    const newStatus = !isAlarmEnabled;
    setAlarmEnabled(newStatus);
    await AsyncStorage.setItem("alarm", newStatus.toString());

    if (newStatus) {
      await scheduleAlarms();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Alarm On",
          body: "You have enabled the alarm!",
        },
        trigger: {
          seconds: 0,
          channelId: "alarm",
        },
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (isNotificationEnabled) {
        await scheduleNotifications();
      }
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
      const newTime = `${convertTime(firstClass.Start_Time)} - ${convertTime(
        firstClass.End_Time
      )}`;

      return `${tomorrow}'s class at: ${newTime}\n\nBuilding: ${firstClass.Building} || Room No: ${firstClass.Room}\nInstructor: ${firstClass.Instructor}`;
    } else {
      return "You have no classes tomorrow.";
    }
  };

  const checkForNewData = useCallback(async () => {
    setLoading(true);
    try {
      const id = await AsyncStorage.getItem("ID");
      setSelectedId(id || "Remind Me");

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
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  const getTodaySchedule = useMemo(() => {
    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    return schedule[today] || [];
  }, [schedule]);

  const getCurrentClassIndex = useMemo(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return getTodaySchedule.findIndex((classInfo) => {
      const [startHour, startMinute] =
        classInfo.Start_Time.split(":").map(Number);
      const [endHour, endMinute] = classInfo.End_Time.split(":").map(Number);
      const classStartTime = startHour * 60 + startMinute;
      const classEndTime = endHour * 60 + endMinute;
      return currentTime >= classStartTime && currentTime < classEndTime;
    });
  }, [getTodaySchedule]);

  const isHoliday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return holidays.some((holiday) => holiday.date === today);
  }, [holidays]);

  const holidayName = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const holiday = holidays.find((h) => h.date === today);
    return holiday ? holiday.name : null;
  }, [holidays]);

  const DrawerItem = () => (
    <Menu
      isNotificationEnabled={isNotificationEnabled}
      isAlarmEnabled={isAlarmEnabled}
      toggleNotification={toggleNotification}
      toggleAlarm={toggleAlarm}
    />
  );

  const renderScene = SceneMap(
    Object.fromEntries(
      days.map((day) => [
        day,
        () => {
          const currentDate = new Date();
          const dayIndex = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].indexOf(day);
          currentDate.setDate(
            currentDate.getDate() - currentDate.getDay() + dayIndex
          );
          const formattedDate = currentDate.toISOString().split("T")[0];

          const isHolidayForThisDay = holidays.some(
            (holiday) => holiday.date === formattedDate
          );
          const holidayForThisDay = holidays.find(
            (holiday) => holiday.date === formattedDate
          );

          if (isHolidayForThisDay) {
            return <Holiday name={holidayForThisDay?.name || "Holiday"} />;
          }
          return (
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
          );
        },
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
        <View className="p-2 bg-indigo-600 flex-row items-center justify-between">
          <View className="flex-row gap-2 items-center">
            <Pressable
              onPress={() => setIsOpen(!isOpen)}
              className="px-2 py-2 rounded-lg"
            >
              <Feather name="menu" size={24} color="white" />
            </Pressable>
            <Text className="text-white text-base">
              {selectedId.replace(/-/g, " - ")}
            </Text>
          </View>

          <Pressable
            onPress={() => setIsPickerModalVisible(true)}
            className="px-3 py-2 rounded-lg"
          >
            <Feather name="edit" size={20} color="white" />
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

        {selectedId == "Remind Me" ? (
          <ErrorComponent
            message="You haven't selected any class schedule yet. Please select your class."
            onRetry={() => setIsPickerModalVisible(true)}
            retryText="Select Schedule"
          />
        ) : (
          <>
            <View className="bg-indigo-100 py-4 h-56">
              {isHoliday ? (
                <Holiday name={holidayName || "Holiday"} />
              ) : getTodaySchedule.length > 0 ? (
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
                    defaultIndex={
                      getCurrentClassIndex !== -1
                        ? getCurrentClassIndex
                        : undefined
                    }
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
                  routes: days.map((day) => ({
                    key: day,
                    title: day.slice(0, 3),
                  })),
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
      <UpdateComponent />
    </SafeAreaView>
  );
};

export default App;
