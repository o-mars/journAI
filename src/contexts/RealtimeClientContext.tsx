import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { instructions } from '../utils/conversation_config';
import { useUserPreferences } from './useUserPreferences';

interface RealtimeClientContextValue {
  client: RealtimeClient | null;
  finishConversationCallbacks: (callback: () => void) => void;
  finishConversation: () => void;
  startConversationCallbacks: (callback: () => void) => void;
  startConversation: () => void;
}

const RealtimeClientContext = createContext<RealtimeClientContextValue>(null!);

export const useRealtimeClient = () => useContext(RealtimeClientContext);

interface RealtimeClientProviderProps {
  children: ReactNode;
}

export const RealtimeClientProvider = ({ children }: RealtimeClientProviderProps) => {
  const [client, setClient] = useState<RealtimeClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [finishConversationCallbacks, setFinishConversationCallbacks] = useState<(() => void)[]>([]);
  const [startConversationCallbacks, setStartConversationCallbacks] = useState<(() => void)[]>([]);
  const { autoStart, isPTT, isOnlyTextOutput, hasLoaded } = useUserPreferences();

  useEffect(() => {
    if (hasLoaded) {

    }
  }, [hasLoaded, autoStart, isPTT, isOnlyTextOutput]);

  useEffect(() => {
    if (hasLoaded) {
      if (client && !client.isConnected() && autoStart) startConversation();
    }
      // if yes, connect if not, and push some initial prompt to get the first response going
    // If no (yes->no), do nothing, other than remembering this setting for next time

  }, [hasLoaded, autoStart]);

  useEffect(() => {
    if (hasLoaded) {
      updateAudioInputMode(isPTT);
    }
  }, [hasLoaded, isPTT]);

  useEffect(() => {
    if (hasLoaded) {
      updateAudioOutputMode(isOnlyTextOutput);
    }
  }, [hasLoaded, isOnlyTextOutput]);

  const updateAudioInputMode = (isPTT: boolean) => client && client.updateSession({ turn_detection: isPTT ? null : { type: 'server_vad'}});

  const updateAudioOutputMode = async (isOnlyTextOutput: boolean) => {
    if (!client) return;
    const wasAlreadyConnected = client.isConnected();
    if (wasAlreadyConnected) client.disconnect();
    const modalities = ['text'];
    if (!isOnlyTextOutput) modalities.push('audio');
    client.updateSession({ modalities});
    if (wasAlreadyConnected) connect();
  }

  const initClient = async () => {
    await connect();
    updateAudioInputMode(isPTT);
    await updateAudioOutputMode(isOnlyTextOutput);
  }

  const connect = async () => {
    if (!client) return;
    await client.connect();
    client.updateSession({
      instructions,
      voice: 'shimmer',
      max_response_output_tokens: 1024,
      input_audio_transcription: { model: 'whisper-1' }
    });
  }

  const registerCallbackForFinishConversation = useCallback(
    (callback: () => void) => {
      setFinishConversationCallbacks((prev) => [...prev, callback]);
    },
    [setFinishConversationCallbacks]
  );

  const finishConversation = async () => {
    await client?.disconnect();
    finishConversationCallbacks.forEach((callback) => callback());
    // setFinishConversationCallbacks([]); // Clear callbacks after triggering?
  };

  const registerCallbackForStartConversation = useCallback(
    (callback: () => void) => {
      setStartConversationCallbacks((prev) => [...prev, callback]);
    },
    [setStartConversationCallbacks]
  );

  const startConversation = async () => {
    await initClient();
    // await client?.waitForSessionCreated();
    // await client?.sendUserMessageContent([{ type: 'input_text', text: `Hey` }]);
    startConversationCallbacks.forEach((callback) => callback());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (isAuthenticated) {
      const newClient = new RealtimeClient({
        url: process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '',
      });

      newClient.updateSession({ instructions });
      newClient.updateSession({ voice: 'shimmer' });
      newClient.updateSession({ max_response_output_tokens: 1024 });
      console.log(newClient.sessionConfig);

      setClient(newClient);

      // Optionally connect the client here (TODO remove)
      // newClient.connect().then((_) => console.log('connected to RT openAI client')).catch((err) => console.error('Error connecting:', err));

      return () => {
        newClient.disconnect();
      };
    }
  }, [isAuthenticated]);

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <RealtimeClientContext.Provider value={{client, finishConversationCallbacks: registerCallbackForFinishConversation, finishConversation, startConversationCallbacks: registerCallbackForStartConversation, startConversation}}>
      {children}
    </RealtimeClientContext.Provider>
  );
};
