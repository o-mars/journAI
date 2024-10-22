import React, { useState, useEffect } from 'react';
import { useRealtimeClient } from '../../contexts/RealtimeClientContext';
import { TurnDetectionServerVadType } from '@openai/realtime-api-beta/dist/lib/client';
import './ClientConfig.css';
import { addDoc, collection, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useUserPreferences } from '../../contexts/useUserPreferences';


const ClientConfig: React.FC = () => {
  const { autoStart, isPTT, isOnlyTextOutput, setAutoStart, setIsPTT, setIsOnlyTextOutput } = useUserPreferences();

  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  const toggleOptions = () => {
    setIsOptionsVisible(!isOptionsVisible);
  };

  const toggleAutoStart = () => {
    setAutoStart(autostart => !autostart);
  }

  const togglePTT = () => {
    setIsPTT(ptt => !ptt);
  }

  const toggleTextOnlyOutput = () => {
    setIsOnlyTextOutput(val => !val);
  }

  return (
    <div>
      <div className="cc-wrapper" onClick={toggleOptions}>
        Options {isOptionsVisible ? 'V' : '>'}
      </div>

      {isOptionsVisible && (
        <div className="client-config-container">
          <button onClick={togglePTT}>
            {isPTT ? 'Switch to Hands-Free' : 'Switch to Push-to-Talk'}
          </button>
          <button onClick={toggleTextOnlyOutput}>
            {isOnlyTextOutput ? 'Switch to Audio Responses' : 'Switch to Text Responses'}
          </button>
          <button onClick={toggleAutoStart}>
            {autoStart ? 'Manually Start Journal Entry' : 'Autostart Journal Entry'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientConfig;
