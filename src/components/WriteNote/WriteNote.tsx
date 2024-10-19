import React, { useState, useEffect, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import './WriteNote.css';

interface WriteNoteProps {
  addNote: (note: string, id: string | null) => void;
  clearNote: () => void;
  deleteNote: (noteId: string) => void;
  currentNoteId: string | null;
  notes: Array<{ id: string; content: string }>;
  onLinkClick: (noteId: string) => void;
}

const WriteNote: React.FC<WriteNoteProps> = ({ addNote, clearNote, deleteNote, currentNoteId, onLinkClick, notes }) => {
  const [noteContent, setNoteContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({url: 'http://localhost:8081'})
  );

  useEffect(() => {
    if (currentNoteId) {
      const currentNote = notes.find(note => note.id === currentNoteId);
      if (currentNote) {
        setNoteContent(currentNote.content);
      }
    } else {
      setNoteContent('');
    }
  }, [currentNoteId, notes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteContent.trim()) {
      addNote(noteContent, currentNoteId);
      setNoteContent('');
    }
  };

  const handleClearOrDelete = () => {
    if (currentNoteId) {
      deleteNote(currentNoteId);  // If editing an existing note, delete it
    } else {
      clearNote();  // If it's a new note, just clear the content
    }
    setNoteContent('');  // Clear the editor
  };

  // Function to handle clicking on links in the note content
  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('data-id')) {
      e.preventDefault();
      const noteId = target.getAttribute('data-id');
      if (noteId) {
        onLinkClick(noteId);
      }
    }
  };

  const toggleConnectionToRelayServer = async () => {
    console.log('toggling connection to relay server...');
    const client = clientRef.current;

    if (isConnected) {
      client.disconnect();
      setIsConnected(false);
    } else {
      await client.connect();
      // client.sendUserMessageContent([
      //   {
      //     type: `input_text`,
      //     text: `Reply with Hello and a random color, nothing else`
      //   },
      // ]);
      setIsConnected(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="new-note-form">
      <div className="note-display" onClick={handleContentClick} dangerouslySetInnerHTML={{ __html: noteContent }} />
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="Start writing your note here..."
        className="note-input"
      />
      <div className="button-group">
        <button type="submit" className="submit-btn">
          {currentNoteId ? "Update Note" : "Save Note"}
        </button>
        <button type="button" className="delete-btn" onClick={handleClearOrDelete}>
          {currentNoteId ? "Delete Note" : "Clear"}
        </button>
        <button type="button" className="delete-btn" onClick={toggleConnectionToRelayServer}>
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </form>
  );
};

export default WriteNote;
