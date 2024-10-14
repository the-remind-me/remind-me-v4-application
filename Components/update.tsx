import React, { useEffect } from "react";
import { Alert, Platform } from "react-native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import * as IntentLauncher from 'expo-intent-launcher';

const UpdateComponent = () => {
  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert("No Internet", "Please check your internet connection.");
        return;
      }

      const appVersion = Constants.expoConfig?.version || "0.0.0";
      const response = await axios.get(
        "https://download.globaltfn.tech/version.json"
      );
      const latestVersion = response.data.version;

      if (compareVersions(latestVersion, appVersion) > 0) {
        Alert.alert(
          "Update Available",
          "A new version is available. Would you like to update?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Update", onPress: () => downloadAndInstall(response.data.apks[0].url) }
          ]
        );
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  const compareVersions = (v1: string, v2: string) => {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  };

  const downloadAndInstall = async (updateUrl: string) => {
    try {
      const downloadPath = `${FileSystem.documentDirectory}app-latest.apk`;

      const downloadResumable = FileSystem.createDownloadResumable(
        updateUrl,
        downloadPath,
        {},
        (progress) => {
          const progressPercentage =
            progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${(progressPercentage * 100).toFixed(2)}%`);
        }
      );

      const result = await downloadResumable?.downloadAsync();

      if (result && result.uri) {
        Alert.alert(
          "Download Completed",
          "APK downloaded successfully. Installing...",
          [
            {
              text: "OK",
              onPress: async () => {
                if (Platform.OS === "android") {
                  const contentUri = await FileSystem.getContentUriAsync(result.uri);
                  console.log("Content URI for APK:", contentUri);
                  try {
                    await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
                      data: contentUri,
                      flags: 1 << 30, // FLAG_GRANT_READ_URI_PERMISSION
                    });
                  } catch (error) {
                    console.error("Error installing APK:", error);
                    Alert.alert("Installation Failed", "Unable to install the update automatically. Please install manually.");
                  }
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert("Update Failed", "Unable to download or install the update.");
      console.error("Update error:", error);
    }
  };

  return null;
};

export default UpdateComponent;
