import React, { useState, useEffect } from 'react';
import { useRealtimeClient } from '../../contexts/RealtimeClientContext';
import { TurnDetectionServerVadType } from '@openai/realtime-api-beta/dist/lib/client';
import './ClientConfig.css';
import { addDoc, collection, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useUserPreferences } from '../../contexts/useUserPreferences';


const ClientConfig: React.FC = () => {
  const { client, finishConversation } = useRealtimeClient();
  const { autoStart, isPTT, isOnlyTextOutput, setAutoStart, setIsPTT, setIsOnlyTextOutput, hasLoaded } = useUserPreferences();

  const [isConnected, setIsConnected] = useState(false);

  const toggleAutoStart = () => {
    setAutoStart(autostart => !autostart);
  }

  const togglePTT = () => {
    setIsPTT(ptt => !ptt);
  }

  const toggleTextOnlyOutput = () => {
    setIsOnlyTextOutput(val => !val);
  }

  useEffect(() => {
    if (hasLoaded && autoStart && client && client.isConnected()) setIsConnected(true);
  }, [autoStart, hasLoaded]);

  const toggleClientConnection = async () => {
    if (!client) return;
    if (isConnected && client.isConnected()) {
      client.disconnect();
      finishConversation();
    } else if (!isConnected) {
      await client.connect();
      client.updateSession({ input_audio_transcription: { model: 'whisper-1' } }); // TODO: Needs to be set after connect
    }
    setIsConnected(client.isConnected());
  }

  return (
    <div className="client-config-container">
      <button onClick={togglePTT}>{ isPTT ? 'Switch to Hands-Free' : 'Switch to Push-to-Talk'}</button>
      <button onClick={toggleTextOnlyOutput}>{ isOnlyTextOutput ? 'Switch to Audio Responses' : 'Switch to Text Responses'}</button>
      <button onClick={toggleAutoStart}>{ autoStart ? 'Manually Start Journal Entry' : 'Autostart Journal Entry'}</button>
      <button onClick={toggleClientConnection}>{ isConnected ? 'Finish Entry' : 'Start Entry' }</button>
    </div>
  );
};

export default ClientConfig;
