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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && client && client.isConnected()) finishConversation();
    });

    return () => unsubscribe();
  }, [auth]);

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
      updateAudioOutputMode();
    }
  }, [hasLoaded, isOnlyTextOutput]);

  const updateAudioInputMode = (isPTT: boolean) => client && client.updateSession({ turn_detection: isPTT ? null : { type: 'server_vad'}});

  const updateAudioOutputMode = async () => {
    if (!client) return;
    const wasAlreadyConnected = client.isConnected();
    if (wasAlreadyConnected) client.disconnect();
    if (wasAlreadyConnected) connect();
  }

  const getModalities = () => {
    const modalities = ['text'];
    if (!isOnlyTextOutput) modalities.push('audio');
    return modalities;
  }

  const initClient = async () => {
    await connect();
    updateAudioInputMode(isPTT);
    await updateAudioOutputMode();
  }

  const connect = async () => {
    if (!client) return;
    await client.connect();
    const modalities = getModalities();
    client.updateSession({
      instructions,
      modalities,
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
