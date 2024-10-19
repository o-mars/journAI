import React from 'react';
import { RealtimeClientProvider } from '../../contexts/RealtimeClientContext';
import { Conversations } from '../Conversations/Conversations';
import { TextInput } from '../TextInput/TextInput';
import { AudioInput } from '../AudioInput/AudioInput';
import Logout from '../Logout/Logout';

import './Main.css';

export function Main() {
  return (
    <RealtimeClientProvider>
      <Logout />
      {/* <ClientConfig /> */}
      <AudioInput />
      <TextInput />
      <Conversations />
    </RealtimeClientProvider>
  );
}
