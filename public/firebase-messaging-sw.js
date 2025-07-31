// This is required for Firebase Messaging to work in the background
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

// Initialize Firebase inside the Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyBe_N_pMAS9EDgZ0TGmS2tXiP7rBm2Fjk0",
  authDomain: "busybeancoffee.firebaseapp.com",
  projectId: "busybeancoffee",
  storageBucket: "busybeancoffee.firebasestorage.app",
  messagingSenderId: "448906342814",
  appId: "1:448906342814:web:0bfffa4fcdbe5efeaba68f",
  measurementId: "G-CK9FG55D1Z",
});

// Get messaging instance
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // Optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
