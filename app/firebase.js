// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTuHFb1b82_yEOgdwbRKmxdr8eUeRcNjs",
  authDomain: "headstarter-pantry-app-a8ec4.firebaseapp.com",
  projectId: "headstarter-pantry-app-a8ec4",
  storageBucket: "headstarter-pantry-app-a8ec4.appspot.com",
  messagingSenderId: "1030202911859",
  appId: "1:1030202911859:web:56859a308ce99fbb6f4e06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {firestore, auth, googleProvider};