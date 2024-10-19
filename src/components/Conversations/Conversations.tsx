import { useEffect, useRef, useCallback, useState } from 'react';

import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../../lib/wavtools/index.js';

import React from 'react';
import { useRealtimeClient } from '../../contexts/RealtimeClientContext';
import { auth, db } from '../../firebaseConfig';
import { addDoc, collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import './Conversations.css';

interface Message {
  from: string;
  message: string;
  timestamp: Date;
}

export function Conversations() {
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );

  const [items, setItems] = useState<ItemType[]>([]);
  const [convoId, setConvoId] = useState<string>();
  const { client, finishConversationCallbacks } = useRealtimeClient();

  const deleteConversationItem = useCallback(async (id: string) => {
    client && client.deleteItem(id);
  }, []);

  const createNewConversation = async () => {
    if (!auth.currentUser) return;
    try {
      const conversationRef = await addDoc(collection(db, `users/${auth.currentUser.uid}/conversations`), {
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        title: `Journal Entry: ${format(new Date(), 'do MMM yy')}`,
      });
  
      // The document ID generated is your conversationId
      const conversationId = conversationRef.id;
      setConvoId(conversationId);
      console.log("New conversation created with ID: ", conversationId);
  
      return conversationId;
    } catch (e) {
      console.error("Error creating conversation: ", e);
    }  
  }

  const addMessageToConversation = async (message: Message) => {
    if (!auth.currentUser) return;
    try {
      const messageRef = await addDoc(collection(db, `users/${auth.currentUser.uid}/conversations/${convoId}/messages`), message);  
      console.log("Message written with ID: ", messageRef.id);
    } catch (e) {
      console.error("Error adding message: ", e);
    }
  }

  const saveConversationSummary = async () => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, `users/${auth.currentUser.uid}/conversations/${convoId}/`), {
        summary: {
         content: 'foo', 
         lastUpdated: serverTimestamp(),
        }
      });
  
      console.log("Conversation summary saved.");
    } catch (e) {
      console.error("Error saving conversation summary: ", e);
    }
  };

  useEffect(() => {
    // Register a callback for when the conversation ends
    finishConversationCallbacks(() => {
      console.log("Conversation ended, post-processing...");
      saveConversationSummary();
      setConvoId('');
    });
  }, [finishConversationCallbacks]);

  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  useEffect(() => {
    const wavStreamPlayer = wavStreamPlayerRef.current;
    wavStreamPlayer.connect();

    if (client) {
      console.log('setting up event handlers for client');
      client.on('error', (event: any) => console.error(event));
      client.on('conversation.created', async () => {
        console.log('convo created log');
        if (auth.currentUser) {
          createNewConversation();
        }
      });
      client.on('conversation.interrupted', async () => {
        const trackSampleOffset = await wavStreamPlayer.interrupt();
        if (trackSampleOffset?.trackId) {
          const { trackId, offset } = trackSampleOffset;
          await client.cancelResponse(trackId, offset);
        }
      });
      client.on('response.done', async (event: any) => {
        console.log('got a new response...', event);
      });
      client.on('conversation.updated', async ({ item, delta }: any) => {
        const items = client.conversation.getItems();
        if (delta?.audio) {
          wavStreamPlayer.add16BitPCM(delta.audio, item.id);
        }
        if (item.status === 'completed' && item.formatted.audio?.length) {
          const wavFile = await WavRecorder.decode(
            item.formatted.audio,
            24000,
            24000
          );
          item.formatted.file = wavFile;
          console.log('new item?', item);
        }
        setItems(items);
      });
  
      setItems(client.conversation.getItems());
    }

    return () => {
      client && client.reset();
    };
  }, []);

  return (
    <div className="content-block conversation">
      <div className="content-block-title">Journal Entry</div>
      <div className="content-block-body" data-conversation-content>
        {items.map((conversationItem, i) => {
          return (
            <div className="conversation-item" key={conversationItem.id}>
              <div className={`speaker ${conversationItem.role || ''}`}>
                <div>
                  {(
                    conversationItem.role || conversationItem.type
                  ).replace('_', ' ').replace('assistant', 'JournAI').replace('user', 'User')}
                </div>
                <div
                  className="close"
                  onClick={() =>
                    deleteConversationItem(conversationItem.id)
                  }
                >
                </div>
              </div>
              <div className={`speaker-content`}>
                {conversationItem.type === 'function_call_output' && (
                  <div>{conversationItem.formatted.output}</div>
                )}
                {!!conversationItem.formatted.tool && (
                  <div>
                    {conversationItem.formatted.tool.name}(
                    {conversationItem.formatted.tool.arguments})
                  </div>
                )}

                {!conversationItem.formatted.tool &&
                  conversationItem.role === 'user' && (
                    <div>
                      {conversationItem.formatted.transcript ||
                        (conversationItem.formatted.audio?.length
                          ? '(awaiting transcript)'
                          : conversationItem.formatted.text ||
                            '(item sent)')}
                    </div>
                  )}
                {!conversationItem.formatted.tool &&
                  conversationItem.role === 'assistant' && (
                    <div>
                      {conversationItem.formatted.transcript ||
                        conversationItem.formatted.text ||
                        '(truncated)'}
                    </div>
                  )}
                {conversationItem.formatted.file && (
                  <audio
                    src={conversationItem.formatted.file.url}
                    controls
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
