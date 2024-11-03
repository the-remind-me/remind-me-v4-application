import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  Pressable,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { divideSchedule } from "./Utils/DivideGroups";
import NetInfo from "@react-native-community/netinfo";
import Feather from "@expo/vector-icons/Feather";
import ErrorPage from "./error";

interface MyPickerProps {
  onClose: () => void;
  justClose: () => void;
}

const API_URL = "https://api.remindme.globaltfn.tech";

const MyPicker: React.FC<MyPickerProps> = ({ onClose, justClose }) => {
  const [data, setData] = useState<string[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [programs, setPrograms] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [group, setGroup] = useState<string>("Group 1");
  const [isLoading, setIsLoading] = useState(false);
  const [miniLoading, setMiniLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = useCallback(async () => {
    const netInfo = await NetInfo.fetch();
    setIsConnected(netInfo.isConnected || false);
    return netInfo.isConnected;
  }, []);

  const onRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        ToastAndroid.show(
          "Please connect to the internet and try again.",
          ToastAndroid.LONG
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/schedule/ids`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const fetchedData = await response.json();
      setData(fetchedData.ids);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      ToastAndroid.show(
        "Failed to fetch schedule. Issue is with the server.",
        ToastAndroid.LONG
      );
    }
  }, [checkConnection]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const universities = Array.from(
    new Set(data.map((item) => item.split("-")[0]))
  ).sort();

  const handleUniversitySelect = (university: string) => {
    setSelectedUniversity(university);
    setSelectedProgram("");
    setSelectedSemester("");
    setSelectedSection("");
    setPrograms([]);
    setSemesters([]);
    setSections([]);

    if (university) {
      const filteredPrograms = Array.from(
        new Set(
          data
            .filter((item) => item.startsWith(university))
            .map((item) => item.split("-")[1])
        )
      ).sort();
      setPrograms(filteredPrograms);
    }
  };

  const handleProgramSelect = (program: string) => {
    setSelectedProgram(program);
    setSelectedSemester("");
    setSelectedSection("");
    setSemesters([]);
    setSections([]);

    if (program) {
      const filteredSemesters = Array.from(
        new Set(
          data
            .filter((item) =>
              item.startsWith(`${selectedUniversity}-${program}`)
            )
            .map((item) => item.split("-")[2])
        )
      ).sort();
      setSemesters(filteredSemesters);
    }
  };

  const handleSemesterSelect = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedSection("");
    setSections([]);

    if (semester) {
      const filteredSections = Array.from(
        new Set(
          data
            .filter((item) =>
              item.startsWith(
                `${selectedUniversity}-${selectedProgram}-${semester}`
              )
            )
            .map((item) => item.split("-")[3])
        )
      ).sort();
      setSections(filteredSections);
    }
  };

  useEffect(() => {
    const id = `${selectedUniversity}-${selectedProgram}-${selectedSemester}-${selectedSection}`;
    setSelectedId(id);
  }, [selectedSection, group]);

  const getScheduleFromBackend = async () => {
    setMiniLoading(true);
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        ToastAndroid.show(
          "Please connect to the internet and try again.",
          ToastAndroid.LONG
        );
        setMiniLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/schedule/find/${selectedId}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      await divideSchedule(data, group);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      ToastAndroid.show(
        "Failed to fetch schedule. Please check your internet connection and try again.",
        ToastAndroid.LONG
      );
    } finally {
      setMiniLoading(false);
      onClose();
    }
  };

  return (
    <ScrollView className="w-full transition-all duration-300">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Select Schedule</Text>
        <Pressable onPress={justClose} className="p-2">
          <Feather name="x" size={24} color="black" />
        </Pressable>
      </View>
      {isLoading ? (
        <View className="flex-1 justify-center items-center p-4 h-96">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-lg text-indigo-700">Loading...</Text>
        </View>
      ) : !isConnected ? (
        <View className="flex-1 justify-center items-center p-4">
          <ErrorPage
            message="Please check your internet connection and try again."
            onRetry={onRefresh}
            retryText="Refresh"
          />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center p-4">
          <View className="w-full">
            <Text className="text-black mb-2">Select University:</Text>
            <Dropdown
              data={universities.map((uni) => ({ label: uni, value: uni }))}
              labelField="label"
              valueField="value"
              placeholder="Select Your University"
              value={selectedUniversity}
              onChange={(item) => handleUniversitySelect(item.value)}
              className="bg-white rounded-md mb-4 h-12 p-2 border border-gray-300"
            />

            <Text className="text-black mb-2">Select Program:</Text>
            <Dropdown
              data={programs.map((program) => ({
                label: program,
                value: program,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Your Program"
              value={selectedProgram}
              onChange={(item) => handleProgramSelect(item.value)}
              disable={!selectedUniversity}
              className="bg-white rounded-md mb-4 h-12 p-2 border border-gray-300"
            />

            <Text className="text-black mb-2">Select Semester:</Text>
            <Dropdown
              data={semesters.map((sem) => ({ label: sem, value: sem }))}
              labelField="label"
              valueField="value"
              placeholder="Select Your Semester"
              value={selectedSemester}
              onChange={(item) => handleSemesterSelect(item.value)}
              disable={!selectedProgram}
              className="bg-white rounded-md mb-4 h-12 p-2 border border-gray-300"
            />

            <Text className="text-black mb-2">Select Section:</Text>
            <Dropdown
              data={sections.map((section) => ({
                label: section,
                value: section,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Your Section"
              value={selectedSection}
              onChange={(item) => setSelectedSection(item.value)}
              disable={!selectedSemester}
              className="bg-white rounded-md mb-4 h-12 p-2 border border-gray-300"
            />

            <Text className="text-black mb-2">Select Group:</Text>
            <Dropdown
              data={[
                { label: "Group 1", value: "Group 1" },
                { label: "Group 2", value: "Group 2" },
              ]}
              labelField="label"
              valueField="value"
              placeholder="Select Group"
              value={group}
              onChange={(item) => setGroup(item.value)}
              disable={!selectedSection}
              className="bg-white rounded-md mb-4 h-12 p-2 border border-gray-300"
            />

            <Pressable
              onPress={() => {
                getScheduleFromBackend();
              }}
              disabled={!selectedSection || isLoading}
              className={`mt-6 p-4 rounded-md flex-row justify-center items-center ${
                selectedSection && !isLoading ? "bg-blue-500" : "bg-gray-400"
              }`}
            >
              {miniLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name="search" size={24} color="white" />
                  <Text className="text-white text-center font-bold">
                    Find Schedule
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default MyPicker;
