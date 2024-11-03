// notificationService.js
import * as ExpoAlarm from "expo-alarm";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKGROUND_FETCH_TASK = "CLASS_SCHEDULE_FETCH";
const STORAGE_KEYS = {
  NOTIFICATION_ENABLED: "notificationEnabled",
  ALARM_ENABLED: "alarmEnabled",
  GROUP: "Group",
};

class NotificationService {
  constructor() {
    // console.log("🔧 Initializing NotificationService");
    this.schedule = null;
    this.selectedGroup = null;
    this.state = {
      notifications: {
        enabled: true,
        lastScheduled: null,
      },
      alarms: {
        enabled: true,
        lastScheduled: null,
      },
    };

    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    });
  }

  async loadSettings() {
    try {
      const [notificationEnabled, alarmEnabled, group] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.ALARM_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.GROUP),
      ]);

      this.state.notifications.enabled = notificationEnabled !== "false";
      this.state.alarms.enabled = alarmEnabled !== "false";
      this.selectedGroup = group || null;

      // console.log("📱 Loaded settings:", {
      //   notifications: this.state.notifications.enabled,
      //   alarms: this.state.alarms.enabled,
      //   group: this.selectedGroup,
      // });
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async saveSettings() {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEYS.NOTIFICATION_ENABLED,
          String(this.state.notifications.enabled)
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.ALARM_ENABLED,
          String(this.state.alarms.enabled)
        ),
      ]);
    } catch (error) {
      console.error("Failed to save notification settings:", error);
    }
  }

  async toggleNotifications(enabled) {
    // console.log("🔔 Toggling notifications:", enabled);
    this.state.notifications.enabled = enabled;
    await this.saveSettings();

    if (!enabled) {
      await this.cancelAllNotifications();
    } else {
      await this.scheduleNotifications();
    }

    return this.state.notifications.enabled;
  }

  async toggleAlarms(enabled) {
    // console.log("⏰ Toggling alarms:", enabled);
    this.state.alarms.enabled = enabled;
    await this.saveSettings();

    if (!enabled) {
      ExpoAlarm.dismissAlarm({
        searchMode: "android.all",
      });
    } else {
      await this.scheduleNotifications(); // This will schedule new alarms if needed
    }

    return this.state.alarms.enabled;
  }

  async cancelAllNotifications() {
    // console.log("🚫 Cancelling all notifications");
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.state.notifications.lastScheduled = null;
  }

  async cancelAllAlarms() {
    // console.log("🚫 Cancelling all alarms");
    await ExpoAlarm.cancelAllAlarms();
    this.state.alarms.lastScheduled = null;
  }

  async initialize() {
    // console.log("🚀 Starting service initialization");
    try {
      await this.loadSettings();
      await this.setupChannels();
      await this.requestPermissions();
      await this.setupBackgroundTask();
      // console.log("✅ Service initialization complete");
    } catch (error) {
      console.error("❌ Service initialization failed:", error);
    }
  }

  async setupChannels() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("class-alarm", {
        name: "Class Alarms",
        importance: Notifications.AndroidImportance.MAX,
        enableVibrate: true,
        vibrationPattern: [0, 500, 500, 500],
        sound: "default",
        enableLights: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }
  }

  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
      android: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });

    if (status !== "granted") {
      throw new Error("Notification permissions not granted");
    }
  }

  async setupBackgroundTask() {
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      try {
        await this.scheduleNotifications();
        return BackgroundFetch.Result.NewData;
      } catch (error) {
        console.error("❌ Background task failed:", error);
        return BackgroundFetch.Result.Failed;
      }
    });

    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  updateSchedule(newSchedule) {
    this.schedule = newSchedule;
    return this.scheduleNotifications();
  }

  getNextDayClasses() {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tomorrowDay = days[tomorrow.getDay()];
    const classes = this.schedule?.[tomorrowDay]?.filter(
      (cls) => cls.Group === this.selectedGroup || cls.Group === "All"
    );

    return classes?.length > 0
      ? { day: tomorrowDay, classInfo: classes[0] }
      : null;
  }

  getTodayClasses() {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    today.setDate(today.getDate());
    const todayDay = days[today.getDay()];
    const classes = this.schedule?.[todayDay]?.filter(
      (cls) => cls.Group === this.selectedGroup || cls.Group === "All"
    );

    return classes?.length > 0
      ? { day: todayDay, classInfo: classes[0] }
      : null;
  }

  formatClassInfo(classInfo) {
    return (
      `${classInfo.Course_Name}\n` +
      `⏰ ${classInfo.Start_Time}\n` +
      `📍 ${classInfo.Building} - Room ${classInfo.Room}\n` +
      `👨‍🏫 ${classInfo.Instructor}`
    );
  }

  async scheduleNotifications() {
    // console.log("📅 Starting to schedule notifications");
    try {
      const tomorrowClass = this.getNextDayClasses();
      if (!tomorrowClass) {
        // console.log("❌ No classes tomorrow, skipping notifications");
        return;
      }
      const todayClass = this.getTodayClasses();
      if (!todayClass) {
        // console.log("❌ No classes today, skipping notifications");
        return;
      }

      const eveningTime = new Date();
      eveningTime.setHours(21, 0, 0, 0);
      if (eveningTime < new Date()) {
        eveningTime.setDate(eveningTime.getDate());
      }

      const classTime = new Date();
      classTime.setDate(classTime.getDate() + 1);
      const [hours, minutes] =
        todayClass.classInfo.Start_Time.split(":").map(Number);
      classTime.setHours(hours - 1, minutes || 0, 0, 0);

      // Schedule notifications and alarms independently
      const promises = [];

      if (this.state.notifications.enabled) {
        promises.push(
          this.scheduleEveningNotification(tomorrowClass, eveningTime)
        );
        // console.log("✅ Notifications scheduled successfully");
      }

      if (this.state.alarms.enabled) {
        promises.push(this.schedulePreClassAlarm(todayClass, classTime));
        // console.log("✅ Alarms scheduled successfully");
      }

      await Promise.all(promises);
      // console.log("✅ Notifications and alarms scheduled successfully");
    } catch (error) {
      console.error("❌ Failed to schedule notifications:", error);
    }
  }

  async scheduleEveningNotification(nextClass, eveningTime) {
    // console.log(
    //   "🌙 Scheduling evening reminder for:",
    //   nextClass.classInfo.Course_Name
    // );

    const notification = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 Class Reminder for Tomorrow`,
        body: this.formatClassInfo(nextClass.classInfo),
        sound: true,
        priority: "high",
        android: {
          channelId: "class-alarm",
          priority: "high",
        },
      },
      trigger: { date: eveningTime },
    });

    this.state.notifications.lastScheduled = new Date();
    return notification;
  }

  async schedulePreClassAlarm(nextClass, alarmTime) {
    // console.log(
    //   "⏰ Scheduling pre-class alarm for:",
    //   nextClass.classInfo.Course_Name
    // );

    if (!isNaN(alarmTime.getTime())) {
      await ExpoAlarm.setAlarm({
        hour: alarmTime.getHours(),
        minutes: alarmTime.getMinutes(),
        message: `⏰ CLASS STARTING SOON - ${nextClass.classInfo.Group}`,
        vibrate: true,
        skipUi: true,
      });

      this.state.alarms.lastScheduled = new Date();
    } else {
      console.error("❌ Invalid alarmTime:", alarmTime);
    }
  }

  getStatus() {
    return {
      notifications: {
        enabled: this.state.notifications.enabled,
        lastScheduled: this.state.notifications.lastScheduled,
      },
      alarms: {
        enabled: this.state.alarms.enabled,
        lastScheduled: this.state.alarms.lastScheduled,
      },
    };
  }
}

export default new NotificationService();
