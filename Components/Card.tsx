import React from "react";
import { View, Text } from "react-native";

interface ClassInfo {
  Course_Name: string;
  Instructor: string;
  Time: string;
  Room: string;
  Class_type: string;
  Group: string;
  Start_Time: string;
  End_Time: string;
}

interface ClassCardProps {
  classInfo: ClassInfo;
  position?: string;
}

const ClassCard: React.FC<ClassCardProps> = ({ classInfo, position }) => {

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

  const renderSmallCard = () => (
    <View className={`${getCardStyle()} ${position === "today" ? "mx-4 my-2 w-60" : ""}`}>
      <Text className="text-lg font-medium">
        {classInfo.Start_Time} - {classInfo.End_Time}
      </Text>
      <Text className="text-base font-medium text-slate-900 my-1">
        {classInfo.Course_Name}
      </Text>
      <Text className="text-sm text-slate-900">{classInfo.Instructor}</Text>
      {classInfo.Class_type !== "Free" && (
        <Text className="text-sm underline mt-2">{classInfo.Room}</Text>
      )}
    </View>
  );

  const renderLargeCard = () => (
    <View className={getCardStyle()}>
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-medium">
          {classInfo.Start_Time} - {classInfo.End_Time}
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

  return position === "today" ? renderSmallCard() : renderLargeCard();
};

export default ClassCard;
