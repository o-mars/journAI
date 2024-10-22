import React, { useEffect, useState } from 'react';
import { RealtimeClientProvider, useRealtimeClient } from '../../contexts/RealtimeClientContext';
import { Conversations } from '../Conversations/Conversations';
import { TextInput } from '../TextInput/TextInput';
import { AudioInput } from '../AudioInput/AudioInput';
import Logout from '../Logout/Logout';

import './Main.css';
import ClientConfig from '../ClientConfig/ClientConfig';

export function Main() {
  const [isActive, setIsActive] = useState(false);
  const { client, startConversationCallbacks, startConversation, finishConversationCallbacks, finishConversation } = useRealtimeClient();

  useEffect(() => {
    startConversationCallbacks(() => {
      setIsActive(true);
    });
  }, [startConversationCallbacks])

  useEffect(() => {
    finishConversationCallbacks(() => {
      setIsActive(false);
    });
  }, [finishConversationCallbacks])

  return (
    <div className="main-container">
      {isActive && (
        <>
          <button className="main-button finish" onClick={finishConversation}>Finish Entry</button>
          <AudioInput />
          <Conversations />
          <TextInput />
        </>
      )}
      {!isActive && (
        <>
          <button className="main-button start" onClick={startConversation}>Start Entry</button>
          <ClientConfig />
        </>
      )}
    </div>
  );
}
