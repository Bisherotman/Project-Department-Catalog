import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmUg1cQ4HTa0wEThuZAncYOwyZRFtnlsU",
  authDomain: "projects-catalog.firebaseapp.com",
  projectId: "projects-catalog",
  storageBucket: "projects-catalog.appspot.com",
  messagingSenderId: "813379257336",
  appId: "1:813379257336:web:b2372449cbe46e15c20c0d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
