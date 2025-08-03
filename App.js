import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ScamMap from "./src/components/ScamMap";
import ReportForm from "./src/components/ReportForm";
import ReportList from "./src/components/ReportList";
import { ReportProvider } from "./src/context/ReportContext";


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ReportProvider>

      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === "Map") {
                iconName = "map";
              } else if (route.name === "Report") {
                iconName = "create";
              } else if (route.name === "Reports") {
                iconName = "list";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#2e86de",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen name="Map" component={ScamMap} />
          <Tab.Screen name="Report" component={ReportForm} />
          <Tab.Screen name="Reports" component={ReportList} />
        </Tab.Navigator>
      </NavigationContainer>
    </ReportProvider>

  );
}
