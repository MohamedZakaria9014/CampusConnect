import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';

let notificationsModule: typeof import('expo-notifications') | null = null;
let isHandlerInitialized = false;

function getNotificationsModule(): typeof import('expo-notifications') | null {
  if (Platform.OS === 'web') {
    return null;
  }

  // In Expo Go on Android (SDK 53+), remote push notifications were removed.
  // Importing or invoking push listeners throws synchronously in Expo Go.
  if (Platform.OS === 'android' && isRunningInExpoGo()) {
    return null;
  }

  if (!notificationsModule) {
    try {
      notificationsModule = require('expo-notifications');
    } catch (error) {
      if (__DEV__) {
        console.warn('[notifications] expo-notifications is unavailable:', error);
      }
      return null;
    }
  }

  if (notificationsModule && !isHandlerInitialized) {
    try {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      isHandlerInitialized = true;
    } catch {
      // Ignored if handler setup is not supported
    }
  }

  return notificationsModule;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  // Remote push notifications are not supported in Expo Go on Android
  if (Platform.OS === 'android' && isRunningInExpoGo()) {
    return null;
  }

  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return null;
  }

  try {
    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted || settings.status === 'granted';

    if (!granted) {
      const request = await Notifications.requestPermissionsAsync();
      granted = request.granted || request.status === 'granted';
    }

    if (!granted) {
      return null;
    }

    let token: string | null = null;
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (projectId) {
      try {
        const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        token = pushTokenData.data;
      } catch (error) {
        if (__DEV__) {
          console.warn('Error fetching Expo Push Token:', error);
        }
      }
    }

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        });
      } catch {
        // Ignored on unsupported environments
      }
    }

    return token;
  } catch (error) {
    if (__DEV__) {
      console.warn('registerForPushNotificationsAsync error:', error);
    }
    return null;
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('Error scheduling local notification:', error);
    }
  }
}
