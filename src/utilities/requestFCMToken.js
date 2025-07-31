import { getMessagingInstance, getToken } from "./firebase";
import { error_toaster } from "./Toaster";

export const requestDeviceToken = async () => {
  try {
    // ✅ checking permissions here
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      error_toaster("Firebase notification permission not granted");
      return null;
    }

    // ✅ Wait for messaging to be initialized and supported
    const messaging = await getMessagingInstance();
    if (!messaging) {
      error_toaster("FCM is not supported on this browser.");
      return null;
    }

    // ✅ Register service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    // ✅ Get the FCM token
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BPuu7511VH7pbV7VsFCXoSHW_2Z-A0mCSsz4kr-ZuYFC1qevEnM9LM7iPYvN7Jy4pCqauM-VaGS2YotmMT_b5Yc",
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      localStorage.setItem("devToken", currentToken);
      return currentToken;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("🔥 Error getting FCM token", err);
    return null;
  }
};
