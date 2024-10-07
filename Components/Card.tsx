import React from "react";
import { View, Text } from "react-native";

interface ClassInfo {
  Period: string;
  Course_Name: string;
  Instructor: string;
  Room: string;
  Class_type: string;
  Group: string;
  Start_Time: string;
  End_Time: string;
}

interface ClassCardProps {
  classInfo: ClassInfo;
}

const ClassCard: React.FC<ClassCardProps> = ({ classInfo }) => {

  const getCardStyle = () => {
    let baseStyle = "mb-4 p-4 border-[1.5px] rounded-xl ";
    if (classInfo.Class_type === "Free") {
      baseStyle += "border-red-300 bg-red-50";
    } else if (classInfo.Class_type === "Lab") {
      baseStyle += "border-blue-300 bg-blue-50";
    } else {
      baseStyle += "border-green-300 bg-green-50";
    }
    return baseStyle;
  };

  const getTypeStyle = () => {
    let baseStyle = "rounded-full px-4 py-2 ";
    if (classInfo.Class_type === "Free") {
      baseStyle += "bg-red-700";
    } else if (classInfo.Class_type === "Lab") {
      baseStyle += "bg-blue-700";
    } else {
      baseStyle += "bg-green-700";
    }
    return baseStyle;
  };

  // convert 24 hour time to 12 hour time
  const convertTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <View className={getCardStyle()}>
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-medium">
          {convertTime(classInfo.Start_Time)} - {convertTime(classInfo.End_Time)}
        </Text>
        <View className={getTypeStyle()}>
          <Text className="text-white font-semibold">
            {classInfo.Class_type}
          </Text>
        </View>
      </View>
      <Text className="text-xl font-medium text-slate-900 my-1">
        {classInfo.Course_Name}
      </Text>
      <Text className="text-lg text-slate-900">{classInfo.Instructor}</Text>
      {classInfo.Class_type !== "Free" && (
        <View className="flex-row mt-2 justify-between items-center mb-2.5">
          <Text className="text-lg underline">{classInfo.Room}</Text>
        </View>
      )}
    </View>
  );
};

export default ClassCard;
