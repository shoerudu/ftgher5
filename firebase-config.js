const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyBKL0upnWaA-gPRds-eXkxZOwSNXlkK4f0",
  authDomain: "xbit-2e51c.firebaseapp.com",
  databaseURL: "https://xbit-2e51c-default-rtdb.firebaseio.com",
  projectId: "xbit-2e51c",
  storageBucket: "xbit-2e51c.firebasestorage.app",
  messagingSenderId: "748487321293",
  appId: "1:748487321293:web:e39fac98d217342e492b84",
  measurementId: "G-10DGWCWQCH"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = { db };
