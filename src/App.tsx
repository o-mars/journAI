import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Notes from './components/Notes/Notes';
import Signup from './components/Signup/Signup';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './firebaseConfig';

const App: React.FC = () => {

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Persistence set to local");
      })
      .catch((error) => {
        console.error("Error setting persistence: ", error);
      });
  }, []); // Runs once when the app loads

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
