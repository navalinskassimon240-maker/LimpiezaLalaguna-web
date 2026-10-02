import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "sound-theme-h2l12",
  appId: "1:178894464146:web:b29cda43561cfef01eb24b",
  apiKey: "AIzaSyCKqgTTtQGmSCX-dEIQqnV664PCtPEh7C8",
  authDomain: "sound-theme-h2l12.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-limpiezalalaguna-823d3214-6a91-4fbb-9f51-c719253999b1",
  storageBucket: "sound-theme-h2l12.firebasestorage.app",
  messagingSenderId: "178894464146",
  measurementId: "",
  oAuthClientId: "178894464146-h12eghnl08ti0b8rj63ud3vei4ep09gv.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test Firestore connection on boot
(async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline or connecting:", error.message);
    }
  }
})();

export default app;
