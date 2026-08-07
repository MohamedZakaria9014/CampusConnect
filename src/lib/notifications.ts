import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behaviorrr
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  let token: string | null = null;

  if (Platform.OS === "web") {
    return null;
  }

  const settings: any = await Notifications.getPermissionsAsync();
  let granted = settings.granted || settings.status === "granted";

  if (!granted) {
    const request: any = await Notifications.requestPermissionsAsync();
    granted = request.granted || request.status === "granted";
  }

  if (!granted) {
    console.warn("Failed to get push token for notification!");
    return null;
  }

  try {
    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    token = pushTokenData.data;
  } catch (error) {
    console.warn("Error fetching Expo Push Token:", error);
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6366F1",
    });
  }

  return token;
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger: null, // Send immediately
  });
}
