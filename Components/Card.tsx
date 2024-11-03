import React from "react";
import { View, Text } from "react-native";
import { convertTime } from "./Utils/utils";

interface ClassInfo {
  Period: number;
  Start_Time: string;
  End_Time: string;
  Course_Name: string;
  Instructor: string;
  Building: string;
  Room: string;
  Group: string;
  Class_Duration: number;
  Class_Count: number;
  Class_type: string;
}

interface ClassCardProps {
  classInfo: ClassInfo;
}

const ClassCard: React.FC<ClassCardProps> = ({ classInfo }) => {
  const getCardBackground = () => {
    switch (classInfo.Class_type) {
      case "Free":
        return "bg-red-50 border-red-400";
      case "Lab":
        return "bg-blue-50 border-blue-400";
      default:
        return "bg-green-50 border-green-400";
    }
  };

  const getBadgeStyle = () => {
    switch (classInfo.Class_type) {
      case "Free":
        return "bg-red-600";
      case "Lab":
        return "bg-blue-600";
      default:
        return "bg-green-600";
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const duration = (end.getTime() - start.getTime()) / 60000;
    return duration;
  };

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    });
  };

  return (
    <View
      className={`relative mb-4 p-4 border rounded-xl ${getCardBackground()}`}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-medium text-gray-800">
          {convertTime(classInfo.Start_Time)} -{" "}
          {convertTime(classInfo.End_Time)}
        </Text>
        <View className={`${getBadgeStyle()} rounded-full px-3 py-1`}>
          <Text className="text-white font-bold text-xs">
            {classInfo.Class_type}
          </Text>
        </View>
      </View>
      {classInfo.Class_type !== "Free" ? (
        <>
          <Text className="text-xl font-semibold mt-2">
            {toTitleCase(classInfo.Course_Name)}
          </Text>
          <View>
            <Text className="text-sm text-gray-600 text-right">
              Duration:{" "}
              {calculateDuration(classInfo.Start_Time, classInfo.End_Time)} mins
            </Text>
          </View>

          <View className="flex-row mt-2 justify-between items-center mb-2.5">
            <View>
              <Text className="w-full text-gray-700">
                Instructor: {toTitleCase(classInfo.Instructor)}
              </Text>
            </View>
            <Text className="text-gray-700 text-base">
              Building: {classInfo.Building} : {classInfo.Room}
            </Text>
          </View>
        </>
      ) : (
        <>
          <View className="flex items-center justify-center h-20">
            <Text className="text-2xl font-semibold">Free Class</Text>
          </View>
        </>
      )}
    </View>
  );
};

export default ClassCard;
