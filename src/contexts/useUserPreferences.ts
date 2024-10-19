import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const useUserPreferences = () => {
  const [autoStart, setAutoStart] = useState(false);
  const [isPTT, setIsPTT] = useState(false);
  const [isOnlyTextOutput, setIsOnlyTextOutput] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, `users/${user.uid}`);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const preferences = userDoc.data().preferences;
            setAutoStart(preferences.autoStart);
            setIsPTT(preferences.isPTT);
            setIsOnlyTextOutput(preferences.isOnlyTextOutput);
            console.log('preferences loaded');
          } else {
            console.log('No preferences found');
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setHasLoaded(true);
      }
    };

    fetchPreferences();
  }, []);

  const saveUserPreferences = async () => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, `users/${auth.currentUser.uid}`), {
        preferences: {
          autoStart,
          isPTT,
          isOnlyTextOutput,
          lastUpdated: serverTimestamp(),
        }
      }, { merge: true });

      console.log("Preferences saved.");
    } catch (e) {
      console.error("Error saving preferences: ", e);
    }
  };

  useEffect(() => {
    if (hasLoaded) {
      saveUserPreferences();
    }
  }, [autoStart, isPTT, isOnlyTextOutput, hasLoaded])

  return { autoStart, setAutoStart, isPTT, setIsPTT, isOnlyTextOutput, setIsOnlyTextOutput, hasLoaded };
};