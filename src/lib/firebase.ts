import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';

const config = {
  ...firebaseConfig,
  databaseURL: firebaseConfig.databaseURL || `https://${firebaseConfig.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`
};

const app = initializeApp(config);
export const db = getFirestore(app, "default");
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
