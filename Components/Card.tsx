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
  // Card styling based on class type
  const getCardStyle = () => {
    let baseStyle =
      "mb-4 p-3 border-2 rounded-xl h-fit flex flex-col justify-between ";
    if (classInfo.Class_type === "Free") {
      baseStyle += "border-red-300 bg-red-50";
    } else if (classInfo.Class_type === "Lab") {
      baseStyle += "border-blue-300 bg-blue-50";
    } else {
      baseStyle += "border-green-300 bg-green-50";
    }
    return baseStyle;
  };

  // Class Type Badge Styling
  const getTypeStyle = () => {
    let baseStyle = "rounded-full px-3 py-2 ";
    if (classInfo.Class_type === "Free") {
      baseStyle += "bg-red-700";
    } else if (classInfo.Class_type === "Lab") {
      baseStyle += "bg-blue-700";
    } else {
      baseStyle += "bg-green-700";
    }
    return baseStyle;
  };

  function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt: string) {
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    });
  }

  // Render duration badges
  const renderDurations = () => {
    const durations = Array(classInfo.Class_Count)
      .fill(0)
      .map((_, index) => (
        <View
          key={index}
          className={`bg-gray-200 rounded-full px-3 py-1 mb-1 ${
            classInfo.Class_Count >= 3 ? "w-16" : "gap-x-1"
          }`}
        >
          <Text
            className={`text-gray-600 font-medium ${
              classInfo.Class_Count >= 3 ? "text-xs" : "text-sm"
            }`}
          >
            {classInfo.Class_Duration} min
          </Text>
        </View>
      ));

    return durations.reverse();
  };

  return (
    <View className={getCardStyle()}>
      <View className="">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-medium text-gray-900">
            {convertTime(classInfo.Start_Time)} -{" "}
            {convertTime(classInfo.End_Time)}
          </Text>
          <View className={getTypeStyle()}>
            <Text className="text-gray-200 font-medium text-xs capitalize">
              {classInfo.Class_type}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-end">
        {classInfo.Class_type !== "Free" ? (
          <>
            <View className="flex-1">
              <Text className="text-xl my-1 font-medium text-gray-800">
                {toTitleCase(classInfo.Course_Name)}
              </Text>
              <Text className="text-base text-slate-700">
                By {toTitleCase(classInfo.Instructor)}
              </Text>
              <Text className="text-base underline text-zinc-900">
                Building {classInfo.Building} : {classInfo.Room}
              </Text>
            </View>
            <View className="ml-3 items-end">{renderDurations()}</View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center h-24">
            <Text className="text-xl font-medium text-gray-700">Free Time</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ClassCard;
