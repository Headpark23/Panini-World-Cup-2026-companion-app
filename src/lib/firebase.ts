import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";

// Public Firebase config keys (safe for frontend client code)
const firebaseConfig = {
  apiKey: "AIzaSyD5_anBBuoXtYhMfk01LcF4Ly_ipDB4s7w",
  authDomain: "gen-lang-client-0020687538.firebaseapp.com",
  projectId: "gen-lang-client-0020687538",
  storageBucket: "gen-lang-client-0020687538.firebasestorage.app",
  messagingSenderId: "50227529466",
  appId: "1:50227529466:web:bfb1fe16939e93a2b8eb43"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore targeting the specific custom databaseId as provisioned in firebase-applet-config.json
const databaseId = "ai-studio-12b4ff61-87df-4230-ba92-e6ffa0c1b81e";
export const db = initializeFirestore(app, {}, databaseId);

// CRITICAL CONSTRAINT: Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration or connection.", error);
    }
  }
}
testConnection();
