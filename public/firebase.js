// Firebase CDN modular (v12.4.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, set, get, push, child } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCv_0xIw6NrrpuwbhC7d-ryQ9PbpYgGxo",
  authDomain: "motivasi-ai.firebaseapp.com",
  databaseURL: "https://motivasi-ai-default-rtdb.firebaseio.com",
  projectId: "motivasi-ai",
  storageBucket: "motivasi-ai.firebasestorage.app",
  messagingSenderId: "461493587449",
  appId: "1:461493587449:web:dd6680fd53987843580128",
  measurementId: "G-W0BDPEP953"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Pasang ke window supaya bisa dipakai di app.js
window.db = db;
window.ref = ref;
window.push = push;
window.set = set;
window.onValue = onValue;
window.get = get;
window.child = child;