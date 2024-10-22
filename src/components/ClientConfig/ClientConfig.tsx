import React, { useState, useEffect } from 'react';
import { useRealtimeClient } from '../../contexts/RealtimeClientContext';
import { TurnDetectionServerVadType } from '@openai/realtime-api-beta/dist/lib/client';
import './ClientConfig.css';
import { addDoc, collection, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useUserPreferences } from '../../contexts/useUserPreferences';

import { ReactComponent as CheckboxOff } from '../../assets/icons/checkbox-false.svg';
import { ReactComponent as CheckboxOn } from '../../assets/icons/checkbox-true.svg';
import { ReactComponent as CaretRight } from '../../assets/icons/feather-chevron-right.svg';
import { ReactComponent as CaretDown } from '../../assets/icons/feather-chevron-down.svg';

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
        Options{isOptionsVisible ? <CaretDown /> : <CaretRight />}
      </div>

      {isOptionsVisible && (
        <div className="client-config-container">
          <label className="custom-checkbox">
            <input type="checkbox" checked={isPTT} onChange={togglePTT} />
              {isPTT ? <CheckboxOn /> : <CheckboxOff />}
            <span>Push-to-Talk Mode</span>
          </label>

          <label className="custom-checkbox">
            <input type="checkbox" checked={isOnlyTextOutput} onChange={toggleTextOnlyOutput} />
            {isOnlyTextOutput ? <CheckboxOn /> : <CheckboxOff />}
            <span>Text Responses</span>
          </label>

          <label className="custom-checkbox">
            <input type="checkbox" checked={autoStart} onChange={toggleAutoStart} />
            {autoStart ? <CheckboxOn /> : <CheckboxOff />}  
            <span>Autostart Journal Entry</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default ClientConfig;
