import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AddTaskScreen } from "../screens/AddTaskScreen";
import { TaskDetailScreen } from "../screens/TaskDetailScreen";
import { TaskListScreen } from "../screens/TaskListScreen";

type TaskDetailParams = {
  taskId: string;
};

type AddTaskParams = {
  voiceMode?: boolean;
  prefilledTitle?: string;
  taskId?: string;
};

export type RootStackParamList = {
  TaskList: undefined;
  AddTask: AddTaskParams;
  TaskDetail: TaskDetailParams;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}
