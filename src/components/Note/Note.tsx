import React from 'react';
import './Note.css'; // Optional for separate styling

interface NoteProps {
  text: string;
}

const Note: React.FC<NoteProps> = ({ text }) => {
  return (
    <div className="note-container">
      <p>{text}</p>
    </div>
  );
};

export default Note;
