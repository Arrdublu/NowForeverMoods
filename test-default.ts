import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from './src/lib/firebase-config.js';

const app = initializeApp(firebaseConfig);
const dbDefault = getFirestore(app);
const dbApplet = getFirestore(app, "ai-studio-063bf61f-9e09-4aac-81b9-b914752a6909");

async function check(db, name) {
  try {
    const snaps = await getDocs(collection(db, "portfolio_items"));
    console.log(`Success on ${name}! Found ${snaps.size} docs.`);
  } catch (err) {
    console.log(`Failed on ${name}: ${err.message}`);
  }
}

async function run() {
  await check(dbDefault, "(default)");
  await check(dbApplet, "applet");
  process.exit(0);
}

run();
