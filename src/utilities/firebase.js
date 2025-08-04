// utilities/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBe_N_pMAS9EDgZ0TGmS2tXiP7rBm2Fjk0",
  authDomain: "busybeancoffee.firebaseapp.com",
  projectId: "busybeancoffee",
  storageBucket: "busybeancoffee.firebasestorage.app",
  messagingSenderId: "448906342814",
  appId: "1:448906342814:web:0bfffa4fcdbe5efeaba68f",
  measurementId: "G-CK9FG55D1Z",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
facebookProvider.setCustomParameters({ display: "popup" });

if (typeof window !== "undefined") {
  getAnalytics(app);
}

// ✅ instead of exporting messaging directly
const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Messaging not supported in this browser.");
    return null;
  }
  return getMessaging(app);
};

export {
  auth,
  googleProvider,
  facebookProvider,
  getToken,
  onMessage,
  getMessagingInstance,
};
