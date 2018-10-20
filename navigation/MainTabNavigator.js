import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "react-navigation";

import TabBarIcon from "../components/TabBarIcon";
import FetchContextScreen from "../components/FetchContextScreen";

import { createGlideStackNavigator as createEmployeesScreen } from "glide-employees";
import { createGlideStackNavigator as createEmployeeScreen } from "glide-employee";
import { createGlideStackNavigator as createPhotosScreen } from "glide-photos";


const EmployeesScreen = () =>
  <FetchContextScreen
    component={createEmployeesScreen()}
    url="https://raw.githubusercontent.com/heyglide/workagram/master/data/employees.json"
  />;

const EmployeeScreen = createEmployeeScreen();

const ImagesScreen = () =>
  <FetchContextScreen
    component={createPhotosScreen()}
    url="https://raw.githubusercontent.com/heyglide/workagram/master/data/images.json"
  />;

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
