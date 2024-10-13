import React, { useState, useEffect } from 'react';
import Note from '../Note/Note';
import WriteNote from '../WriteNote/WriteNote';
import './Notes.css';
import Logout from '../Logout/Logout';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Note {
  id: string;
  content: string;
}

const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);  // Track the current note being edited

  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);  // The current note being displayed
  const [history, setHistory] = useState<string[]>([]); // History of clicked notes
  const [historyIndex, setHistoryIndex] = useState<number>(-1);  // To track the user's position in the history

  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    } else {
      // Set up real-time Firestore listener
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/notes`),
        orderBy("lastModifiedAt", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({ id: doc.id, content: doc.data().content }) );
        setNotes(notes); // Automatically updates when Firestore changes
      });
      
      return () => unsubscribe();
    }
  }, [navigate]);

  const addOrUpdateNote = (newNoteContent: string) => {
    if (currentNote) {
      // Update the existing note
      const updatedNotes = notes.map(note =>
        note.id === currentNote.id ? { ...note, content: newNoteContent } : note
      );
      setNotes(updatedNotes);
    } else {
      // Add a new note
      const newNote = {
        id: Date.now().toString(),  // Simple id generation
        content: newNoteContent,
      };
      setNotes([...notes, newNote]);
    }
    setCurrentNote(null);  // Clear after saving
  };

  const handleNoteClick = (note: Note) => {
    setCurrentNote(note);  // Load the selected note for editing
  };

  const deleteNote = (noteId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (confirmed) {
      setNotes(notes.filter(note => note.id !== noteId));
      setCurrentNote(null);  // Clear the editor if the current note is deleted
    }
  };

  const clearNote = () => {
    setCurrentNote(null);  // Clear the editor for new note creation
  };

  // Function to load a new note
  const loadNote = (noteId: string) => {
    const noteExists = notes.some(note => note.id === noteId);
    if (noteExists) {
      setCurrentNoteId(noteId);
      // Update history only if we're not going back/forward
      if (historyIndex === -1 || noteId !== history[historyIndex]) {
        const updatedHistory = [...history.slice(0, historyIndex + 1), noteId];  // Trim forward history
        setHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
      }
    }
  };

  // Function for the "Back" button
  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentNoteId(history[historyIndex - 1]);
    }
  };

  // Function for the "Forward" button
  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentNoteId(history[historyIndex + 1]);
    }
  };

  const handleLinkClick = (noteId: string) => {
    loadNote(noteId);  // Load the clicked note
  };

  return (
    <div>
      <Logout />
      <h1>Notes</h1>
      <WriteNote 
        addNote={addOrUpdateNote} 
        clearNote={clearNote}
        currentNoteId={currentNoteId}
        deleteNote={deleteNote} 
        onLinkClick={handleLinkClick}
        notes={notes}
      />
      <div className="notes-container">
        {notes.map(note => (
          <div key={note.id} onClick={() => loadNote(note.id)}>
            <Note text={note.content} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesApp;
