import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const createLog = async (user, action, module) => {
  try {
    await addDoc(collection(db, 'logs'), {
      user: user || 'Admin',
      action,
      module,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Log creation failed', error);
  }
};
