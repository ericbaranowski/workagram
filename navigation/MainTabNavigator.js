import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "react-navigation";

import TabBarIcon from "../components/TabBarIcon";

import { createGlideStackNavigator as createEmployeesScreen } from "glide-embed-employees";
import { createGlideStackNavigator as createEmployeeScreen } from "glide-embed-employee";
import { createGlideStackNavigator as createImagesScreen } from "glide-embed-images";

const EmployeesScreen = createEmployeesScreen();
const EmployeeScreen = createEmployeeScreen();
const ImagesScreen = createImagesScreen();

const tabBarIcon = ({ ios, android }) => ({ focused }) => (
  <TabBarIcon
    focused={focused}
    name={Platform.OS === "ios" ? ios(focused) : android(focused)}
  />
);

EmployeesScreen.navigationOptions = {
  tabBarLabel: "Employees",
  tabBarIcon: tabBarIcon({
    ios: focused => `ios-information-circle${focused ? "" : "-outline"}`,
    android: () => "md-information-circle"
  })
};

ImagesScreen.navigationOptions = {
  tabBarLabel: "Photos",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === "ios"
          ? `ios-link${focused ? "" : "-outline"}`
          : "md-link"
      }
    />
  )
};

EmployeeScreen.navigationOptions = {
  tabBarLabel: "Me",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === "ios"
          ? `ios-options${focused ? "" : "-outline"}`
          : "md-options"
      }
    />
  )
};

export default createBottomTabNavigator({
  EmployeesScreen,
  ImagesScreen,
  EmployeeScreen
});
