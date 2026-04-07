import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10,
        fontWeight: focused ? '600' : '400',
        color: focused ? Colors.accent : Colors.textTertiary,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Today" emoji="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="muscles"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Muscles" emoji="🫀" focused={focused} /> }}
      />
      <Tabs.Screen
        name="plan"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Plan" emoji="📅" focused={focused} /> }}
      />
      <Tabs.Screen
        name="library"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Library" emoji="📚" focused={focused} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Progress" emoji="📊" focused={focused} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Settings" emoji="⚙️" focused={focused} /> }}
      />
    </Tabs>
  );
}
