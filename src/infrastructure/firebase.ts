import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 預留 Firebase 組態 (請用戶在此填入真實資訊)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * 實作匿名登錄以獲取用戶唯一識別
 */
export const loginAnonymously = async () => {
    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user.uid;
    } catch (error) {
        console.error('Firebase Anonymous Login Error:', error);
        return null;
    }
};
