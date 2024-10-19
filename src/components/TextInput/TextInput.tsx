import { useState } from 'react';
import React from 'react';
import { useRealtimeClient } from '../../contexts/RealtimeClientContext';
import './TextInput.css';

export function TextInput() {
  const { client } = useRealtimeClient();
  const [textInput, setTextInput] = useState<string>('');

  const handleTextSubmit = async () => {
    if (textInput.trim() && client) {
      await client.sendUserMessageContent([{ type: 'input_text', text: textInput }]);
      setTextInput(''); // Clear the text input after submission
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  return (
    <div className="text-input-container">
      <input onChange={handleInputChange}
             type="text"
             value={textInput}
      />
      <button onClick={handleTextSubmit}>Send</button>
    </div>
  )
}

