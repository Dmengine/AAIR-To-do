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

type AppNavigatorProps = {
  toggleTheme: () => void;
  isDarkMode: boolean;
};

export function AppNavigator({ toggleTheme, isDarkMode }: AppNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskList">
        {(props) => <TaskListScreen {...props} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}
      </Stack.Screen>
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}
