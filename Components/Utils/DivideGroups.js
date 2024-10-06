import AsyncStorage from "@react-native-async-storage/async-storage";

export async function divideSchedule(schedule, Group) {
    console.log("Dividing schedule into groups...");

    const groups = { Group1: {}, Group2: {} };
    await AsyncStorage.setItem("ID",schedule.ID)
    Object.keys(schedule.schedule).forEach((day) => {
        groups.Group1[day] = [];
        groups.Group2[day] = [];
        schedule.schedule[day].forEach((classInfo) => {
            const group = classInfo.Group.replace(/\s/g, ""); // Remove any spaces (e.g., "Group 1" -> "Group1")
            if (group === "Group1" || group === "All")
                groups.Group1[day].push(classInfo);
            if (group === "Group2" || group === "All")
                groups.Group2[day].push(classInfo);
        });
    });

    try {
        if (Group === "Group 1")
            await AsyncStorage.setItem("GroupSchedule", JSON.stringify(groups.Group1));
        else
            await AsyncStorage.setItem("GroupSchedule", JSON.stringify(groups.Group2));
        console.log("Schedules saved to AsyncStorage");
    } catch (error) {
        console.error("Error saving schedules:", error);
    }

    return "Divide Done!!";
}
