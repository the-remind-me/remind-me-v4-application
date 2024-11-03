// App.js
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
import Feather from "@expo/vector-icons/Feather";
import Carousel from "react-native-reanimated-carousel";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import ErrorComponent from "./Components/error";
import UpdateComponent from "./Components/update";
import notificationService from "./Components/Utils/notificationService";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get("window");
const ITEM_HEIGHT = 100;

const App: React.FC = () => {
  const [schedule, setSchedule] = useState<{ [key: string]: any[] }>({});
  const [days, setDays] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
  const [isDrawerOpen, setDrawerIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState({
    notifications: {
      enabled: true,
      lastScheduled: null,
    },
    alarms: {
      enabled: true,
      lastScheduled: null,
    },
  });

  useEffect(() => {
    const prepare = async () => {
      try {
        await Promise.all([checkForNewData(), fetchHolidays()]);
        setIsAppReady(true);
      } catch (e) {
        console.error("Error during app preparation:", e);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        const status = notificationService.getStatus();
        setNotificationStatus(status);
      } catch (error) {
        console.error("Notification initialization failed:", error);
      }
    };

    initializeNotifications();
  }, []);

  const toggleNotification = useCallback(async () => {
    try {
      const enabled = !notificationStatus.notifications.enabled;
      await notificationService.toggleNotifications(enabled);
      const newStatus = notificationService.getStatus();
      setNotificationStatus(newStatus);
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
    }
  }, [notificationStatus.notifications.enabled]);

  const toggleAlarm = useCallback(async () => {
    try {
      const enabled = !notificationStatus.alarms.enabled;
      await notificationService.toggleAlarms(enabled);
      const newStatus = notificationService.getStatus();
      setNotificationStatus(newStatus);
    } catch (error) {
      console.error("Failed to toggle alarms:", error);
    }
  }, [notificationStatus.alarms.enabled]);

  useEffect(() => {
    if (schedule && Object.keys(schedule).length > 0) {
      notificationService.updateSchedule(schedule);
    }
  }, [schedule]);

  useEffect(() => {
    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    const todayIndex = days.findIndex((day) => day === today);
    if (todayIndex !== -1) {
      setIndex(todayIndex);
    }
  }, [days]);

  const fetchHolidays = useCallback(async () => {
    try {
      const storedHolidays = await AsyncStorage.getItem("holidays");
      if (storedHolidays) {
        setHolidays(JSON.parse(storedHolidays));
        return;
      }

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const response = await axios.get(
          "https://api.remindme.globaltfn.tech/api/holiday/all"
        );
        setHolidays(response.data);
        await AsyncStorage.setItem("holidays", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to fetch or sync holidays:", error);
    }
  }, []);

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
      setLoading(false);
    } catch (error) {
      console.error("Failed to check for new data:", error);
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

  const DrawerItem = useMemo(
    () => (
      <Menu
        isNotificationEnabled={notificationStatus.notifications.enabled}
        isAlarmEnabled={notificationStatus.alarms.enabled}
        toggleNotification={toggleNotification}
        toggleAlarm={toggleAlarm}
      />
    ),
    [notificationStatus, toggleNotification, toggleAlarm]
  );

  const MemoizedClassCard = React.memo(ClassCard);

  const renderScene = useMemo(
    () =>
      SceneMap(
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
                <View className="pb-1">
                  <FlatList
                    className="p-4"
                    showsVerticalScrollIndicator={false}
                    data={schedule[day]}
                    refreshing={loading}
                    renderItem={({ item }) => (
                      <MemoizedClassCard classInfo={item} />
                    )}
                    keyExtractor={(item, index) =>
                      `${day}-${item.Period}-${index}`
                    }
                    ListEmptyComponent={<NoClassToday />}
                    getItemLayout={(data, index) => ({
                      length: ITEM_HEIGHT,
                      offset: ITEM_HEIGHT * index,
                      index,
                    })}
                    windowSize={10}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                  />
                </View>
              );
            },
          ])
        )
      ),
    [days, holidays, schedule]
  );

  const renderTabBar = useCallback(
    (props: any) => (
      <View>
        <TabBar
          {...props}
          activeColor="#241df0"
          inactiveColor="#0e0e82"
          indicatorStyle={{
            backgroundColor: "#4F46E5",
            height: 2,
          }}
          style={{ backgroundColor: "#EEF2FF" }}
          labelStyle={{ fontSize: 13 }}
          pressColor="transparent"
          pressOpacity={1}
        />
      </View>
    ),
    []
  );

  if (!isAppReady) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" onLayout={onLayoutRootView}>
      <Drawer
        drawerStyle={{ width: "80%" }}
        open={isDrawerOpen}
        drawerType="front"
        onOpen={() => setDrawerIsOpen(true)}
        onClose={() => setDrawerIsOpen(false)}
        renderDrawerContent={() => DrawerItem}
      >
        <View className="p-2 bg-indigo-600 flex-row items-center justify-between">
          <View className="flex-row gap-2 items-center">
            <Pressable
              onPress={() => setDrawerIsOpen(!isDrawerOpen)}
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
                justClose={() => {
                  setIsPickerModalVisible(false);
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
            <View className="bg-indigo-100 h-48">
              {isHoliday ? (
                <Holiday name={holidayName || "Holiday"} />
              ) : getTodaySchedule.length > 0 ? (
                <>
                  {loading ? (
                    <View className="flex-1 justify-center items-center">
                      <ActivityIndicator size="large" color="#4F46E5" />
                      <Text className="text-lg text-indigo-700">
                        Loading...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text className="text-2xl font-bold text-center text-indigo-800">
                        {new Date().toLocaleString("en-us", {
                          weekday: "long",
                        })}
                        's Schedule
                      </Text>
                      <Carousel
                        loop={false}
                        mode="parallax"
                        modeConfig={{
                          parallaxScrollingScale: 0.9,
                          parallaxScrollingOffset: 55,
                          parallaxAdjacentItemScale: 0.8,
                        }}
                        width={width}
                        height={200}
                        autoPlay={false}
                        data={getTodaySchedule}
                        scrollAnimationDuration={500}
                        renderItem={({ item }) => (
                          <MemoizedClassCard classInfo={item} />
                        )}
                        defaultIndex={
                          getCurrentClassIndex !== -1
                            ? getCurrentClassIndex
                            : undefined
                        }
                      />
                    </>
                  )}
                </>
              ) : (
                <NoClassToday />
              )}
            </View>

            <View className="flex-1 bg-[#EEF2FF]">
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
                lazy
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
