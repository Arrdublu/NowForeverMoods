import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFd9klB4pIhRj7S7dMaFDbD9al1ezMyyE",
  authDomain: "nowforevermoods.firebaseapp.com",
  projectId: "nowforevermoods",
  storageBucket: "nowforevermoods.firebasestorage.app",
  messagingSenderId: "36897396429",
  appId: "1:36897396429:web:31f415ee087d86fe99fb84",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-063bf61f-9e09-4aac-81b9-b914752a6909");

async function run() {
  try {
    const snaps = await getDocs(collection(db, "portfolio_items"));
    console.log("Success! Found", snaps.size, "documents.");
  } catch (err: any) {
    console.error("FAIL:", err.message);
  }
}

run();
