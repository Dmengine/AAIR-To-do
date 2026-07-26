import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AddTaskScreen } from "../screens/AddTaskScreen";
import { TaskListScreen } from "../screens/TaskListScreen";

export type RootStackParamList = {
  TaskList: undefined;
  AddTask: {
    voiceMode?: boolean;
    prefilledTitle?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
    </Stack.Navigator>
  );
}
