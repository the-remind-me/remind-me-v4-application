import AsyncStorage from "@react-native-async-storage/async-storage";

interface Schedule {
    ID: string;
    schedule: {
        [key: string]: ClassInfo[];
    };
}

interface ClassInfo {
    Group: string;
    [key: string]: any;
}

interface Groups {
    Group1: {
        [key: string]: ClassInfo[];
    };
    Group2: {
        [key: string]: ClassInfo[];
    };
}

export async function divideSchedule(schedule: Schedule, Group: string): Promise<string> {
    const groups: Groups = { Group1: {}, Group2: {} };
    await AsyncStorage.setItem("ID", schedule.ID);
    await AsyncStorage.setItem("Group", Group);

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
        const groupSchedule = Group === "Group 1" ? groups.Group1 : groups.Group2;
        await AsyncStorage.setItem("GroupSchedule", JSON.stringify(groupSchedule));
    } catch (error) {
        console.error("Error saving schedules:", error);
    }

    return "Divide Done!!";
}
