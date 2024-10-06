import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { divideSchedule } from "./Utils/DivideGroups";

interface MyPickerProps {
  onClose: () => void;
}

const MyPicker: React.FC<MyPickerProps> = ({ onClose }) => {
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

  const onRefresh = useCallback(async () => {
    try {
      const response = await fetch(
        "http://192.168.0.131:5000/api/schedule/ids"
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const fetchedData = await response.json();
      setData(fetchedData.ids);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    }
  }, []);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const universities = Array.from(
    new Set(data.map((item) => item.split("-")[0]))
  );

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
      );
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
      );
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
      );
      setSections(filteredSections);
    }
  };

  useEffect(() => {
    const id = `${selectedUniversity}-${selectedProgram}-${selectedSemester}-${selectedSection}`;
    setSelectedId(id);
    console.log(id);
  }, [selectedSection, group]);

  const getScheduleFromBackend = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.131:5000/api/schedule/find/${selectedId}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      await divideSchedule(data, group);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    }
  };

  return (
    <ScrollView className="w-full transition-all duration-300">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Select Schedule</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Text className="text-blue-500">Close</Text>
        </TouchableOpacity>
      </View>
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

          <TouchableOpacity
            onPress={() => {
              getScheduleFromBackend();
              onClose();
            }}
            disabled={!selectedSection}
            className={`mt-6 p-4 rounded-md ${
              selectedSection ? "bg-blue-500" : "bg-gray-400"
            }`}
          >
            <Text className="text-black text-center font-bold">
              Find Schedule
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default MyPicker;
